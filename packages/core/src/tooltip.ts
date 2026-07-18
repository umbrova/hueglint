import { HeatmapCell, HeatmapContext } from './types';

export type TooltipFormatter = (cell: HeatmapCell, context: HeatmapContext) => string;

const defaultFormatter: TooltipFormatter = (cell, context) => {
  const valueLabel = context.valueLabel ?? 'Value';
  return `${cell.row}, ${cell.col}\n${valueLabel}: ${cell.value}`;
};

export class TooltipController {
  readonly id: string;
  private el: HTMLDivElement;
  private activeTarget: SVGRectElement | null = null;

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
    this.activeTarget = target;
    this.position(target);
  }

  hide(target?: SVGRectElement): void {
    // Guard: a stale mouseleave/blur from a cell that's no longer
    // active shouldn't hide a tooltip a newer interaction already opened.
    if (target && target !== this.activeTarget) return;
    this.el.style.display = 'none';
    this.activeTarget?.removeAttribute('aria-describedby');
    this.activeTarget = null;
  }

  toggle(target: SVGRectElement, cell: HeatmapCell, context: HeatmapContext): void {
    if (this.activeTarget === target) {
      this.hide(target);
    } else {
      this.show(target, cell, context);
    }
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
    const onClick = (e: Event) => {
      // Stop this click from also reaching the document-level
      // outside-click listener registered below.
      e.stopPropagation();
      tooltip.toggle(el, cell, context);
    };
    el.addEventListener('mouseenter', onShow);
    el.addEventListener('mouseleave', onHide);
    el.addEventListener('focus', onShow);
    el.addEventListener('blur', onHide);
    el.addEventListener('click', onClick);
    cleanupFns.push(() => {
      el.removeEventListener('mouseenter', onShow);
      el.removeEventListener('mouseleave', onHide);
      el.removeEventListener('focus', onShow);
      el.removeEventListener('blur', onHide);
      el.removeEventListener('click', onClick);
    });
  });

  // Tap/click anywhere else in the document dismisses the open tooltip —
  // registered once here, not per-cell.
  const onDocumentClick = () => tooltip.hide();
  document.addEventListener('click', onDocumentClick);
  cleanupFns.push(() => document.removeEventListener('click', onDocumentClick));

  return () => cleanupFns.forEach((fn) => fn());
}