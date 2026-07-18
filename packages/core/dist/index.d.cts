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
    private svg;
    private data;
    private palette;
    constructor(el: HTMLElement, options?: HeatmapOptions);
    load(data: unknown, _context?: HeatmapContext): void;
    private render;
    destroy(): void;
}

export { Heatmap };
