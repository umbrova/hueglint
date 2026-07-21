import { useState } from 'react';
import { Heatmap } from '@hueglint/react';
import type { Palette } from '@hueglint/core';

const sampleData = [
  { row: 'Mon', col: '8am', value: 12 }, { row: 'Mon', col: '9am', value: 45 },
  { row: 'Mon', col: '10am', value: 78 }, { row: 'Mon', col: '11am', value: 34 },
  { row: 'Tue', col: '8am', value: 20 }, { row: 'Tue', col: '9am', value: 60 },
  { row: 'Tue', col: '10am', value: 95 }, { row: 'Tue', col: '11am', value: 40 },
  { row: 'Wed', col: '8am', value: 15 }, { row: 'Wed', col: '9am', value: 50 },
  { row: 'Wed', col: '10am', value: 88 }, { row: 'Wed', col: '11am', value: 30 },
];

const previousSampleData = [
  { row: 'Mon', col: '8am', value: 8 }, { row: 'Mon', col: '9am', value: 30 },
  { row: 'Mon', col: '10am', value: 60 }, { row: 'Mon', col: '11am', value: 40 },
  { row: 'Tue', col: '8am', value: 25 }, { row: 'Tue', col: '9am', value: 55 },
  { row: 'Tue', col: '10am', value: 70 }, { row: 'Tue', col: '11am', value: 35 },
  { row: 'Wed', col: '8am', value: 18 }, { row: 'Wed', col: '9am', value: 45 },
  { row: 'Wed', col: '10am', value: 90 }, { row: 'Wed', col: '11am', value: 28 },
];

const PALETTES: Palette[] = ['viridis', 'plasma', 'cividis', 'magma', 'inferno'];

export default function Playground() {
  const [palette, setPalette] = useState<Palette>('viridis');
  const [diffMode, setDiffMode] = useState(false);

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
          data={sampleData}
          previousData={diffMode ? previousSampleData : undefined}
          context={{ rowLabel: 'Day', colLabel: 'Hour', valueLabel: 'Requests' }}
          options={{ palette }}
        />
      </div>
      <div style={{ minWidth: '180px' }}>
        <label htmlFor="palette-select" style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>
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
          Compare to previous week
        </label>
      </div>
    </div>
  );
}