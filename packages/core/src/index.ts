import { HeatmapCell, HeatmapContext } from './types';
import { validateData } from './validate';
import { computeLayout } from './layout';

export class Heatmap {
  private svg: SVGSVGElement;
  private data: HeatmapCell[] = [];

  constructor(private el: HTMLElement) {
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', '100%');
    this.svg.setAttribute('height', '100%');
    this.el.appendChild(this.svg);
  }

  load(data: unknown, _context?: HeatmapContext): void {
    this.data = validateData(data);
    this.render();
  }

  private render(): void {
    this.svg.innerHTML = '';
    const width = this.el.clientWidth || 400;
    const height = this.el.clientHeight || 300;
    const layout = computeLayout(this.data, width, height);

    for (const cell of this.data) {
      const pos = layout.positions.get(cell)!;
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', String(pos.x));
      rect.setAttribute('y', String(pos.y));
      rect.setAttribute('width', String(layout.cellWidth));
      rect.setAttribute('height', String(layout.cellHeight));
      rect.setAttribute('fill', '#888'); // placeholder — real palette arrives in Phase 3
      this.svg.appendChild(rect);
    }
  }

  destroy(): void {
    this.el.removeChild(this.svg);
  }
}