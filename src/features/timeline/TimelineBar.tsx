import type { MarkerItem } from "@/features/markers/domain/types";
import "./timeline.css";

const DAYS_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_SHORT: Record<string, string> = {
  Monday: "MON", Tuesday: "TUE", Wednesday: "WED",
  Thursday: "THU", Friday: "FRI", Saturday: "SAT", Sunday: "SUN",
};

interface TimelineBarProps {
  markers: MarkerItem[];
  fontFamily?: string;
}

export default function TimelineBar({ markers, fontFamily }: TimelineBarProps) {
  // Group markers by day
  const byDay = new Map<string, MarkerItem[]>();
  for (const day of DAYS_ORDER) {
    byDay.set(day, []);
  }
  for (const m of markers) {
    if (m.day && byDay.has(m.day)) {
      byDay.get(m.day)!.push(m);
    }
  }

  // Check if any day has markers
  const hasAny = markers.some(m => m.day);
  if (!hasAny) return null;

  return (
    <div className="timeline-bar" style={{ fontFamily: fontFamily ? `"${fontFamily}", sans-serif` : undefined }}>
      {DAYS_ORDER.map(day => {
        const stops = byDay.get(day) || [];
        // Use the first stop's colour for the header
        const headerColor = stops.length > 0 ? stops[0].color : "rgba(255,255,255,0.5)";
        return (
          <div className="timeline-day" key={day}>
            <div className="timeline-day-header" style={{ color: headerColor }}>
              {DAY_SHORT[day]}
            </div>
            {stops.map(stop => (
              <div className="timeline-stop" key={stop.id}>
                <span className="timeline-stop-name">{stop.title || stop.label}</span>
                {stop.time && <span className="timeline-stop-time">{stop.time}</span>}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
