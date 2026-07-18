import { HeatmapCell, HeatmapContext } from './types';

export type TooltipFormatter = (cell: HeatmapCell, context: HeatmapContext) => string;

const defaultFormatter: TooltipFormatter = (cell, context) => {
  const valueLabel = context.valueLabel ?? 'Value';
  return `${cell.row}, ${cell.col}\n${valueLabel}: ${cell.value}`;
};

export class TooltipController {
  readonly id: string;
  private el: HTMLDivElement;

  constructor(instanceId: string, private formatter: TooltipFormatter = defaultFormatter) {
    this.id = `${instanceId}-tooltip`;
    this.el = document.createElement('div');
    this.el.id = this.id;
    this.el.setAttribute('role', 'tooltip');
    this.el.style.cssText =
      'position:fixed;pointer-events:none;background:#fff;border:1px solid #ccc;' +
      'border-radius:4px;padding:6px 10px;font-size:13px;white-space:pre-line;' +
      'box-shadow:0 2px 8px rgba(0,0,0,0.15);z-index:2147483647;display:none;max-width:220px;';
    document.body.appendChild(this.el);
  }

  show(target: SVGRectElement, cell: HeatmapCell, context: HeatmapContext): void {
    this.el.textContent = this.formatter(cell, context);
    target.setAttribute('aria-describedby', this.id);
    this.el.style.display = 'block';
    this.position(target);
  }

  hide(target?: SVGRectElement): void {
    this.el.style.display = 'none';
    target?.removeAttribute('aria-describedby');
  }

  private position(target: SVGRectElement): void {
    const rect = target.getBoundingClientRect();
    const tipRect = this.el.getBoundingClientRect();
    const gap = 8;

    let top = rect.top - tipRect.height - gap;
    if (top < 0) {
      top = rect.bottom + gap; // no room above — flip below
    }

    let left = rect.left + rect.width / 2 - tipRect.width / 2;
    left = Math.max(gap, Math.min(left, window.innerWidth - tipRect.width - gap));

    this.el.style.left = `${left}px`;
    this.el.style.top = `${top}px`;
  }

  destroy(): void {
    this.el.remove();
  }
}

export function attachTooltipEvents(
  cells: { el: SVGRectElement; cell: HeatmapCell }[],
  tooltip: TooltipController,
  context: HeatmapContext
): () => void {
  const cleanupFns: (() => void)[] = [];
  cells.forEach(({ el, cell }) => {
    const onShow = () => tooltip.show(el, cell, context);
    const onHide = () => tooltip.hide(el);
    el.addEventListener('mouseenter', onShow);
    el.addEventListener('mouseleave', onHide);
    el.addEventListener('focus', onShow);
    el.addEventListener('blur', onHide);
    cleanupFns.push(() => {
      el.removeEventListener('mouseenter', onShow);
      el.removeEventListener('mouseleave', onHide);
      el.removeEventListener('focus', onShow);
      el.removeEventListener('blur', onHide);
    });
  });
  return () => cleanupFns.forEach((fn) => fn());
}