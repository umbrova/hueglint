type Palette = 'viridis' | 'plasma' | 'cividis' | 'magma' | 'inferno';

interface HeatmapContext {
    rowLabel?: string;
    colLabel?: string;
    valueLabel?: string;
    description?: string;
}
interface HeatmapOptions {
    palette?: Palette;
}

declare class Heatmap {
    private el;
    private static instanceCount;
    private readonly id;
    private svg;
    private table;
    private data;
    private context;
    private palette;
    private cleanupKeyboard;
    constructor(el: HTMLElement, options?: HeatmapOptions);
    load(data: unknown, context?: HeatmapContext): void;
    private render;
    destroy(): void;
}

export { Heatmap };
