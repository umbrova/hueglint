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
    <section className="mt-12">
      <h2 className="mb-4 text-xl font-medium">Why hueglint</h2>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={grayscale}
          onChange={(e) => setGrayscale(e.target.checked)}
          className="accent-brand-accent"
        />
        Simulate low color vision (grayscale test)
      </label>
      <p className="mb-4 mt-1 text-xs text-gray-500">
        A grayscale filter, not a precise deuteranopia/protanopia simulation — but the standard, honest
        proxy test for "does this design rely on hue alone."
      </p>

      <div className="flex flex-wrap gap-6">
        <div className="min-w-[260px] flex-1">
          <p className="mb-2 text-center text-sm text-gray-700">Typical heatmap (not hueglint)</p>
          <div
            className="grid gap-[3px] rounded-lg shadow-sm ring-1 ring-gray-100 p-2.5 transition-[filter] duration-300"
            style={{
              gridTemplateColumns: `repeat(${cols.length}, 1fr)`,
              gridTemplateRows: `repeat(${rows.length}, 1fr)`,
              height: '220px',
              filter: grayscale ? 'grayscale(1)' : 'none',
            }}
          >
            {rows.flatMap((r) =>
              cols.map((c) => {
                const cell = compareData.find((d) => d.row === r && d.col === c)!;
                return (
                  <div
                    key={`${r}-${c}`}
                    className="rounded-sm"
                    style={{ background: typicalColor(cell.value) }}
                  />
                );
              })
            )}
          </div>
          <p className="mt-1.5 text-center text-xs text-gray-500">
            Values collapse into each other · <span className="italic">no accessible alternative</span>
          </p>
        </div>

        <div className="min-w-[260px] flex-1">
          <div className="mb-2 flex items-center justify-center gap-3">
            <p className="text-sm text-gray-700">hueglint (viridis, CVD-safe)</p>
            <label className="flex items-center gap-1 text-xs text-gray-500">
              <input
                type="checkbox"
                checked={showTable}
                onChange={(e) => setShowTable(e.target.checked)}
                className="accent-brand-accent"
              />
              Table view
            </label>
          </div>

            <div
              className="overflow-y-auto rounded-lg shadow-sm ring-1 ring-gray-100 p-2.5 transition-[filter] duration-300"
              style={{ height: '220px', filter: grayscale ? 'grayscale(1)' : 'none' }}
            >
            {showTable ? (
              <table className="w-full text-xs">
                <caption className="mb-1 text-left text-gray-600">Requests by day and hour</caption>
                <thead>
                  <tr>
                    <th className="border-b border-gray-300 p-1 text-left">Day</th>
                    <th className="border-b border-gray-300 p-1 text-left">Hour</th>
                    <th className="border-b border-gray-300 p-1 text-left">Requests</th>
                  </tr>
                </thead>
                <tbody>
                  {compareData.map((d, i) => (
                    <tr key={i}>
                      <td className="border-b border-gray-100 p-1">{d.row}</td>
                      <td className="border-b border-gray-100 p-1">{d.col}</td>
                      <td className="border-b border-gray-100 p-1">{d.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <Heatmap data={compareData} options={{ palette: 'viridis' }} />
            )}
          </div>
          {!showTable && (
            <p className="mt-1.5 text-center text-xs text-gray-500">Still readable by lightness alone</p>
          )}
        </div>
      </div>
    </section>
  );
}