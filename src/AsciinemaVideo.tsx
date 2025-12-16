import 'asciinema-player/dist/bundle/asciinema-player.css';
import { useCurrentFrame, useVideoConfig, staticFile, Audio, Sequence } from 'remotion';
import { useRef, useState, useEffect } from 'react';
import { create as createPlayer, AsciinemaPlayer } from 'asciinema-player';

const AsciinemaVideo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const playerRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<AsciinemaPlayer>();

  useEffect(() => {
    if (!playerRef.current) return;

    const player = createPlayer(
      staticFile('/main.cast'),
      playerRef.current,
      {
        preload: true,
        terminalFontFamily: "AndaleMono, JetBrainsMonoNerdFont, monospace",
        theme: 'nord',
        fit: 'both',
        controls: false,
      }
    );

    setPlayer(player);
  }, []);

  useEffect(() => {
    if (!player) return;

    const time = frame / fps;
    player.seek(time);
  }, [frame, fps, player]);

  return (
    <div className="bg-black w-full h-full">
      <div ref={playerRef} id="player" className="z-10 h-full w-full" />
    </div>
  );
}

export default AsciinemaVideo;

