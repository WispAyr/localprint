import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { fetchDesigns, fetchDesign, type DesignSummary } from "@/features/auth/api";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import type { SearchResult } from "@/features/location/domain/types";

interface DesignsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeDesignId: string | null;
  onDesignLoaded: (id: string | null) => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return d.toLocaleDateString();
}

export function useDesignLoader() {
  const { dispatch, mapRef } = usePosterContext();

  const loadDesignIntoEditor = useCallback(async (designId: string) => {
    const result = await fetchDesign(designId);
    if (!result?.state) return null;
    const s = result.state as any;

    // Set form fields — but preserve saved display names by NOT resetting overrides
    if (s.form) {
      dispatch({ type: "SET_FORM_FIELDS", fields: s.form });
      // Now explicitly set displayNameOverrides to true so reverse geocoding doesn't overwrite
      // We do this via a second dispatch to set the overrides properly
    }

    if (s.customColors) {
      dispatch({ type: "RESET_COLORS" });
      Object.entries(s.customColors).forEach(([key, value]) => {
        dispatch({ type: "SET_COLOR", key, value: value as string });
      });
    }

    if (s.markers) {
      dispatch({ type: "CLEAR_MARKERS" });
      (s.markers as any[]).forEach((m) => dispatch({ type: "ADD_MARKER", marker: m }));
    }

    if (s.markerDefaults) {
      dispatch({ type: "SET_MARKER_DEFAULTS", defaults: s.markerDefaults });
    }

    // Load business branding - handle both key names from DB
    const biz = s.businessBranding || s.business;
    if (biz) {
      const changes: Record<string, unknown> = { ...biz };
      // Convert logoUrl path to logoDataUrl if needed
      if (biz.logoUrl && !biz.logoDataUrl) {
        try {
          const resp = await fetch(biz.logoUrl);
          const blob = await resp.blob();
          const reader = new FileReader();
          const dataUrl = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          changes.logoDataUrl = dataUrl;
        } catch { /* ignore logo load failure */ }
      }
      dispatch({ type: "SET_BUSINESS_BRANDING", changes });
    }

    if (s.customMarkerIcons) {
      dispatch({ type: "SET_CUSTOM_MARKER_ICONS", icons: s.customMarkerIcons });
    }

    // KEY FIX: Set selectedLocation from saved coordinates so the map
    // doesn't reverse-geocode and overwrite the saved display names
    if (s.form?.latitude && s.form?.longitude) {
      const lat = parseFloat(s.form.latitude);
      const lon = parseFloat(s.form.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        const savedLocation: SearchResult = {
          id: `saved:${designId}`,
          label: s.form.location || "",
          city: s.form.displayCity || "",
          country: s.form.displayCountry || "",
          continent: s.form.displayContinent || "",
          lat,
          lon,
        };
        dispatch({ type: "SELECT_LOCATION", location: savedLocation });

        // Fly the map to saved coordinates with the saved distance/zoom
        const map = mapRef.current;
        if (map) {
          setTimeout(() => {
            map.flyTo({
              center: [lon, lat],
              duration: 800,
            });
          }, 100);
        }
      }
    }

    return result;
  }, [dispatch, mapRef]);

  return { loadDesignIntoEditor };
}

export default function DesignsSidebar({ isOpen, onClose, activeDesignId, onDesignLoaded }: DesignsSidebarProps) {
  const { user } = useAuth();
  const [designs, setDesigns] = useState<DesignSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const { loadDesignIntoEditor } = useDesignLoader();

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const list = await fetchDesigns();
    setDesigns(list);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (isOpen && user) load();
  }, [isOpen, user, load]);

  const handleSelect = async (design: DesignSummary) => {
    await loadDesignIntoEditor(design.id);
    onDesignLoaded(design.id);
  };

  const handleNew = () => {
    onDesignLoaded(null);
    // Reset to defaults by reloading
    window.location.href = "/";
  };

  if (!user) return null;

  const content = (
    <>
      <div className="designs-sidebar-header">
        <h3 className="designs-sidebar-title">My Designs</h3>
        <button className="designs-sidebar-close" onClick={onClose}>×</button>
      </div>
      <button className="designs-sidebar-new" onClick={handleNew}>+ New Map</button>
      <div className="designs-sidebar-list">
        {loading && <div className="designs-sidebar-empty">Loading...</div>}
        {!loading && designs.length === 0 && (
          <div className="designs-sidebar-empty">No saved designs yet</div>
        )}
        {designs.map((d) => (
          <button
            key={d.id}
            className={`designs-sidebar-item${activeDesignId === d.id ? " is-active" : ""}`}
            onClick={() => handleSelect(d)}
          >
            {d.thumbnail ? (
              <img src={d.thumbnail} alt="" className="designs-sidebar-thumb" />
            ) : (
              <div className="designs-sidebar-thumb-placeholder">🗺</div>
            )}
            <div className="designs-sidebar-info">
              <p className="designs-sidebar-name">{d.name}</p>
              <div className="designs-sidebar-date">{formatDate(d.updated_at)}</div>
            </div>
          </button>
        ))}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className={`designs-sidebar${isOpen ? " is-open" : ""}`}>
        {content}
      </div>

      {/* Mobile drawer */}
      {isOpen && <div className="designs-mobile-backdrop" onClick={onClose} />}
      <div className={`designs-mobile-drawer${isOpen ? " is-open" : ""}`}>
        {content}
      </div>
    </>
  );
}
