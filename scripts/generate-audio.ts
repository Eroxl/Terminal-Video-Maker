import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const KEY_TYPE = process.env.KEY_TYPE || 'cream';
const FPS = parseInt(process.env.FPS || '60', 10);
const CAST_FILE = process.env.CAST_FILE || 'main.cast';

interface AudioChunk {
  timestamp: number; // in seconds
  type: 'keyPress' | 'keyRelease';
  keyType: string;
}

function parseCastFile(castPath: string): AudioChunk[] {
  const data = fs.readFileSync(castPath, 'utf-8');
  const lines = data.split('\n');
  const audioChunks: AudioChunk[] = [];

  lines.forEach((line) => {
    if (!line.startsWith('[')) return;

    const parsedLine = JSON.parse(line);
    const [timeStamp, type, content] = parsedLine;

    if (type !== 'i') return;

    let keyType = '';

    if (content === ' ') {
      keyType = 'SPACE';
    } else if (content === '\n' || content === '\r') {
      keyType = 'ENTER';
    } else if (content === '\x7f' || content === '\b') {
      keyType = 'BACKSPACE';
    } else {
      keyType = 'GENERIC_R' + Math.floor(Math.random() * 5);
    }

    const lastChunk = audioChunks[audioChunks.length - 1];
    const frameThreshold = 3 / FPS;
    
    if (lastChunk && Math.abs(lastChunk.timestamp - timeStamp) < frameThreshold) {
      lastChunk.timestamp = timeStamp + (2/FPS);
      return;
    }

    audioChunks.push({
      timestamp: timeStamp,
      type: 'keyPress',
      keyType,
    });

    const releaseDelay = (Math.floor(Math.random() * 3) + 2) / FPS;
    audioChunks.push({
      timestamp: timeStamp + releaseDelay,
      type: 'keyRelease',
      keyType: keyType.replace(/_R\d$/, ''),
    });
  });

  return audioChunks;
}

function getAudioFilePath(chunk: AudioChunk, publicDir: string): string {
  const folder = chunk.type === 'keyPress' ? 'press' : 'release';
  const filename = chunk.type === 'keyPress' 
    ? `${chunk.keyType}.mp3`
    : `${chunk.keyType.replace(/_R\d$/, '')}.mp3`;
  
  const finalFilename = chunk.type === 'keyRelease' && chunk.keyType.startsWith('GENERIC')
    ? 'GENERIC.mp3'
    : filename;
    
  return path.join(publicDir, 'audio', KEY_TYPE, folder, finalFilename);
}

function generateFFmpegCommand(chunks: AudioChunk[], publicDir: string, outputPath: string, totalDuration: number): string {
  const inputs: string[] = [];
  const filterParts: string[] = [];
  let validIndex = 0;
  
  const silentDuration = totalDuration + 2;
  
  chunks.forEach((chunk) => {
    const audioFile = getAudioFilePath(chunk, publicDir);
    
    if (!fs.existsSync(audioFile)) {
      return;
    }
    
    inputs.push(`-i "${audioFile}"`);
    const inputIndex = validIndex + 1;
    const delayMs = Math.round(chunk.timestamp * 1000);
    filterParts.push(`[${inputIndex}:a]adelay=${delayMs}|${delayMs},volume=10.0[a${validIndex}]`);
    validIndex++;
  });

  if (inputs.length === 0) {
    throw new Error('No valid audio files found');
  }

  const mixInputs = Array.from({ length: validIndex }, (_, i) => `[a${i}]`).join('');
  const filterComplex = filterParts.join(';') + 
    `;${mixInputs}amix=inputs=${validIndex}:duration=longest:dropout_transition=0:normalize=0,apad[mixed]` +
    `;[0:a][mixed]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[final]`;
  
  return `ffmpeg -y -f lavfi -i anullsrc=r=48000:cl=stereo:d=${silentDuration} ${inputs.join(' ')} -filter_complex "${filterComplex}" -map "[final]" -c:a aac -b:a 192k "${outputPath}"`;
}

function getVideoDuration(castPath: string): number {
  const data = fs.readFileSync(castPath, 'utf-8');
  const lines = data.split('\n').filter(line => line.startsWith('['));
  
  if (lines.length === 0) return 10;
  
  const lastLine = JSON.parse(lines[lines.length - 1]);
  return lastLine[0] + 1;
}

async function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const publicDir = path.join(projectRoot, 'public');
  const castPath = path.join(publicDir, CAST_FILE);
  const outputPath = path.join(publicDir, 'mixed-audio.aac');

  if (!fs.existsSync(castPath)) {
    throw new Error(`Cast file not found: ${castPath}`);
  }

  const chunks = parseCastFile(castPath);
  const totalDuration = getVideoDuration(castPath);
  const ffmpegCmd = generateFFmpegCommand(chunks, publicDir, outputPath, totalDuration);
  
  try {
    execSync(ffmpegCmd, { stdio: 'inherit', cwd: projectRoot });
  } catch (error) {
    process.exit(1);
  }
}

main().catch(console.error);
