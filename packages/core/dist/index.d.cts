type Palette = 'viridis' | 'plasma' | 'cividis' | 'magma' | 'inferno';

interface DiffResult {
    row: string | number;
    col: string | number;
    currentValue: number;
    previousValue: number;
    delta: number;
}

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
    onError?: (error: Error) => boolean | void;
}

declare class Heatmap {
    private el;
    private static instanceCount;
    private readonly id;
    private svg;
    private table;
    private tooltip;
    private stateEl;
    private resizeObserver;
    private resizeScheduled;
    private rawData;
    private data;
    private diffs;
    private mode;
    private context;
    private palette;
    private options;
    private cleanupKeyboard;
    private cleanupTooltip;
    constructor(el: HTMLElement, options?: HeatmapOptions);
    load(data: unknown, context?: HeatmapContext): void;
    loadDiff(current: unknown, previous: unknown, context?: HeatmapContext): void;
    update(row: string | number, col: string | number, value: number): void;
    private applyAggregationAndRender;
    private handleError;
    private showState;
    private render;
    private renderDiff;
    destroy(): void;
}

export { type DiffResult, Heatmap, type HeatmapCell, type HeatmapContext, type HeatmapOptions, type Palette };
