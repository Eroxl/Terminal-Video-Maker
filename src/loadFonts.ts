import { staticFile } from "remotion";
import { getStaticFiles } from '@remotion/studio';

export interface FontDefinition {
  src: string; // The resolved static path
  family: string; // The font family name
  weight?: string; // The font weight (e.g., 400 for normal, 700 for bold)
  style?: string; // The font style (e.g., "italic", "normal")
}

/**
 * Load all .ttf font files from the public folder using getStaticFiles.
 * Automatically supports nested folders.
 * @returns An array of FontDefinition objects.
 */
export const loadFonts = (): FontDefinition[] => {
  const files = getStaticFiles(); // Get all files in the public/ folder
  const fonts: FontDefinition[] = [];

  files.forEach((file) => {
    if (file.name.endsWith('.ttf')) {
      // Parse file name to extract font details
      const fontNameMatch = file.name.match(/([a-zA-Z]+)-?([a-zA-Z]*)?(\d+)?\.ttf$/);

      if (fontNameMatch) {
        const family = fontNameMatch[1]; // Font family name (e.g., "JetBrainsMono")
        const style = fontNameMatch[2]?.toLowerCase() === 'italic' ? 'italic' : 'normal';
        const weight = fontNameMatch[3] || '400'; // Default to 400 if weight is not specified

        fonts.push({
          src: staticFile(file.name), // Resolve the font's static file path
          family,
          weight,
          style,
        });
      }
    }
  });

  return fonts;
};
