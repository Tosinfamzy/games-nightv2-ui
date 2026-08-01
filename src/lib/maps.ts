/**
 * The href for a session's 📍 location link. Prefers the host's custom map
 * pin (`locationUrl`) when it's a real http(s) URL; otherwise falls back to a
 * Google Maps search built from the address text. The http(s) guard keeps a
 * stray `javascript:`/`data:` value from becoming a clickable href.
 */
export function mapLinkHref(
  location: string,
  locationUrl?: string | null,
): string {
  if (locationUrl && /^https?:\/\//i.test(locationUrl.trim())) {
    return locationUrl.trim()
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
}
