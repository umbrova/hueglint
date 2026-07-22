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
    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div
        style={{
          flex: '1 1 400px',
          minWidth: '300px',
          height: '320px',
          border: '1px solid #444',
          borderRadius: '8px',
          padding: '1rem',
        }}
      >
        <Heatmap
          data={active.data}
          previousData={diffMode ? active.previousData : undefined}
          context={active.context}
          options={{ palette, minCellSize: showEveryCell ? 1 : undefined }}
        />
      </div>
      <div style={{ minWidth: '180px' }}>
        <label htmlFor="dataset-select" style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>
          Sample data
        </label>
        <select
          id="dataset-select"
          value={datasetKey}
          onChange={(e) => setDatasetKey(e.target.value as keyof typeof datasets)}
        >
          {Object.entries(datasets).map(([key, d]) => (
            <option key={key} value={key}>
              {d.label}
            </option>
          ))}
        </select>

        <label htmlFor="palette-select" style={{ display: 'block', fontSize: '13px', marginTop: '14px', marginBottom: '4px' }}>
          Palette
        </label>
        <select
          id="palette-select"
          value={palette}
          onChange={(e) => setPalette(e.target.value as Palette)}
          disabled={diffMode}
        >
          {PALETTES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px', fontSize: '13px' }}>
          <input type="checkbox" checked={diffMode} onChange={(e) => setDiffMode(e.target.checked)} />
          Compare to previous period
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '13px' }}>
          <input
            type="checkbox"
            checked={showEveryCell}
            onChange={(e) => setShowEveryCell(e.target.checked)}
          />
          Show every cell (disable touch-target protection)
        </label>
      </div>
    </div>
  );
}