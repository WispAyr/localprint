import { useState, useMemo } from "react";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import { groupMarkersByDay, calculateCenterAndDistance, generateDesignState } from "./batchUtils";
import { createDesign } from "@/features/auth/api";
import type { DayGroup } from "./batchUtils";

export default function BatchGenerator() {
  const { state } = usePosterContext();
  const { markers } = state;

  const dayGroups = useMemo(() => groupMarkersByDay(markers), [markers]);

  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [includeOverview, setIncludeOverview] = useState(true);
  const [title, setTitle] = useState(state.form.displayCity || "");
  const [subtitleTemplate, setSubtitleTemplate] = useState("{{day}}");
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // Auto-select all days on first render
  useMemo(() => {
    setSelectedDays(new Set(dayGroups.map((g) => g.day)));
  }, [dayGroups]);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedDays(new Set(dayGroups.map((g) => g.day)));
    setIncludeOverview(true);
  };

  const selectNone = () => {
    setSelectedDays(new Set());
    setIncludeOverview(false);
  };

  const handleSaveAsDesigns = async () => {
    setIsSaving(true);
    setResult(null);

    const baseState: Record<string, unknown> = {
      form: { ...state.form },
      customColors: state.customColors,
      markers: state.markers,
      businessBranding: state.businessBranding,
      markerDefaults: state.markerDefaults,
    };

    let created = 0;
    const errors: string[] = [];

    try {
      // Generate overview if selected
      if (includeOverview && markers.length > 0) {
        const subtitle = subtitleTemplate.replace("{{day}}", "Overview");
        const designState = generateDesignState(baseState, markers, title, subtitle);
        const res = await createDesign({
          name: `${title} — Overview`,
          description: `All ${markers.length} markers`,
          state: designState,
        });
        if (res.ok) created++;
        else errors.push(`Overview: ${res.error || "failed"}`);
      }

      // Generate per-day designs
      for (const group of dayGroups) {
        if (!selectedDays.has(group.day)) continue;

        const subtitle = subtitleTemplate.replace("{{day}}", group.day);
        const designState = generateDesignState(baseState, group.markers, title, subtitle);
        const res = await createDesign({
          name: `${title} — ${group.day}`,
          description: `${group.markers.length} stop${group.markers.length !== 1 ? "s" : ""}: ${group.markers.map((m) => m.label || m.title || "marker").join(", ")}`,
          state: designState,
        });
        if (res.ok) created++;
        else errors.push(`${group.day}: ${res.error || "failed"}`);
      }

      if (errors.length > 0) {
        setResult(`Created ${created} designs. Errors: ${errors.join("; ")}`);
      } else {
        setResult(`✅ Created ${created} designs successfully!`);
      }
    } catch (e) {
      setResult(`Error: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (markers.length === 0) {
    return (
      <div className="batch-generator">
        <div className="batch-empty">
          <p>Add markers with a <strong>day</strong> field to use batch generation.</p>
          <p className="batch-hint">Go to the Markers section, add markers, and set their day/time fields.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="batch-generator">
      <p className="batch-description">
        Generate maps for each day/group from your markers automatically.
      </p>

      <div className="batch-select-actions">
        <button type="button" className="batch-link-btn" onClick={selectAll}>Select all</button>
        <button type="button" className="batch-link-btn" onClick={selectNone}>Select none</button>
      </div>

      <div className="batch-groups">
        <label className="batch-group-item">
          <input
            type="checkbox"
            checked={includeOverview}
            onChange={() => setIncludeOverview(!includeOverview)}
          />
          <div className="batch-group-info">
            <span className="batch-group-title">Overview (all {markers.length} markers)</span>
          </div>
        </label>

        {dayGroups.map((group) => (
          <label key={group.day} className="batch-group-item">
            <input
              type="checkbox"
              checked={selectedDays.has(group.day)}
              onChange={() => toggleDay(group.day)}
            />
            <div className="batch-group-info">
              <span className="batch-group-title">
                {group.day} ({group.markers.length} stop{group.markers.length !== 1 ? "s" : ""})
              </span>
              <span className="batch-group-markers">
                {group.markers.map((m) => m.label || m.title || "marker").join(", ")}
              </span>
              <AutoCenterPreview markers={group.markers} />
            </div>
          </label>
        ))}
      </div>

      <div className="batch-fields">
        <label className="batch-field">
          <span>Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Van 1 - Big Alex"
          />
        </label>
        <label className="batch-field">
          <span>Subtitle template</span>
          <input
            type="text"
            value={subtitleTemplate}
            onChange={(e) => setSubtitleTemplate(e.target.value)}
            placeholder="{{day}}"
          />
          <span className="batch-hint">Use {"{{day}}"} for the group name</span>
        </label>
      </div>

      <div className="batch-actions">
        <button
          type="button"
          className="batch-save-btn"
          onClick={handleSaveAsDesigns}
          disabled={isSaving || (!includeOverview && selectedDays.size === 0)}
        >
          {isSaving ? "Saving..." : "💾 Save as Designs"}
        </button>
      </div>

      {result && (
        <div className={`batch-result ${result.startsWith("✅") ? "batch-result--success" : "batch-result--error"}`}>
          {result}
        </div>
      )}
    </div>
  );
}

function AutoCenterPreview({ markers }: { markers: { lat: number; lon: number }[] }) {
  const { lat, lon, distance } = calculateCenterAndDistance(markers as any);
  return (
    <span className="batch-center-preview">
      {lat.toFixed(4)}°, {lon.toFixed(4)}° · {distance >= 1000 ? `${(distance / 1000).toFixed(1)}km` : `${distance}m`}
    </span>
  );
}
