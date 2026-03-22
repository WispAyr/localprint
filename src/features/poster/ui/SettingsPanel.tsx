import { useState, type FormEvent } from "react";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import { useFormHandlers } from "@/features/poster/application/useFormHandlers";
import { useLocationAutocomplete } from "@/features/location/application/useLocationAutocomplete";
import { useMapSync } from "@/features/map/application/useMapSync";
import type { MobileTab } from "@/shared/ui/MobileNavBar";

import LocationSection from "@/features/location/ui/LocationSection";
import MapSettingsSection from "@/features/map/ui/MapSettingsSection";
import LayersSection from "@/features/map/ui/LayersSection";
import MarkersSection from "@/features/markers/ui/MarkersSection";
import TypographySection from "@/features/poster/ui/TypographySection";
import {
  LocationIcon,
  ThemeIcon,
  LayoutIcon,
  LayersIcon,
  MarkersIcon,
  StyleIcon,
  ChevronDownIcon,
} from "@/shared/ui/Icons";

import { themeOptions } from "@/features/theme/infrastructure/themeRepository";
import { layoutGroups } from "@/features/layout/infrastructure/layoutRepository";
import {
  MIN_POSTER_CM,
  MAX_POSTER_CM,
  FONT_OPTIONS,
  DEFAULT_DISTANCE_METERS,
} from "@/core/config";
import { reverseGeocodeCoordinates } from "@/core/services";
import { GEOLOCATION_TIMEOUT_MS } from "@/features/map/infrastructure";
import type { SearchResult } from "@/features/location/domain/types";
import BusinessBrandingSection from "@/features/business/ui/BusinessBrandingSection";
import "@/features/business/ui/business.css";
import BatchGenerator from "@/features/batch/BatchGenerator";
import "@/features/batch/batch.css";

import { generateBrandTheme } from "@/features/business/infrastructure/brandThemeGenerator";
import type { BusinessBranding } from "@/features/business/domain/types";
import {
  getGeolocationFailureMessage,
  requestCurrentPositionWithRetry,
} from "@/features/location/infrastructure";

type SectionId =
  | "location"
  | "theme"
  | "layout"
  | "layers"
  | "markers"
  | "style"
  | "batch";

const accordionSections: {
  id: SectionId;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "location", label: "Location", Icon: LocationIcon },
  { id: "theme", label: "Theme", Icon: ThemeIcon },
  { id: "layout", label: "Layout", Icon: LayoutIcon },
  { id: "layers", label: "Layers", Icon: LayersIcon },
  { id: "markers", label: "Markers", Icon: MarkersIcon },
  { id: "style", label: "Style", Icon: StyleIcon },
  { id: "batch", label: "Batch", Icon: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 7v10M12 7v10M16 7v10"/></svg> },
];

export default function SettingsPanel({
  mobileTab,
}: {
  mobileTab?: MobileTab;
}) {
  const { state, selectedTheme, dispatch } = usePosterContext();
  const {
    handleChange,
    handleNumericFieldBlur,
    handleThemeChange,
    handleLayoutChange,
    handleColorChange,
    handleResetColors,
    handleLocationSelect,
    handleClearLocation,
    setLocationFocused,
    handleCreditsChange,
  } = useFormHandlers();
  const { locationSuggestions, isLocationSearching } = useLocationAutocomplete(
    state.form.location,
    state.isLocationFocused,
  );
  const { flyToLocation } = useMapSync();

  const [isColorEditorActive, setIsColorEditorActive] = useState(false);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [locationPermissionMessage, setLocationPermissionMessage] =
    useState("");
  const [openSections, setOpenSections] = useState<Set<SectionId>>(
    new Set(["location", "theme", "layout", "style"]),
  );

  const isAuxEditorActive = isColorEditorActive;
  const showLocationSuggestions =
    state.isLocationFocused && locationSuggestions.length > 0;

  const toggleSection = (id: SectionId) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const onLocationSelect = (location: SearchResult) => {
    handleLocationSelect(location);
    flyToLocation(location.lat, location.lon);
  };

  const handleUseCurrentLocation = () => {
    if (isLocatingUser) return;

    const applyLocation = async (lat: number, lon: number) => {
      setLocationPermissionMessage("");
      flyToLocation(lat, lon);
      dispatch({
        type: "SET_FORM_FIELDS",
        resetDisplayNameOverrides: true,
        fields: {
          latitude: lat.toFixed(6),
          longitude: lon.toFixed(6),
          distance: String(DEFAULT_DISTANCE_METERS),
        },
      });
      try {
        const resolved = await reverseGeocodeCoordinates(lat, lon);
        dispatch({
          type: "SET_FORM_FIELDS",
          resetDisplayNameOverrides: true,
          fields: {
            location: resolved.label,
            displayCity: String(resolved.city ?? "").trim(),
            displayCountry: String(resolved.country ?? "").trim(),
            displayContinent: String(resolved.continent ?? "").trim(),
          },
        });
        dispatch({ type: "SET_USER_LOCATION", location: resolved });
      } catch {
        const fallbackLocation: SearchResult = {
          id: `user:${lat.toFixed(6)},${lon.toFixed(6)}`,
          label: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
          city: "",
          country: "",
          continent: "",
          lat,
          lon,
        };
        dispatch({
          type: "SET_FORM_FIELDS",
          resetDisplayNameOverrides: true,
          fields: {
            location: fallbackLocation.label,
          },
        });
        dispatch({ type: "SET_USER_LOCATION", location: fallbackLocation });
      }
    };

    setIsLocatingUser(true);
    void (async () => {
      const positionResult = await requestCurrentPositionWithRetry({
        timeoutMs: GEOLOCATION_TIMEOUT_MS,
        maxAttempts: 2,
      });

      if (!positionResult.ok) {
        setLocationPermissionMessage(
          getGeolocationFailureMessage(positionResult.reason),
        );
        setIsLocatingUser(false);
        return;
      }

      await applyLocation(positionResult.lat, positionResult.lon);
      setIsLocatingUser(false);
    })();
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <form className="settings-panel" onSubmit={onSubmit}>
      <div
        className={`mobile-section mobile-section--location accordion-item${openSections.has("location") ? " accordion-item--open" : ""}`}
      >
        <AccordionHeader
          sectionId="location"
          label={accordionSections[0].label}
          Icon={accordionSections[0].Icon}
          isOpen={openSections.has("location")}
          onToggle={toggleSection}
        />
        <div
          className={`accordion-body${openSections.has("location") ? " is-open" : ""}`}
        >
          <div className="accordion-body-inner">
            {!isColorEditorActive ? (
              <LocationSection
                form={state.form}
                onChange={handleChange}
                onLocationFocus={() => setLocationFocused(true)}
                onLocationBlur={() => setLocationFocused(false)}
                showLocationSuggestions={showLocationSuggestions}
                locationSuggestions={locationSuggestions}
                isLocationSearching={isLocationSearching}
                onLocationSelect={onLocationSelect}
                onClearLocation={handleClearLocation}
                onUseCurrentLocation={handleUseCurrentLocation}
                isLocatingUser={isLocatingUser}
                locationPermissionMessage={locationPermissionMessage}
              />
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={`mobile-section mobile-section--theme-settings accordion-item${openSections.has("theme") ? " accordion-item--open" : ""}`}
      >
        <AccordionHeader
          sectionId="theme"
          label={accordionSections[1].label}
          Icon={accordionSections[1].Icon}
          isOpen={openSections.has("theme")}
          onToggle={toggleSection}
        />
        <div
          className={`accordion-body${openSections.has("theme") ? " is-open" : ""}`}
        >
          <div className="accordion-body-inner">
            {!isColorEditorActive ? (
              <MapSettingsSection
                activeMobileTab={mobileTab}
                form={state.form}
                onChange={handleChange}
                onNumericFieldBlur={handleNumericFieldBlur}
                onThemeChange={handleThemeChange}
                onLayoutChange={handleLayoutChange}
                selectedTheme={selectedTheme}
                themeOptions={themeOptions}
                layoutGroups={layoutGroups}
                minPosterCm={MIN_POSTER_CM}
                maxPosterCm={MAX_POSTER_CM}
                customColors={state.customColors}
                onColorChange={handleColorChange}
                onResetColors={handleResetColors}
                onColorEditorActiveChange={setIsColorEditorActive}
              />
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={`mobile-section mobile-section--layout-settings accordion-item${openSections.has("layout") ? " accordion-item--open" : ""}`}
      >
        <AccordionHeader
          sectionId="layout"
          label={accordionSections[2].label}
          Icon={accordionSections[2].Icon}
          isOpen={openSections.has("layout")}
          onToggle={toggleSection}
        />
        <div
          className={`accordion-body${openSections.has("layout") ? " is-open" : ""}`}
        >
          <div className="accordion-body-inner">
            {!isColorEditorActive ? (
              <MapSettingsSection
                activeMobileTab={mobileTab}
                form={state.form}
                onChange={handleChange}
                onNumericFieldBlur={handleNumericFieldBlur}
                onThemeChange={handleThemeChange}
                onLayoutChange={handleLayoutChange}
                selectedTheme={selectedTheme}
                themeOptions={themeOptions}
                layoutGroups={layoutGroups}
                minPosterCm={MIN_POSTER_CM}
                maxPosterCm={MAX_POSTER_CM}
                customColors={state.customColors}
                onColorChange={handleColorChange}
                onResetColors={handleResetColors}
                onColorEditorActiveChange={setIsColorEditorActive}
              />
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={`mobile-section mobile-section--layers accordion-item${openSections.has("layers") ? " accordion-item--open" : ""}`}
      >
        <AccordionHeader
          sectionId="layers"
          label={accordionSections[3].label}
          Icon={accordionSections[3].Icon}
          isOpen={openSections.has("layers")}
          onToggle={toggleSection}
        />
        <div
          className={`accordion-body${openSections.has("layers") ? " is-open" : ""}`}
        >
          <div className="accordion-body-inner">
            {!isAuxEditorActive ? (
              <LayersSection
                form={state.form}
                onChange={handleChange}
                minPosterCm={MIN_POSTER_CM}
                maxPosterCm={MAX_POSTER_CM}
                onNumericFieldBlur={handleNumericFieldBlur}
              />
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={`mobile-section mobile-section--markers accordion-item${openSections.has("markers") ? " accordion-item--open" : ""}`}
      >
        <AccordionHeader
          sectionId="markers"
          label={accordionSections[4].label}
          Icon={accordionSections[4].Icon}
          isOpen={openSections.has("markers")}
          onToggle={toggleSection}
        />
        <div
          className={`accordion-body${openSections.has("markers") ? " is-open" : ""}`}
        >
          <div className="accordion-body-inner">
            {!isColorEditorActive ? (
              <>
                <BusinessBrandingSection
                  branding={state.businessBranding}
                  onChange={(changes: Partial<BusinessBranding>) => dispatch({ type: "SET_BUSINESS_BRANDING", changes })}
                  onApplyBrandTheme={() => {
                    const { brandPrimary, brandSecondary, brandAccent } = state.businessBranding;
                    const brandTheme = generateBrandTheme(brandPrimary, brandSecondary, brandAccent);
                    dispatch({ type: "SET_COLOR", key: "ui.bg", value: brandTheme.ui.bg });
                    dispatch({ type: "SET_COLOR", key: "ui.text", value: brandTheme.ui.text });
                    dispatch({ type: "SET_COLOR", key: "map.land", value: brandTheme.map.land });
                    dispatch({ type: "SET_COLOR", key: "map.water", value: brandTheme.map.water });
                    dispatch({ type: "SET_COLOR", key: "map.waterway", value: brandTheme.map.waterway });
                    dispatch({ type: "SET_COLOR", key: "map.parks", value: brandTheme.map.parks });
                    dispatch({ type: "SET_COLOR", key: "map.buildings", value: brandTheme.map.buildings });
                    dispatch({ type: "SET_COLOR", key: "map.roads.major", value: brandTheme.map.roads.major });
                    dispatch({ type: "SET_COLOR", key: "map.roads.minor_high", value: brandTheme.map.roads.minor_high });
                    dispatch({ type: "SET_COLOR", key: "map.roads.minor_mid", value: brandTheme.map.roads.minor_mid });
                    dispatch({ type: "SET_COLOR", key: "map.roads.minor_low", value: brandTheme.map.roads.minor_low });
                    dispatch({ type: "SET_COLOR", key: "map.roads.path", value: brandTheme.map.roads.path });
                    dispatch({ type: "SET_COLOR", key: "map.roads.outline", value: brandTheme.map.roads.outline });
                  }}
                />
                <MarkersSection />
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={`mobile-section mobile-section--style accordion-item${openSections.has("style") ? " accordion-item--open" : ""}`}
      >
        <AccordionHeader
          sectionId="style"
          label={accordionSections[5].label}
          Icon={accordionSections[5].Icon}
          isOpen={openSections.has("style")}
          onToggle={toggleSection}
        />
        <div
          className={`accordion-body${openSections.has("style") ? " is-open" : ""}`}
        >
          <div className="accordion-body-inner">
            {!isAuxEditorActive ? (
              <TypographySection
                form={state.form}
                onChange={handleChange}
                fontOptions={FONT_OPTIONS}
                onCreditsChange={handleCreditsChange}
              />
            ) : null}
          </div>
        </div>
      </div>


      <div
        className={`mobile-section mobile-section--batch accordion-item${openSections.has("batch") ? " accordion-item--open" : ""}`}
      >
        <AccordionHeader
          sectionId="batch"
          label={accordionSections[6].label}
          Icon={accordionSections[6].Icon}
          isOpen={openSections.has("batch")}
          onToggle={toggleSection}
        />
        <div
          className={`accordion-body${openSections.has("batch") ? " is-open" : ""}`}
        >
          <div className="accordion-body-inner">
            {!isAuxEditorActive ? <BatchGenerator /> : null}
          </div>
        </div>
      </div>

      {!isAuxEditorActive && state.error ? <p className="error">{state.error}</p> : null}
    </form>
  );
}

function AccordionHeader({
  sectionId,
  label,
  Icon,
  isOpen,
  onToggle,
}: {
  sectionId: SectionId;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  isOpen: boolean;
  onToggle: (id: SectionId) => void;
}) {
  return (
    <button
      type="button"
      className={`accordion-header${isOpen ? " is-open" : ""}`}
      onClick={() => onToggle(sectionId)}
      aria-expanded={isOpen}
    >
      <Icon className="accordion-icon" />
      <span className="accordion-label">{label}</span>
      <ChevronDownIcon className="accordion-chevron" />
    </button>
  );
}
