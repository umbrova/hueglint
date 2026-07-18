import {
  interpolateViridis,
  interpolatePlasma,
  interpolateCividis,
  interpolateMagma,
  interpolateInferno,
} from 'd3-scale-chromatic';

export type Palette = 'viridis' | 'plasma' | 'cividis' | 'magma' | 'inferno';

const PALETTES: Record<Palette, (t: number) => string> = {
  viridis: interpolateViridis,
  plasma: interpolatePlasma,
  cividis: interpolateCividis,
  magma: interpolateMagma,
  inferno: interpolateInferno,
};

export function isValidPalette(value: unknown): value is Palette {
  return typeof value === 'string' && value in PALETTES;
}

export function getColorScale(palette: Palette): (t: number) => string {
  return PALETTES[palette];
}