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
  const [showTable, setShowTable] = useState(false);

  const active = datasets[datasetKey];

  return (
    <div className="rounded-xl shadow-sm ring-1 ring-gray-100 p-4">
      <div className="h-[320px] overflow-y-auto">
        {showTable ? (
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left border-b border-gray-200 p-1">{active.context.rowLabel ?? 'Row'}</th>
                <th className="text-left border-b border-gray-200 p-1">{active.context.colLabel ?? 'Column'}</th>
                {diffMode ? (
                  <>
                    <th className="text-left border-b border-gray-200 p-1">Previous</th>
                    <th className="text-left border-b border-gray-200 p-1">Current</th>
                  </>
                ) : (
                  <th className="text-left border-b border-gray-200 p-1">{active.context.valueLabel ?? 'Value'}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {active.data.map((d, i) => (
                <tr key={i}>
                  <td className="p-1 border-b border-gray-100">{d.row}</td>
                  <td className="p-1 border-b border-gray-100">{d.col}</td>
                  {diffMode ? (
                    <>
                      <td className="p-1 border-b border-gray-100">{active.previousData[i]?.value}</td>
                      <td className="p-1 border-b border-gray-100">{d.value}</td>
                    </>
                  ) : (
                    <td className="p-1 border-b border-gray-100">{d.value}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Heatmap
            data={active.data}
            previousData={diffMode ? active.previousData : undefined}
            context={active.context}
            options={{ palette, minCellSize: showEveryCell ? 1 : undefined }}
          />
        )}
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
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-5 text-sm text-gray-600">
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

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showTable}
            onChange={(e) => setShowTable(e.target.checked)}
            className="accent-brand-accent"
          />
          Table view  (demo only — not a hueglint API)
        </label>
      </div>
    </div>
  );
}