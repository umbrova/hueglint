import { HeatmapCell, HeatmapContext } from './types';
import { DiffResult, defaultDiffTooltip } from './diff';

export class TooltipController {
  readonly id: string;
  private el: HTMLDivElement;
  private activeTarget: SVGRectElement | null = null;
  private onScroll: (() => void) | null = null;

  constructor(instanceId: string) {
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

  show(target: SVGRectElement, content: string): void {
    this.el.textContent = content;
    target.setAttribute('aria-describedby', this.id);
    this.el.style.display = 'block';
    this.activeTarget = target;
    this.position(target);
    this.onScroll = () => this.position(target);
    window.addEventListener('scroll', this.onScroll, { capture: true, passive: true });
  }

  hide(target?: SVGRectElement): void {
    if (target && target !== this.activeTarget) return;
    this.el.style.display = 'none';
    this.activeTarget?.removeAttribute('aria-describedby');
    this.activeTarget = null;
    if (this.onScroll) {
      window.removeEventListener('scroll', this.onScroll, { capture: true });
      this.onScroll = null;
    }
  }

  toggle(target: SVGRectElement, content: string): void {
    if (this.activeTarget === target) {
      this.hide(target);
    } else {
      this.show(target, content);
    }
  }

  private position(target: SVGRectElement): void {
    const rect = target.getBoundingClientRect();
    const tipRect = this.el.getBoundingClientRect();
    const gap = 8;
    let top = rect.top - tipRect.height - gap;
    if (top < 0) top = rect.bottom + gap;
    let left = rect.left + rect.width / 2 - tipRect.width / 2;
    left = Math.max(gap, Math.min(left, window.innerWidth - tipRect.width - gap));
    this.el.style.left = `${left}px`;
    this.el.style.top = `${top}px`;
  }

  destroy(): void {
    if (this.onScroll) window.removeEventListener('scroll', this.onScroll, { capture: true });
    this.el.remove();
  }
}

export type TooltipFormatter = (cell: HeatmapCell, context: HeatmapContext) => string;

const defaultFormatter: TooltipFormatter = (cell, context) => {
  const label = context.valueLabel ?? 'Value';
  const base = `${cell.row}, ${cell.col}\n${label}: ${cell.value}`;
  if (cell.meta?.aggregated) {
    return `${base}\n(average of ${String(cell.meta.count)} cells)`;
  }
  return base;
};

export function attachTooltipEvents(
  cells: { el: SVGRectElement; cell: HeatmapCell }[],
  tooltip: TooltipController,
  context: HeatmapContext,
  formatter: TooltipFormatter = defaultFormatter
): () => void {
  const cleanupFns: (() => void)[] = [];
  cells.forEach(({ el, cell }) => {
    const content = () => formatter(cell, context);
    const onShow = () => tooltip.show(el, content());
    const onHide = () => tooltip.hide(el);
    const onClick = (e: Event) => {
      e.stopPropagation();
      tooltip.toggle(el, content());
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
  const onDocumentClick = () => tooltip.hide();
  document.addEventListener('click', onDocumentClick);
  cleanupFns.push(() => document.removeEventListener('click', onDocumentClick));
  return () => cleanupFns.forEach((fn) => fn());
}

export function attachDiffTooltipEvents(
  cells: { el: SVGRectElement; diff: DiffResult }[],
  tooltip: TooltipController,
  context: HeatmapContext
): () => void {
  const cleanupFns: (() => void)[] = [];
  cells.forEach(({ el, diff }) => {
    const content = () => defaultDiffTooltip(diff, context);
    const onShow = () => tooltip.show(el, content());
    const onHide = () => tooltip.hide(el);
    const onClick = (e: Event) => {
      e.stopPropagation();
      tooltip.toggle(el, content());
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
  const onDocumentClick = () => tooltip.hide();
  document.addEventListener('click', onDocumentClick);
  cleanupFns.push(() => document.removeEventListener('click', onDocumentClick));
  return () => cleanupFns.forEach((fn) => fn());
}