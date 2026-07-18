type Palette = 'viridis' | 'plasma' | 'cividis' | 'magma' | 'inferno';

type TooltipFormatter = (cell: HeatmapCell, context: HeatmapContext) => string;

interface HeatmapCell {
    row: string | number;
    col: string | number;
    value: number;
    meta?: Record<string, unknown>;
}
interface HeatmapContext {
    rowLabel?: string;
    colLabel?: string;
    valueLabel?: string;
    description?: string;
}
interface HeatmapOptions {
    palette?: Palette;
    tooltipFormatter?: TooltipFormatter;
}

declare class Heatmap {
    private el;
    private static instanceCount;
    private readonly id;
    private svg;
    private table;
    private tooltip;
    private data;
    private context;
    private palette;
    private cleanupKeyboard;
    private cleanupTooltip;
    constructor(el: HTMLElement, options?: HeatmapOptions);
    load(data: unknown, context?: HeatmapContext): void;
    private render;
    destroy(): void;
}

export { Heatmap };
