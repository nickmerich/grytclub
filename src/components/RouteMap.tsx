import { useEffect, useRef } from "react";

/**
 * 212 Valley Brook Trail Run — 5.22 mi, 68 ft gain.
 * Start: Montour Trail near Bebout Rd (east of McMurray, PA).
 * Finish: Hiddenbrook Playground, north of Thompsonville via Valley Brook Rd.
 */
const ROUTE_POINTS: [number, number][] = [
  [40.5462, -80.0815], // START: Montour Trail @ Bebout Rd (green dot)
  [40.5468, -80.0858], // along Montour Trail
  [40.5472, -80.0905], // McMurray
  [40.5482, -80.0948], // Valley Brook Rd & Maplewood Dr
  [40.5505, -80.0985], // up Valley Brook Rd
  [40.5528, -80.1018], // Valley Brook Rd & Route 19 / Thompsonville
  [40.5555, -80.1035], // north along Hidden Valley Rd corridor
  [40.5585, -80.1048],
  [40.5608, -80.1052], // FINISH: Hiddenbrook Playground (checkered flag)
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

      L.marker(START, { icon: startIcon }).addTo(map).bindPopup("START · Montour Trail @ Bebout Rd");
      L.marker(END, { icon: endIcon }).addTo(map).bindPopup("FINISH · Hiddenbrook Playground");


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
      aria-label="Map of Saturday's run: 5.22 mi from Montour Trail at Bebout Rd up Valley Brook Rd to Hiddenbrook Playground, McMurray PA"
      className="w-full h-[420px] md:h-[520px] bg-bone"
    />

  );
}
