/**
 * Elevation preview mini-chart.
 * Editorial GRYT spec: bone background, ink rules, hard-left alignment,
 * underlined section label, sky-blue highlight block on the headline stat.
 * No rounded corners anywhere. Mocked profile — replace `ELEVATION` with
 * Strava `streams.altitude` once the integration is wired.
 */

import { useEffect, useState } from "react";

type Pt = { mi: number; ft: number };

/** SSR-safe matchMedia hook. Returns true under 768px. */
function useIsNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return narrow;
}

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

  const gain = ELEVATION.reduce((acc, p, i) => {
    if (i === 0) return acc;
    const d = p.ft - ELEVATION[i - 1].ft;
    return d > 0 ? acc + d : acc;
  }, 0);

  const yTicks = 4;
  const yTickVals = Array.from(
    { length: yTicks + 1 },
    (_, i) => Math.round(yLo + ((yHi - yLo) * i) / yTicks),
  );

  const xTickVals = Array.from(
    { length: Math.floor(maxMi) + 1 },
    (_, i) => i,
  );

  return (
    <section className="bg-bone border-t-2 border-b-2 border-ink">
      {/* Header strip — hard-left, underlined label, sky highlight on gain */}
      <div className="border-b border-ink/20 px-0">
        <div className="grid grid-cols-12 gap-0">
          {/* Section label — left edge, underlined */}
          <div className="col-span-12 md:col-span-4 border-r-0 md:border-r border-ink/20 py-5 pl-5 md:pl-8 pr-5">
            <div className="label-meta text-ink/60">Fig. 02</div>
            <h3 className="font-display text-xl md:text-2xl mt-2 leading-none">
              Elevation
              <br />
              <span className="underline-sky underline-sky-sm">profile</span>
            </h3>
          </div>

          {/* Stat row — flush left of each cell, no rounded edges */}
          <div className="col-span-4 md:col-span-3 border-l border-ink/20 py-5 pl-5 md:pl-6 pr-4 flex flex-col justify-between">
            <div className="label-meta text-ink/60">Gain</div>
            <div className="mt-3 leading-none">
              <span className="mark-sky font-display text-2xl md:text-3xl">
                {Math.round(gain)} FT
              </span>
            </div>
          </div>

          <div className="col-span-4 md:col-span-2 border-l border-ink/20 py-5 pl-5 md:pl-6 pr-4 flex flex-col justify-between">
            <div className="label-meta text-ink/60">Low</div>
            <div className="mt-3 font-display text-2xl md:text-3xl leading-none">
              {minFt}
              <span className="label-meta text-ink/55 ml-1.5 align-middle">FT</span>
            </div>
          </div>

          <div className="col-span-4 md:col-span-3 border-l border-ink/20 py-5 pl-5 md:pl-6 pr-5 md:pr-8 flex flex-col justify-between">
            <div className="label-meta text-ink/60">High</div>
            <div className="mt-3 font-display text-2xl md:text-3xl leading-none">
              {maxFt}
              <span className="label-meta text-ink/55 ml-1.5 align-middle">FT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart body — hard-left, no padding-left so axis sits flush */}
      <div className="px-5 md:px-8 py-5 md:py-6">
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
                fontWeight="700"
                letterSpacing="0.18em"
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
                strokeOpacity="0.45"
                strokeWidth="1"
              />
              <text
                x={x(mi)}
                y={H - PAD_B + 17}
                textAnchor="middle"
                fontSize="10"
                fontFamily="Inter, system-ui, sans-serif"
                fontWeight="700"
                letterSpacing="0.18em"
                fill="#0A0A0A"
                fillOpacity="0.6"
              >
                {mi} MI
              </text>
            </g>
          ))}

          {/* Area fill (sky) */}
          <path d={areaPath} fill="#8FD0EE" fillOpacity="0.55" />

          {/* Profile line (ink) */}
          <path
            d={linePath}
            fill="none"
            stroke="#0A0A0A"
            strokeWidth="2.5"
            strokeLinejoin="miter"
            strokeLinecap="butt"
          />

          {/* Start dot — sky w/ ink ring (no border-radius elsewhere; circle is data, allowed) */}
          <circle
            cx={x(ELEVATION[0].mi)}
            cy={y(ELEVATION[0].ft)}
            r="5"
            fill="#8FD0EE"
            stroke="#0A0A0A"
            strokeWidth="2"
          />
          {/* Finish — ink square */}
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
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Footer caption strip — hard-left, underlined accent */}
      <div className="border-t border-ink/20 px-5 md:px-8 py-3 flex items-center justify-between gap-4">
        <div className="label-meta text-ink/55">
          Mocked profile · swap with Strava altitude stream
        </div>
        <div className="label-meta text-ink/70 hidden md:flex items-center gap-3">
          <span className="inline-block w-3 h-3 bg-sky-brand border border-ink" />
          <span>Sky · gain</span>
          <span className="inline-block w-3 h-[2px] bg-ink ml-2" />
          <span>Ink · profile</span>
        </div>
      </div>
    </section>
  );
}
