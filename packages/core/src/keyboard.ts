export interface GridCellRef {
  el: SVGRectElement;
  rowIndex: number;
  colIndex: number;
}

// Temporary hardcoded value — becomes a themeable CSS custom property
// once the Shadow DOM / theming work from the spec lands.
const FOCUS_RING_COLOR = '#534AB7';

export function setupRovingTabindex(cells: GridCellRef[]): () => void {
  if (cells.length === 0) return () => {};

  const grid = new Map<string, GridCellRef>();
  cells.forEach((c) => grid.set(`${c.rowIndex},${c.colIndex}`, c));

  let active = cells[0];
  cells.forEach((c) => c.el.setAttribute('tabindex', c === active ? '0' : '-1'));

  function moveTo(next: GridCellRef | undefined) {
    if (!next) return; // no neighbor that direction — stay put, don't error
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
    // Real focus/blur events (not just our own arrow-key handler) drive
    // the visual ring, so it's correct no matter how focus arrives —
    // Tab, a mouse click, or a screen reader's own navigation commands.
    const onFocus = () => {
      c.el.setAttribute('stroke', FOCUS_RING_COLOR);
      c.el.setAttribute('stroke-width', '2');
    };
    const onBlur = () => {
      c.el.removeAttribute('stroke');
      c.el.removeAttribute('stroke-width');
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