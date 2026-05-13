"use client";

import { useEffect, useState } from "react";

const API_KEY = "32a669c3ef56db4fe5bf8dd741657aff";
const DEFAULT_LAT = 40.7128;
const DEFAULT_LON = -74.006;
const DEFAULT_CITY = "New York";

interface WeatherState {
  temp: number;
  desc: string;
  id: number;
  isDay: boolean;
  city: string;
}

function conditionKey(id: number, isDay: boolean): string {
  if (id === 800) return isDay ? "clear-day" : "clear-night";
  if (id >= 801 && id <= 802) return "few-clouds";
  if (id >= 803) return "cloudy";
  if (id >= 200 && id < 300) return "thunder";
  if (id >= 300 && id < 600) return "rain";
  if (id >= 600 && id < 700) return "snow";
  if (id >= 700 && id < 800) return "fog";
  return "cloudy";
}

// ─── Cloud shape ──────────────────────────────────────────────────────────────
// 7 circles projected from Three.js blob positions (scale=25px/unit, center=(60,55),
// y-flipped so 3D +y = SVG -y). viewBox "0 0 120 100".
function CloudCircles({ fill = "#AED0F0" }: { fill?: string }) {
  return (
    <g fill={fill}>
      {/* Three.js blob: [-1.10,-0.30, r=0.80] → left base */}
      <circle cx="33" cy="63" r="20" />
      {/* [0.10,-0.40, r=1.00] → center base */}
      <circle cx="63" cy="65" r="25" />
      {/* [1.15,-0.20, r=0.75] → right base */}
      <circle cx="89" cy="60" r="19" />
      {/* [-0.70,0.45, r=0.55] → left top bump */}
      <circle cx="43" cy="44" r="14" />
      {/* [0.45,0.70, r=0.85] → right top bump */}
      <circle cx="71" cy="38" r="21" />
      {/* [0.10,0.00, r=0.85] → depth filler center */}
      <circle cx="63" cy="55" r="21" />
      {/* [0.00,-0.10, r=0.80] → depth filler center */}
      <circle cx="60" cy="58" r="20" />
    </g>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function SunIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" width="56" height="56">
      <g className="ww-sun-rays" stroke="#C86733" strokeWidth="4" strokeLinecap="round">
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1="50" y1="22" x2="50" y2="12" transform={`rotate(${i * 45} 50 50)`} />
        ))}
      </g>
      <circle className="ww-sun-core" cx="50" cy="50" r="18" fill="#C86733" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 100 100" width="56" height="56">
      <defs>
        <mask id="ww-moonMask">
          <rect width="100" height="100" fill="white" />
          <circle cx="60" cy="42" r="26" fill="black" />
        </mask>
      </defs>
      <circle className="ww-moon" cx="50" cy="50" r="30" fill="#C86733" mask="url(#ww-moonMask)" />
    </svg>
  );
}

function FewCloudsIcon({ night }: { night: boolean }) {
  return (
    <svg viewBox="0 0 130 100" fill="none" width="56" height="56">
      {night ? (
        <path d="M40 22 C28 22 20 32 23 44 C26 54 38 58 50 54 C58 48 59 32 52 26 C48 23 44 22 40 22Z" fill="#F0EEE9" />
      ) : (
        <>
          <g className="ww-sun-rays-sm" stroke="#C86733" strokeWidth="3" strokeLinecap="round" fill="none">
            {Array.from({ length: 8 }, (_, i) => (
              <line key={i} x1="36" y1="10" x2="36" y2="4" transform={`rotate(${i * 45} 36 32)`} />
            ))}
          </g>
          <circle className="ww-sun-core" cx="36" cy="32" r="12" fill="#C86733" />
        </>
      )}
      <g className="ww-cloud" transform="translate(15 12)">
        <CloudCircles fill="#AED0F0" />
      </g>
    </svg>
  );
}

function CloudyIcon() {
  return (
    <svg viewBox="0 0 120 100" fill="none" width="56" height="56">
      <g className="ww-cloud">
        <CloudCircles fill="#AED0F0" />
      </g>
    </svg>
  );
}

function RainIcon() {
  return (
    <svg viewBox="0 0 120 120" fill="none" width="56" height="56">
      <g className="ww-cloud">
        <CloudCircles fill="#AED0F0" />
      </g>
      <g className="ww-rain" stroke="#B7D1EA" strokeWidth="4" strokeLinecap="round">
        <line x1="40" y1="86" x2="36" y2="104" />
        <line x1="60" y1="88" x2="56" y2="108" />
        <line x1="80" y1="86" x2="76" y2="104" />
      </g>
    </svg>
  );
}

function ThunderIcon() {
  return (
    <svg viewBox="0 0 120 115" fill="none" width="56" height="56">
      <g className="ww-cloud">
        <CloudCircles fill="#BCB7B8" />
      </g>
      <polygon className="ww-bolt" points="60,66 50,86 64,82 56,104 78,76 64,78" fill="#C86733" />
    </svg>
  );
}

function SnowIcon() {
  return (
    <svg viewBox="0 0 120 115" fill="none" width="56" height="56">
      <g className="ww-cloud">
        <CloudCircles fill="#B7D1EA" />
      </g>
      <g className="ww-snowflakes" fill="#F0EEE9">
        <circle cx="42" cy="90" r="3.5" />
        <circle cx="62" cy="92" r="3.5" />
        <circle cx="82" cy="90" r="3.5" />
      </g>
    </svg>
  );
}

function FogIcon() {
  return (
    <svg viewBox="0 0 120 80" fill="none" width="56" height="56">
      <g className="ww-fog">
        <rect x="20" y="24" width="80" height="8" rx="4" fill="#BCB7B8" />
        <rect x="30" y="42" width="65" height="8" rx="4" fill="#BCB7B8" />
        <rect x="22" y="60" width="75" height="8" rx="4" fill="#BCB7B8" />
      </g>
    </svg>
  );
}

function WeatherIcon({ condition, isDay }: { condition: string; isDay: boolean }) {
  switch (condition) {
    case "clear-day":   return <SunIcon />;
    case "clear-night": return <MoonIcon />;
    case "few-clouds":  return <FewCloudsIcon night={!isDay} />;
    case "cloudy":      return <CloudyIcon />;
    case "rain":        return <RainIcon />;
    case "thunder":     return <ThunderIcon />;
    case "snow":        return <SnowIcon />;
    default:            return <FogIcon />;
  }
}

// ─── Widget ───────────────────────────────────────────────────────────────────
export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherState | null>(null);
  const [celsius, setCelsius] = useState(true);

  useEffect(() => {
    const applyWeather = (lat: number, lon: number, city: string) => {
      fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&exclude=minutely,hourly,daily,alerts`)
        .then((r) => r.json())
        .then((data) => {
          const cur = data.current;
          const isDay = (cur.dt as number) >= (cur.sunrise as number) && (cur.dt as number) < (cur.sunset as number);
          setWeather({
            temp: Math.round(cur.temp as number),
            desc: cur.weather[0].description as string,
            id: cur.weather[0].id as number,
            isDay,
            city,
          });
        })
        .catch(() => {});
    };

    const fallback = () => applyWeather(DEFAULT_LAT, DEFAULT_LON, DEFAULT_CITY);

    const fromIP = () =>
      fetch("https://ipapi.co/json/")
        .then((r) => r.json())
        .then((d) => {
          if (d.latitude && d.longitude && d.city) {
            applyWeather(d.latitude, d.longitude, d.city);
          } else {
            fallback();
          }
        })
        .catch(fallback);

    if (typeof navigator === "undefined") { fallback(); return; }

    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          if (result.state === "granted") {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const { latitude: lat, longitude: lon } = pos.coords;
                fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`)
                  .then((r) => r.json())
                  .then((geo) => {
                    const city = (Array.isArray(geo) && (geo[0]?.local_names?.en || geo[0]?.name)) || DEFAULT_CITY;
                    applyWeather(lat, lon, city);
                  })
                  .catch(() => applyWeather(lat, lon, DEFAULT_CITY));
              },
              fromIP,
              { timeout: 5000 }
            );
          } else {
            fromIP();
          }
        })
        .catch(fromIP);
    } else {
      fromIP();
    }
  }, []);

  if (!weather) return null;

  const displayTemp = celsius ? weather.temp : Math.round(weather.temp * 9 / 5 + 32);
  const condition   = conditionKey(weather.id, weather.isDay);
  const desc        = weather.desc.charAt(0).toUpperCase() + weather.desc.slice(1);

  return (
    <div className="ww-widget" role="complementary" aria-label="Current weather">
      <div className="ww-left">
        <div className="ww-location">
          <svg width="10" height="13" viewBox="0 0 10 13" fill="none" aria-hidden="true">
            <path d="M5 0C2.24 0 0 2.24 0 5c0 3.75 5 8 5 8s5-4.25 5-8c0-2.76-2.24-5-5-5zm0 6.5C4.17 6.5 3.5 5.83 3.5 5S4.17 3.5 5 3.5 6.5 4.17 6.5 5 5.83 6.5 5 6.5z" fill="currentColor" />
          </svg>
          <span>{weather.city}</span>
        </div>
        <span className="ww-temp-num">{displayTemp}</span>
        <span className="ww-temp-unit">
          <button type="button" className={celsius ? "active" : ""} onClick={() => setCelsius(true)} aria-label="Celsius">°C</button>
          <span className="ww-sep">|</span>
          <button type="button" className={!celsius ? "active" : ""} onClick={() => setCelsius(false)} aria-label="Fahrenheit">°F</button>
        </span>
      </div>

      <div className="ww-right">
        <div className="ww-icon">
          <WeatherIcon condition={condition} isDay={weather.isDay} />
        </div>
        <div className="ww-desc">{desc}</div>
      </div>

      <style jsx global>{`
        .ww-widget {
          position: fixed;
          top: 16px;
          right: 16px;
          z-index: 55;
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 16px;
          padding: 6px 12px 8px;
          color: #392D2B;
          font-family: var(--font-inter-tight,"Inter Tight",system-ui,sans-serif);
          box-shadow: 0 10px 30px rgba(0,0,0,0.12);
          display: grid;
          grid-template-columns: auto auto;
          column-gap: 16px;
          align-items: center;
          pointer-events: auto;
          user-select: none;
        }
        .ww-left {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ww-location {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 500;
          opacity: 0.6;
        }
        .ww-temp-num {
          font-size: 34px;
          font-weight: 600;
          line-height: 1;
          letter-spacing: -1px;
        }
        .ww-temp-unit {
          display: flex;
          align-items: center;
          gap: 1px;
          font-size: 11px;
          font-weight: 500;
        }
        .ww-temp-unit button {
          background: none;
          border: none;
          padding: 0 2px;
          cursor: pointer;
          color: #392D2B;
          opacity: 0.4;
          font-size: 11px;
          font-weight: 500;
          font-family: inherit;
          transition: opacity 0.2s;
          pointer-events: auto;
        }
        .ww-temp-unit button.active,
        .ww-temp-unit button:hover { opacity: 1; }
        .ww-sep { opacity: 0.25; padding: 0 1px; }
        .ww-right {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .ww-icon {
          width: 56px;
          height: 56px;
          perspective: 200px;
        }
        .ww-desc {
          font-size: 10px;
          font-weight: 500;
          text-align: center;
          opacity: 0.6;
          max-width: 72px;
          line-height: 1.3;
        }

        /* ── icon keyframes ── */
        @keyframes ww-sun-scale {
          0%, 100% { transform: scale(0.85); }
          50%       { transform: scale(1.15); }
        }
        @keyframes ww-core-pulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.08); }
        }
        @keyframes ww-spin-y {
          from { transform: perspective(120px) rotateY(0deg); }
          to   { transform: perspective(120px) rotateY(-360deg); }
        }
        @keyframes ww-rain-drop {
          0%   { transform: translateY(-6px); opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(10px); opacity: 0; }
        }
        @keyframes ww-bolt-flash {
          0%, 80%, 100% { opacity: 1; }
          85%, 90%       { opacity: 0.35; }
        }
        @keyframes ww-snow-fall {
          0%   { transform: translateY(-4px); opacity: 0; }
          25%  { opacity: 1; }
          100% { transform: translateY(8px); opacity: 0; }
        }
        @keyframes ww-moon-pulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.06); }
        }

        /* ── sun ── */
        .ww-sun-rays {
          transform-origin: 50px 50px;
          animation: ww-sun-scale 1.8s ease-in-out infinite;
        }
        .ww-sun-rays-sm {
          transform-origin: 36px 32px;
          animation: ww-sun-scale 1.8s ease-in-out infinite;
        }
        .ww-sun-core {
          transform-origin: 50% 50%;
          transform-box: fill-box;
          animation: ww-core-pulse 2.6s ease-in-out infinite;
        }

        /* ── cloud spin ── */
        .ww-cloud {
          transform-origin: 50% 50%;
          transform-box: fill-box;
          animation: ww-spin-y 6s linear infinite;
        }

        /* ── rain ── */
        .ww-rain line                  { animation: ww-rain-drop 1.2s linear infinite; }
        .ww-rain line:nth-child(2)     { animation-delay: 0.35s; }
        .ww-rain line:nth-child(3)     { animation-delay: 0.7s; }

        /* ── thunder ── */
        .ww-bolt {
          animation: ww-bolt-flash 2.2s ease-in-out infinite;
          transform-origin: 50% 50%;
          transform-box: fill-box;
        }

        /* ── snow ── */
        .ww-snowflakes circle             { animation: ww-snow-fall 2s ease-in-out infinite; }
        .ww-snowflakes circle:nth-child(2){ animation-delay: 0.5s; }
        .ww-snowflakes circle:nth-child(3){ animation-delay: 1s; }

        /* ── fog ── */
        .ww-fog rect {
          animation: ww-spin-y 4s ease-in-out infinite;
          transform-origin: 50% 50%;
          transform-box: fill-box;
        }
        .ww-fog rect:nth-child(2) { animation-delay: 0.4s; }
        .ww-fog rect:nth-child(3) { animation-delay: 0.8s; }

        /* ── moon ── */
        .ww-moon {
          transform-origin: 50% 50%;
          transform-box: fill-box;
          animation: ww-moon-pulse 4s ease-in-out infinite;
        }

        @media (max-width: 767px) {
          .ww-widget { display: none; }
        }
      `}</style>
    </div>
  );
}
