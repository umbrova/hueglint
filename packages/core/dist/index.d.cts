interface HeatmapContext {
    rowLabel?: string;
    colLabel?: string;
    valueLabel?: string;
    description?: string;
}

declare class Heatmap {
    private el;
    private svg;
    private data;
    constructor(el: HTMLElement);
    load(data: unknown, _context?: HeatmapContext): void;
    private render;
    destroy(): void;
}

export { Heatmap };
