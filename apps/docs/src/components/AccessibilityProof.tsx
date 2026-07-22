import { useState } from 'react';
import { Heatmap } from '@hueglint/react';

const compareData = [
  { row: 'Mon', col: '8am', value: 5 }, { row: 'Mon', col: '9am', value: 25 }, { row: 'Mon', col: '10am', value: 60 }, { row: 'Mon', col: '11am', value: 90 },
  { row: 'Tue', col: '8am', value: 25 }, { row: 'Tue', col: '9am', value: 60 }, { row: 'Tue', col: '10am', value: 90 }, { row: 'Tue', col: '11am', value: 70 },
  { row: 'Wed', col: '8am', value: 60 }, { row: 'Wed', col: '9am', value: 90 }, { row: 'Wed', col: '10am', value: 70 }, { row: 'Wed', col: '11am', value: 40 },
  { row: 'Thu', col: '8am', value: 10 }, { row: 'Thu', col: '9am', value: 40 }, { row: 'Thu', col: '10am', value: 70 }, { row: 'Thu', col: '11am', value: 20 },
];

const rows = ['Mon', 'Tue', 'Wed', 'Thu'];
const cols = ['8am', '9am', '10am', '11am'];

// A classic, non-CVD-safe scale — hueglint's own palette system has no
// equivalent to this by design, so it's built by hand here purely to
// show the contrast, not as something hueglint could ever render itself.
function typicalColor(value: number): string {
  const t = value / 100;
  const stops: [number, [number, number, number]][] = [
    [0, [46, 125, 50]],
    [0.5, [251, 192, 45]],
    [1, [198, 40, 40]],
  ];
  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, c0] = stops[i];
    const [t1, c1] = stops[i + 1];
    if (t >= t0 && t <= t1) {
      const f = (t - t0) / (t1 - t0);
      const r = Math.round(c0[0] + (c1[0] - c0[0]) * f);
      const g = Math.round(c0[1] + (c1[1] - c0[1]) * f);
      const b = Math.round(c0[2] + (c1[2] - c0[2]) * f);
      return `rgb(${r},${g},${b})`;
    }
  }
  return 'rgb(198,40,40)';
}

export default function AccessibilityProof() {
  const [grayscale, setGrayscale] = useState(false);
  const [showTable, setShowTable] = useState(false);

  return (
    <section style={{ marginTop: '3rem' }}>
      <h2>Why hueglint</h2>

      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', marginBottom: '4px' }}>
        <input type="checkbox" checked={grayscale} onChange={(e) => setGrayscale(e.target.checked)} />
        Simulate low color vision (grayscale test)
      </label>
      <p style={{ fontSize: '12px', color: '#888', marginBottom: '1rem' }}>
        A grayscale filter, not a precise deuteranopia/protanopia simulation — but the standard, honest proxy
        test for "does this design rely on hue alone."
      </p>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 260px' }}>
          <p style={{ fontSize: '13px', textAlign: 'center', margin: '0 0 8px' }}>Typical heatmap (not hueglint)</p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols.length}, 1fr)`,
              gridTemplateRows: `repeat(${rows.length}, 1fr)`,
              gap: '3px',
              height: '220px',
              filter: grayscale ? 'grayscale(1)' : 'none',
              transition: 'filter .3s',
              border: '1px solid #444',
              borderRadius: '8px',
              padding: '10px',
            }}
          >
            {rows.flatMap((r) =>
              cols.map((c) => {
                const cell = compareData.find((d) => d.row === r && d.col === c)!;
                return (
                  <div key={`${r}-${c}`} style={{ borderRadius: '3px', background: typicalColor(cell.value) }} />
                );
              })
            )}
          </div>
          <p style={{ fontSize: '12px', color: '#888', textAlign: 'center', marginTop: '6px' }}>
            Values collapse into each other
          </p>
        </div>

        <div style={{ flex: '1 1 260px' }}>
          <p style={{ fontSize: '13px', textAlign: 'center', margin: '0 0 8px' }}>hueglint (viridis, CVD-safe)</p>
          <div
            style={{
              height: '220px',
              border: '1px solid #444',
              borderRadius: '8px',
              padding: '10px',
              filter: grayscale ? 'grayscale(1)' : 'none',
              transition: 'filter .3s',
            }}
          >
            <Heatmap data={compareData} options={{ palette: 'viridis' }} />
          </div>
          <p style={{ fontSize: '12px', color: '#888', textAlign: 'center', marginTop: '6px' }}>
            Still readable by lightness alone
          </p>
        </div>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', margin: '1.5rem 0 4px' }}>
        <input type="checkbox" checked={showTable} onChange={(e) => setShowTable(e.target.checked)} />
        Show accessible table view
      </label>
      <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
        This mirrors the ARIA-linked data table hueglint automatically generates for every chart, for screen
        reader users — present whether or not this toggle is on.
      </p>

      {showTable && (
        <table style={{ fontSize: '13px', borderCollapse: 'collapse', width: '100%', maxWidth: '400px' }}>
          <caption style={{ textAlign: 'left', marginBottom: '6px' }}>Requests by day and hour</caption>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #444', padding: '4px' }}>Day</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #444', padding: '4px' }}>Hour</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #444', padding: '4px' }}>Requests</th>
            </tr>
          </thead>
          <tbody>
            {compareData.map((d, i) => (
              <tr key={i}>
                <td style={{ padding: '4px', borderBottom: '1px solid #333' }}>{d.row}</td>
                <td style={{ padding: '4px', borderBottom: '1px solid #333' }}>{d.col}</td>
                <td style={{ padding: '4px', borderBottom: '1px solid #333' }}>{d.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}