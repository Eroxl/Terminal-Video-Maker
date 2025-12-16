// This is your entry file! Refer to it when you render:
// npx remotion render <entry-file> HelloWorld out/video.mp4

import { registerRoot } from "remotion";
import { loadFont } from '@remotion/fonts';
import { RemotionRoot } from "./Root";
import { loadFonts, FontDefinition } from './loadFonts';

const fonts = loadFonts();
fonts.forEach((font: FontDefinition) => {
  loadFont({
    url: font.src,
    family: font.family,
    weight: font.weight,
    style: font.style,
  });
});

registerRoot(RemotionRoot);
