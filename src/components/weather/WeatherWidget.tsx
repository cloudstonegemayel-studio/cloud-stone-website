"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    eapps?: {
      AppsManager?: {
        reload?: () => void;
      };
    };
  }
}

/**
 * Elfsight Weather Widget — embedded via script tag in root layout.
 * The `elfsight-app-*` class is assigned in Elfsight dashboard.
 * Replace the ID below with your actual Elfsight widget ID.
 */
export function WeatherWidget() {
  useEffect(() => {
    if (window.eapps?.AppsManager?.reload) {
      window.eapps.AppsManager.reload();
    }
  }, []);

  return (
    <div className="weather-widget-wrapper" aria-label="Local weather">
      {/* Elfsight Weather | Cloud stone widjet */}
      <div
        className="elfsight-app-8294ddb1-6460-4546-8caf-0266985ad33c"
        data-elfsight-app-lazy
      />
    </div>
  );
}
