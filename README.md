# Terminal Video Maker

Create terminal session videos from asciinema with keyboard sounds and background music.

[Example](./example-video.mp4)

## Usage

1. Place your asciinema cast file (`.cast`) in the `public` directory (named `main.cast`).
2. Add your desired background music as `background-track.mp4` in the `public` directory or omit it for no background music.
3. Add your terminals font files in the `public/fonts/` directory.
4. Download keyboard sound effects and place them in the `public/audio/` directory (I use [these ones](https://github.com/tplai/kbsim/tree/master) you might need to reconfigure the script if you use different sounds).
5. Run `yarn` to install dependencies.
6. Run `yarn generate-audio` to generate the mixed audio file.
7. Run `yarn dev` to preview the video.
8. Render the final video with in the browser.
9. The final video will be in the `out` directory.
