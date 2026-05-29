/**
 * Map of the Saturday meeting spot: 212 Valley Brook Rd, McMurray, PA.
 * Simple Google Maps embed — no API key required.
 */
export function RouteMap() {
  const query = encodeURIComponent("212 Valley Brook Rd, McMurray, PA 15317");
  const src = `https://www.google.com/maps?q=${query}&z=15&output=embed`;

  return (
    <iframe
      title="Map to 212 Valley Brook Rd, McMurray, PA"
      src={src}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className="w-full h-[420px] md:h-[520px] bg-bone border-0"
      aria-label="Google Map showing 212 Valley Brook Rd, McMurray, PA — Saturday 7 AM meeting spot"
    />
  );
}
