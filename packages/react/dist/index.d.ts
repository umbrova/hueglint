import * as react from 'react';
import { HeatmapContext, HeatmapOptions } from '@hueglint/core';

interface HeatmapHandle {
    update: (row: string | number, col: string | number, value: number) => void;
}
interface HeatmapProps {
    data: unknown;
    context?: HeatmapContext;
    options?: HeatmapOptions;
}
declare const Heatmap: react.ForwardRefExoticComponent<HeatmapProps & react.RefAttributes<HeatmapHandle>>;

export { Heatmap, type HeatmapHandle, type HeatmapProps };
