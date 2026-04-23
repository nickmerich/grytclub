/**
 * Elevation preview mini-chart.
 * Mocked elevation profile (feet vs. distance in miles) for the
 * Mt Lebanon Saturday loop. Replace `ELEVATION` with Strava
 * `streams.altitude` once the integration is wired.
 */

type Pt = { mi: number; ft: number };

const ELEVATION: Pt[] = [
  { mi: 0.0, ft: 1180 },
  { mi: 0.3, ft: 1205 },
  { mi: 0.6, ft: 1240 },
  { mi: 0.9, ft: 1275 },
  { mi: 1.2, ft: 1310 },
  { mi: 1.5, ft: 1295 },
  { mi: 1.8, ft: 1260 },
  { mi: 2.1, ft: 1230 },
  { mi: 2.4, ft: 1215 },
  { mi: 2.7, ft: 1245 },
  { mi: 3.0, ft: 1295 },
  { mi: 3.3, ft: 1335 },
  { mi: 3.6, ft: 1320 },
  { mi: 3.9, ft: 1280 },
  { mi: 4.2, ft: 1235 },
  { mi: 4.5, ft: 1210 },
  { mi: 4.8, ft: 1190 },
  { mi: 5.0, ft: 1180 },
];

export function ElevationChart() {
  const W = 1000;
  const H = 220;
  const PAD_L = 44;
  const PAD_R = 16;
  const PAD_T = 18;
  const PAD_B = 28;

  const minMi = ELEVATION[0].mi;
  const maxMi = ELEVATION[ELEVATION.length - 1].mi;
  const minFt = Math.min(...ELEVATION.map((p) => p.ft));
  const maxFt = Math.max(...ELEVATION.map((p) => p.ft));

  // Pad y-range a touch so line doesn't kiss the edges
  const yLo = Math.floor((minFt - 20) / 10) * 10;
  const yHi = Math.ceil((maxFt + 20) / 10) * 10;

  const x = (mi: number) =>
    PAD_L + ((mi - minMi) / (maxMi - minMi)) * (W - PAD_L - PAD_R);
  const y = (ft: number) =>
    PAD_T + (1 - (ft - yLo) / (yHi - yLo)) * (H - PAD_T - PAD_B);

  const linePath = ELEVATION.map(
    (p, i) => `${i === 0 ? "M" : "L"}${x(p.mi).toFixed(1)},${y(p.ft).toFixed(1)}`,
  ).join(" ");

  const areaPath =
    `M${x(ELEVATION[0].mi).toFixed(1)},${(H - PAD_B).toFixed(1)} ` +
    ELEVATION.map((p) => `L${x(p.mi).toFixed(1)},${y(p.ft).toFixed(1)}`).join(" ") +
    ` L${x(ELEVATION[ELEVATION.length - 1].mi).toFixed(1)},${(H - PAD_B).toFixed(1)} Z`;

  // Total elevation gain (sum of positive deltas)
  const gain = ELEVATION.reduce((acc, p, i) => {
    if (i === 0) return acc;
    const d = p.ft - ELEVATION[i - 1].ft;
    return d > 0 ? acc + d : acc;
  }, 0);

  // Y-axis ticks
  const yTicks = 4;
  const yTickVals = Array.from(
    { length: yTicks + 1 },
    (_, i) => Math.round(yLo + ((yHi - yLo) * i) / yTicks),
  );

  // X-axis ticks every 1 mile
  const xTickVals = Array.from(
    { length: Math.floor(maxMi) + 1 },
    (_, i) => i,
  );

  return (
    <div className="bg-bone border border-ink/15 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
        <div>
          <div className="label-meta opacity-70">Elevation profile</div>
          <div className="rule-thin bg-ink mt-2 max-w-[140px]" />
        </div>
        <div className="flex items-center gap-5 label-meta text-ink/70">
          <span>
            <span className="opacity-60">GAIN · </span>
            <span className="text-ink">{Math.round(gain)} FT</span>
          </span>
          <span>
            <span className="opacity-60">LOW · </span>
            <span className="text-ink">{minFt} FT</span>
          </span>
          <span>
            <span className="opacity-60">HIGH · </span>
            <span className="text-ink">{maxFt} FT</span>
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Elevation profile chart. Total gain ${Math.round(gain)} feet. Range ${minFt} to ${maxFt} feet over ${maxMi} miles.`}
        className="w-full h-[180px] md:h-[220px] block"
        preserveAspectRatio="none"
      >
        {/* Horizontal grid + y labels */}
        {yTickVals.map((v) => (
          <g key={`y-${v}`}>
            <line
              x1={PAD_L}
              x2={W - PAD_R}
              y1={y(v)}
              y2={y(v)}
              stroke="#0A0A0A"
              strokeOpacity="0.08"
              strokeWidth="1"
            />
            <text
              x={PAD_L - 8}
              y={y(v) + 3}
              textAnchor="end"
              fontSize="10"
              fontFamily="Inter, system-ui, sans-serif"
              fontWeight="600"
              letterSpacing="0.12em"
              fill="#0A0A0A"
              fillOpacity="0.55"
            >
              {v}
            </text>
          </g>
        ))}

        {/* X tick marks + labels */}
        {xTickVals.map((mi) => (
          <g key={`x-${mi}`}>
            <line
              x1={x(mi)}
              x2={x(mi)}
              y1={H - PAD_B}
              y2={H - PAD_B + 4}
              stroke="#0A0A0A"
              strokeOpacity="0.4"
              strokeWidth="1"
            />
            <text
              x={x(mi)}
              y={H - PAD_B + 16}
              textAnchor="middle"
              fontSize="10"
              fontFamily="Inter, system-ui, sans-serif"
              fontWeight="600"
              letterSpacing="0.12em"
              fill="#0A0A0A"
              fillOpacity="0.55"
            >
              {mi} MI
            </text>
          </g>
        ))}

        {/* Area fill (sky blue) */}
        <path d={areaPath} fill="#8FD0EE" fillOpacity="0.55" />

        {/* Profile line (ink) */}
        <path
          d={linePath}
          fill="none"
          stroke="#0A0A0A"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Start + finish dots */}
        <circle
          cx={x(ELEVATION[0].mi)}
          cy={y(ELEVATION[0].ft)}
          r="5"
          fill="#8FD0EE"
          stroke="#0A0A0A"
          strokeWidth="2"
        />
        <rect
          x={x(ELEVATION[ELEVATION.length - 1].mi) - 5}
          y={y(ELEVATION[ELEVATION.length - 1].ft) - 5}
          width="10"
          height="10"
          fill="#0A0A0A"
        />

        {/* Baseline */}
        <line
          x1={PAD_L}
          x2={W - PAD_R}
          y1={H - PAD_B}
          y2={H - PAD_B}
          stroke="#0A0A0A"
          strokeWidth="1"
        />
      </svg>

      <p className="label-meta mt-3 text-ink/55">
        mocked profile · swap with strava altitude stream once wired
      </p>
    </div>
  );
}
