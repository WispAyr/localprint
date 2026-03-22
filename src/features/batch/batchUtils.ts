import type { MarkerItem } from "@/features/markers/domain/types";

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

export interface CenterAndDistance {
  lat: number;
  lon: number;
  distance: number;
}

export interface DayGroup {
  day: string;
  markers: MarkerItem[];
}

/**
 * Group markers by their `day` field.
 * Markers without a day are placed into an "Unassigned" group.
 */
export function groupMarkersByDay(markers: MarkerItem[]): DayGroup[] {
  const map = new Map<string, MarkerItem[]>();

  for (const m of markers) {
    const day = (m.day ?? "").trim() || "Unassigned";
    const list = map.get(day) ?? [];
    list.push(m);
    map.set(day, list);
  }

  // Sort days in a sensible week order
  const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Unassigned"];
  const groups: DayGroup[] = [];

  for (const day of dayOrder) {
    const markers = map.get(day);
    if (markers) {
      groups.push({ day, markers });
      map.delete(day);
    }
  }

  // Any remaining non-standard day names
  for (const [day, markers] of map) {
    groups.push({ day, markers });
  }

  return groups;
}

/**
 * Calculate the bounding box of a set of markers.
 */
export function calculateBoundingBox(markers: MarkerItem[]): BoundingBox {
  if (markers.length === 0) {
    return { minLat: 0, maxLat: 0, minLon: 0, maxLon: 0 };
  }

  let minLat = Infinity, maxLat = -Infinity;
  let minLon = Infinity, maxLon = -Infinity;

  for (const m of markers) {
    if (m.lat < minLat) minLat = m.lat;
    if (m.lat > maxLat) maxLat = m.lat;
    if (m.lon < minLon) minLon = m.lon;
    if (m.lon > maxLon) maxLon = m.lon;
  }

  return { minLat, maxLat, minLon, maxLon };
}

/**
 * Calculate center point and distance (meters) that encompasses all markers
 * with 20% padding on each side.
 */
export function calculateCenterAndDistance(markers: MarkerItem[]): CenterAndDistance {
  if (markers.length === 0) {
    return { lat: 55.46, lon: -4.63, distance: 5000 };
  }

  if (markers.length === 1) {
    return { lat: markers[0].lat, lon: markers[0].lon, distance: 2000 };
  }

  const bb = calculateBoundingBox(markers);
  const lat = (bb.minLat + bb.maxLat) / 2;
  const lon = (bb.minLon + bb.maxLon) / 2;

  // Calculate the distance in meters from center to the farthest edge
  const latSpanDeg = bb.maxLat - bb.minLat;
  const lonSpanDeg = bb.maxLon - bb.minLon;

  // Convert degrees to meters (approximate)
  const latMeters = latSpanDeg * 111320;
  const lonMeters = lonSpanDeg * 111320 * Math.cos((lat * Math.PI) / 180);

  // Half-span is the distance from center to edge; use the larger dimension
  const halfSpan = Math.max(latMeters, lonMeters) / 2;

  // Add 30% padding (20% margin + extra for marker icons)
  const distance = Math.max(Math.round(halfSpan * 1.3), 1000);

  return { lat, lon, distance };
}

/**
 * Build a design state object for a group of markers, based on the current
 * poster state.
 */
export function generateDesignState(
  baseState: Record<string, unknown>,
  markers: MarkerItem[],
  title: string,
  subtitle: string,
): Record<string, unknown> {
  const { lat, lon, distance } = calculateCenterAndDistance(markers);

  return {
    ...baseState,
    form: {
      ...(baseState.form as Record<string, unknown>),
      latitude: lat.toFixed(6),
      longitude: lon.toFixed(6),
      distance: String(distance),
      displayCity: title,
      displayCountry: subtitle,
    },
    markers,
  };
}
