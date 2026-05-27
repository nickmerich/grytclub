import { useEffect, useRef } from "react";

/**
 * Placeholder route for the upcoming Saturday run.
 * Montour Trail near Canonsburg, PA — a simple ~4mi out-and-back sketch.
 * Swap this polyline with a real GPX-decoded route once Strava data is wired.
 */
const ROUTE_POINTS: [number, number][] = [
  [40.3776, -80.0497], // start: Montour Trail trailhead
  [40.3795, -80.0512],
  [40.3820, -80.0530],
  [40.3838, -80.0508],
  [40.3845, -80.0470],
  [40.3825, -80.0438],
  [40.3795, -80.0422],
  [40.3760, -80.0435],
  [40.3742, -80.0468],
  [40.3758, -80.0492],
  [40.3776, -80.0497], // back to start
];

const START: [number, number] = ROUTE_POINTS[0];
const END: [number, number] = ROUTE_POINTS[ROUTE_POINTS.length - 1];

export function RouteMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    const el = containerRef.current;
    if (!el) return;

    // Dynamic import keeps Leaflet out of the SSR bundle (window/document refs).
    (async () => {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !containerRef.current) return;

      // Avoid double-init in StrictMode / HMR
      if (mapRef.current) return;

      const map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Sky-blue glow underlay — add FIRST so it sits underneath
      L.polyline(ROUTE_POINTS, {
        color: "#8FD0EE",
        weight: 11,
        opacity: 0.55,
        lineJoin: "round",
      }).addTo(map);

      const line = L.polyline(ROUTE_POINTS, {
        color: "#0A0A0A",
        weight: 5,
        opacity: 1,
        lineJoin: "round",
      }).addTo(map);

      const startIcon = L.divIcon({
        className: "",
        html: `<div style="
          width:18px;height:18px;border-radius:9999px;
          background:#8FD0EE;border:3px solid #0A0A0A;
          box-shadow:0 0 0 2px #F4F0E8;"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      const endIcon = L.divIcon({
        className: "",
        html: `<div style="
          width:18px;height:18px;
          background:#0A0A0A;border:3px solid #F4F0E8;
          box-shadow:0 0 0 2px #0A0A0A;"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      L.marker(START, { icon: startIcon }).addTo(map).bindPopup("START · Montour Trail");
      L.marker(END, { icon: endIcon }).addTo(map).bindPopup("FINISH · Coffee after");

      map.fitBounds(line.getBounds(), { padding: [32, 32] });
    })();

    return () => {
      cancelled = true;
      const m = mapRef.current as { remove?: () => void } | null;
      if (m && typeof m.remove === "function") m.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Map of Saturday's run route in Mt Lebanon, PA"
      className="w-full h-[420px] md:h-[520px] bg-bone"
    />
  );
}
