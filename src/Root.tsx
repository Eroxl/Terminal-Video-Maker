import { Composition, Sequence, Audio, getStaticFiles, staticFile } from "remotion";
import * as AsciinemaPlayer from 'asciinema-player';

import AsciinemaVideo from "./AsciinemaVideo";

import "./index.css";

const AsciinemaComp = () => {
  console.log(staticFile('/background-track.mp4') );

  return (
    <>
      <Sequence>
        <AsciinemaVideo />
        <Audio src={staticFile('/mixed-audio.aac')} volume={0.8} />
        {
          getStaticFiles().find((f) => f.name === 'background-track.mp4') && (
            <Audio src={staticFile('/background-track.mp4')} loop volume={0.8} />
          )
        }
      </Sequence>
    </>
  )
}

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id={"AsciinemaVideo"}
        component={AsciinemaComp}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        calculateMetadata={async () => {
          const wrapper = document.createElement("div");
          wrapper.style.display = "none";
          document.firstElementChild?.appendChild(wrapper);

          const player = AsciinemaPlayer.create(staticFile('/main.cast'), wrapper, {
            preload: true,
            autoPlay: true,
          });

          return new Promise<Record<string, any>>(
            (resolve) => {
              player.addEventListener('play', () => {
                const duration = player.getDuration();

                resolve({
                  durationInFrames: Math.ceil(duration * 30)
                })
              })
            }
          )
        }}
      />
    </>
  );
};
