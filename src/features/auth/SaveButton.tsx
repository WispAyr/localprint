import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { createDesign, updateDesign } from "./api";
import { usePosterContext } from "@/features/poster/ui/PosterContext";

interface SaveButtonProps {
  onLoginClick: () => void;
}

export default function SaveButton({ onLoginClick }: SaveButtonProps) {
  const { user } = useAuth();
  const { state } = usePosterContext();
  const [designId, setDesignId] = useState<string | null>(null);
  const [designName, setDesignName] = useState("Untitled Design");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedStateRef = useRef<string>("");

  // Load design from URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("design");
    if (id && user) {
      setDesignId(id);
      // Fetch design name
      fetch("/api/designs/" + id)
        .then((r) => r.json())
        .then((data) => {
          if (data.design) setDesignName(data.design.name);
        })
        .catch(() => {});
    }
  }, [user]);

  // Serialize saveable state (form + customColors + markers + businessBranding)
  const getDesignState = useCallback(() => {
    return {
      form: state.form,
      customColors: state.customColors,
      markers: state.markers,
      markerDefaults: state.markerDefaults,
      customMarkerIcons: state.customMarkerIcons,
      businessBranding: state.businessBranding,
    };
  }, [state.form, state.customColors, state.markers, state.markerDefaults, state.customMarkerIcons, state.businessBranding]);

  // Auto-save debounced
  useEffect(() => {
    if (!user || !designId) return;
    
    const stateStr = JSON.stringify(getDesignState());
    if (stateStr === lastSavedStateRef.current) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSaving(true);
      const result = await updateDesign(designId, { state: getDesignState() });
      if (result) {
        lastSavedStateRef.current = stateStr;
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
      setSaving(false);
    }, 2000);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [user, designId, getDesignState]);

  if (!user) {
    return (
      <button className="lp-btn lp-btn-outline lp-btn-sm lp-save-btn" onClick={onLoginClick} title="Sign in to save designs">
        💾 Save
      </button>
    );
  }

  const handleSave = async () => {
    if (designId) {
      // Update existing
      setSaving(true);
      await updateDesign(designId, { name: designName, state: getDesignState() });
      lastSavedStateRef.current = JSON.stringify(getDesignState());
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      // New design - show name input
      setShowNameInput(true);
    }
  };

  const handleCreate = async () => {
    setSaving(true);
    const result = await createDesign(designName, "", getDesignState());
    if (result) {
      setDesignId(result.id);
      lastSavedStateRef.current = JSON.stringify(getDesignState());
      // Update URL without reload
      window.history.replaceState(null, "", "/?design=" + result.id);
    }
    setSaving(false);
    setShowNameInput(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="lp-save-area">
      {designId && (
        <span className="lp-design-label" title={designName}>
          {designName}
        </span>
      )}
      {showNameInput && (
        <div className="lp-save-name-popup">
          <input
            className="lp-input lp-input-sm"
            value={designName}
            onChange={(e) => setDesignName(e.target.value)}
            placeholder="Design name"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <button className="lp-btn lp-btn-primary lp-btn-sm" onClick={handleCreate}>
            Create
          </button>
          <button className="lp-btn lp-btn-outline lp-btn-sm" onClick={() => setShowNameInput(false)}>
            Cancel
          </button>
        </div>
      )}
      <button className="lp-btn lp-btn-primary lp-btn-sm lp-save-btn" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : saved ? "✓ Saved" : designId ? "💾 Save" : "💾 Save As..."}
      </button>
    </div>
  );
}
