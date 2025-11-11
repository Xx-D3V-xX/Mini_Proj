export function buildGoogleMapsLink(lat: number, lon: number, label: string) {
  const encoded = encodeURIComponent(label);
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}&query_place_id=${encoded}`;
}
