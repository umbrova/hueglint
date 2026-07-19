export function buildLoadingState(): HTMLDivElement {
  const el = document.createElement('div');
  el.setAttribute('data-hueglint-state', 'loading');
  el.style.cssText =
    'display:grid;grid-template-columns:repeat(4,1fr);gap:4px;width:100%;height:100%;min-height:120px;';
  for (let i = 0; i < 16; i++) {
    const cell = document.createElement('div');
    cell.style.cssText =
      'background:#e0e0e0;border-radius:3px;animation:hueglint-pulse 1.4s ease-in-out infinite;' +
      `animation-delay:${(i % 4) * 0.1}s;`;
    el.appendChild(cell);
  }
  // Injected once per document (checked via id), not once per chart
  // instance — otherwise every chart on a page duplicates the same rule.
  if (!document.getElementById('hueglint-pulse-keyframes')) {
    const style = document.createElement('style');
    style.id = 'hueglint-pulse-keyframes';
    style.textContent = '@keyframes hueglint-pulse { 0%,100%{opacity:.4} 50%{opacity:.8} }';
    document.head.appendChild(style);
  }
  return el;
}

export function buildEmptyState(): HTMLDivElement {
  const el = document.createElement('div');
  el.setAttribute('data-hueglint-state', 'empty');
  el.style.cssText =
    'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
    'gap:6px;width:100%;height:100%;min-height:120px;text-align:center;color:#888;font-size:13px;';
  const title = document.createElement('p');
  title.textContent = 'No data to display';
  title.style.cssText = 'margin:0;';
  const subtitle = document.createElement('p');
  subtitle.textContent = 'Call .load() with your dataset';
  subtitle.style.cssText = 'margin:0;font-size:12px;color:#aaa;';
  el.append(title, subtitle);
  return el;
}

export function buildErrorState(message: string): HTMLDivElement {
  const el = document.createElement('div');
  el.setAttribute('data-hueglint-state', 'error');
  el.setAttribute('role', 'alert');
  el.style.cssText =
    'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
    'gap:6px;width:100%;height:100%;min-height:120px;text-align:center;' +
    'border:1px solid #e33;border-radius:6px;color:#333;font-size:13px;';
  const title = document.createElement('p');
  title.textContent = message;
  title.style.cssText = 'margin:0;';
  const subtitle = document.createElement('p');
  subtitle.textContent = 'See console for details';
  subtitle.style.cssText = 'margin:0;font-size:12px;color:#888;';
  el.append(title, subtitle);
  return el;
}