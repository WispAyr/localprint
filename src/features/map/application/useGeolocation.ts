import { useEffect, useRef } from "react";
import {
  DEFAULT_LAT,
  DEFAULT_LON,
  DEFAULT_CITY,
  DEFAULT_COUNTRY,
} from "@/core/config";
import { GEOLOCATION_TIMEOUT_MS } from "@/features/map/infrastructure";
import type { PosterAction } from "@/features/poster/application/posterReducer";
import { reverseGeocodeCoordinates } from "@/core/services";

/**
 * Initializes map start position from browser geolocation.
 * Skips if a location has already been set (e.g. from a loaded design).
 */
export function useGeolocation(dispatch: React.Dispatch<PosterAction>, skipGeolocation = false) {
  const hasApplied = useRef(false);

  useEffect(() => {
    if (skipGeolocation || hasApplied.current) return;
    hasApplied.current = true;

    let cancelled = false;

    const applyFallback = () => {
      if (cancelled) return;
      dispatch({ type: "SET_USER_LOCATION", location: null });
      dispatch({
        type: "SET_FORM_FIELDS",
        resetDisplayNameOverrides: true,
        fields: {
          location: "Ayr, South Ayrshire, Scotland",
          latitude: DEFAULT_LAT.toFixed(6),
          longitude: DEFAULT_LON.toFixed(6),
          displayCity: DEFAULT_CITY,
          displayCountry: DEFAULT_COUNTRY,
          displayContinent: "Europe",
        },
      });
    };

    if (!navigator.geolocation) {
      applyFallback();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        dispatch({
          type: "SET_FORM_FIELDS",
          resetDisplayNameOverrides: true,
          fields: {
            latitude: lat.toFixed(6),
            longitude: lon.toFixed(6),
          },
        });
        dispatch({
          type: "SET_USER_LOCATION",
          location: {
            id: `user:${lat.toFixed(6)},${lon.toFixed(6)}`,
            label: "Current Location",
            city: "",
            country: "",
            continent: "",
            lat,
            lon,
          },
        });

        void reverseGeocodeCoordinates(lat, lon)
          .then((nearest) => {
            if (cancelled) return;
            const city = String(nearest.city ?? "").trim();
            const country = String(nearest.country ?? "").trim();
            const label =
              [city, country].filter(Boolean).join(", ") ||
              String(nearest.label ?? "").trim();
            const continent = String(nearest.continent ?? "").trim();
            if (!label) return;

            dispatch({
              type: "SET_FORM_FIELDS",
              resetDisplayNameOverrides: true,
              fields: {
                location: label,
                displayCity: city,
                displayCountry: country,
                displayContinent: continent,
              },
            });
            dispatch({ type: "SET_USER_LOCATION", location: nearest });
          })
          .catch(() => {});
      },
      () => {
        applyFallback();
      },
      {
        enableHighAccuracy: false,
        timeout: GEOLOCATION_TIMEOUT_MS,
        maximumAge: Infinity,
      },
    );

    return () => {
      cancelled = true;
    };
  }, [dispatch, skipGeolocation]);
}
