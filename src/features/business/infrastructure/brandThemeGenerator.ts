import { blendHex } from "@/shared/utils/color";

interface BrandThemeResult {
  ui: { bg: string; text: string };
  map: {
    land: string;
    water: string;
    waterway: string;
    parks: string;
    buildings: string;
    aeroway: string;
    roads: {
      major: string;
      minor_high: string;
      minor_mid: string;
      minor_low: string;
      path: string;
      outline: string;
    };
  };
}

/**
 * Generate a complete map theme from 3 brand colours.
 * primary → land/background, secondary → roads/text, accent → water/parks
 */
export function generateBrandTheme(
  primary: string,
  secondary: string,
  accent: string,
): BrandThemeResult {
  return {
    ui: {
      bg: primary,
      text: secondary,
    },
    map: {
      land: primary,
      water: accent,
      waterway: accent,
      parks: blendHex(primary, accent, 0.3),
      buildings: blendHex(primary, secondary, 0.15),
      aeroway: blendHex(primary, accent, 0.2),
      roads: {
        major: secondary,
        minor_high: blendHex(secondary, primary, 0.2),
        minor_mid: blendHex(secondary, primary, 0.4),
        minor_low: blendHex(secondary, primary, 0.6),
        path: blendHex(secondary, primary, 0.7),
        outline: blendHex(primary, secondary, 0.1),
      },
    },
  };
}
