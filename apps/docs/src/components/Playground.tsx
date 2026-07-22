import { useState } from 'react';
import { Heatmap } from '@hueglint/react';
import type { Palette } from '@hueglint/core';
import { datasets } from '../data';

const PALETTES: Palette[] = ['viridis', 'plasma', 'cividis', 'magma', 'inferno'];

export default function Playground() {
  const [datasetKey, setDatasetKey] = useState<keyof typeof datasets>('serverLoad');
  const [palette, setPalette] = useState<Palette>('viridis');
  const [diffMode, setDiffMode] = useState(false);
  const [showEveryCell, setShowEveryCell] = useState(false);

  const active = datasets[datasetKey];

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="h-[320px]">
        <Heatmap
          data={active.data}
          previousData={diffMode ? active.previousData : undefined}
          context={active.context}
          options={{ palette, minCellSize: showEveryCell ? 1 : undefined }}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <label htmlFor="dataset-select">Sample data</label>
          <select
            id="dataset-select"
            value={datasetKey}
            onChange={(e) => setDatasetKey(e.target.value as keyof typeof datasets)}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          >
            {Object.entries(datasets).map(([key, d]) => (
              <option key={key} value={key}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="palette-select">Palette</label>
          <select
            id="palette-select"
            value={palette}
            onChange={(e) => setPalette(e.target.value as Palette)}
            disabled={diffMode}
            className="rounded border border-gray-300 px-2 py-1 text-sm disabled:opacity-50"
          >
            {PALETTES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={diffMode}
            onChange={(e) => setDiffMode(e.target.checked)}
            className="accent-brand-accent"
          />
          Compare to previous period
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showEveryCell}
            onChange={(e) => setShowEveryCell(e.target.checked)}
            className="accent-brand-accent"
          />
          Show every cell
        </label>
      </div>
    </div>
  );
}