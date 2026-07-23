export interface GridCellRef {
  el: SVGRectElement;
  rowIndex: number;
  colIndex: number;
}

const FOCUS_RING_COLOR = '#534AB7';

function injectInteractionStyles(): void {
  if (document.getElementById('hueglint-interaction-styles')) return;
  const style = document.createElement('style');
  style.id = 'hueglint-interaction-styles';
  style.textContent =
    'svg[data-hueglint-root] rect { transition: filter .15s ease, transform .15s ease; ' +
    'transform-box: fill-box; transform-origin: center; }' +
    'svg[data-hueglint-root] rect:hover, svg[data-hueglint-root] rect:focus { ' +
    'transform: scale(1.04); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25)); }';
  document.head.appendChild(style);
}

export function setupRovingTabindex(cells: GridCellRef[]): () => void {
  if (cells.length === 0) return () => {};

  injectInteractionStyles();

  const grid = new Map<string, GridCellRef>();
  cells.forEach((c) => grid.set(`${c.rowIndex},${c.colIndex}`, c));

  let active = cells[0];
  cells.forEach((c) => c.el.setAttribute('tabindex', c === active ? '0' : '-1'));

  function moveTo(next: GridCellRef | undefined) {
    if (!next) return;
    active.el.setAttribute('tabindex', '-1');
    active = next;
    active.el.setAttribute('tabindex', '0');
    active.el.focus();
  }

  function handleKeydown(e: KeyboardEvent) {
    const { rowIndex, colIndex } = active;
    switch (e.key) {
      case 'ArrowRight': e.preventDefault(); moveTo(grid.get(`${rowIndex},${colIndex + 1}`)); break;
      case 'ArrowLeft':  e.preventDefault(); moveTo(grid.get(`${rowIndex},${colIndex - 1}`)); break;
      case 'ArrowDown':  e.preventDefault(); moveTo(grid.get(`${rowIndex + 1},${colIndex}`)); break;
      case 'ArrowUp':    e.preventDefault(); moveTo(grid.get(`${rowIndex - 1},${colIndex}`)); break;
    }
  }

  const cleanupFns: (() => void)[] = [];
  cells.forEach((c) => {
    let priorStroke: string | null = null;
    let priorStrokeWidth: string | null = null;

    const onFocus = () => {
      priorStroke = c.el.getAttribute('stroke');
      priorStrokeWidth = c.el.getAttribute('stroke-width');
      c.el.setAttribute('stroke', FOCUS_RING_COLOR);
      c.el.setAttribute('stroke-width', '2');
      // Bring to front so the outward half of the stroke (and the
      // hover/focus scale effect) isn't painted over by a neighboring
      // cell drawn later in the SVG's paint order.
      c.el.parentNode?.appendChild(c.el);
    };
    const onBlur = () => {
      if (priorStroke !== null) {
        c.el.setAttribute('stroke', priorStroke);
      } else {
        c.el.removeAttribute('stroke');
      }
      if (priorStrokeWidth !== null) {
        c.el.setAttribute('stroke-width', priorStrokeWidth);
      } else {
        c.el.removeAttribute('stroke-width');
      }
    };
    c.el.addEventListener('keydown', handleKeydown);
    c.el.addEventListener('focus', onFocus);
    c.el.addEventListener('blur', onBlur);
    cleanupFns.push(() => {
      c.el.removeEventListener('keydown', handleKeydown);
      c.el.removeEventListener('focus', onFocus);
      c.el.removeEventListener('blur', onBlur);
    });
  });

  return () => cleanupFns.forEach((fn) => fn());
}