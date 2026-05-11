"use client";

import { useEffect, useState } from "react";

const API_KEY = "32a669c3ef56db4fe5bf8dd741657aff";
const FALLBACK_LAT = 48.6239;
const FALLBACK_LON = 22.295;
const FALLBACK_CITY = "Uzhhorod";

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

function SunIcon() {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <g style={{ transformOrigin: "28px 28px", animation: "ww-rays 8s linear infinite" }}>
        {rays.map((a) => {
          const rad = (a * Math.PI) / 180;
          return (
            <line
              key={a}
              x1={28 + Math.cos(rad) * 19}
              y1={28 + Math.sin(rad) * 19}
              x2={28 + Math.cos(rad) * 25}
              y2={28 + Math.sin(rad) * 25}
              stroke="#C86733"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          );
        })}
      </g>
      <circle cx="28" cy="28" r="11" fill="#C86733" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <path
        d="M34 28c0 8.837-7.163 16-16 16-2.5 0-4.86-.576-6.96-1.6C13.44 45.3 18.95 48 25 48c9.941 0 18-8.059 18-18 0-6.05-2.7-11.56-6.6-15.04C37.424 17.14 38 19.5 38 22c0 3.314-1.686 6.25-4 8z"
        fill="#392D2B"
        style={{ transformOrigin: "28px 28px", animation: "ww-pulse 3s ease-in-out infinite" }}
      />
    </svg>
  );
}

function FewCloudsIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <circle cx="40" cy="18" r="8" fill="#C86733" />
      <g style={{ animation: "ww-drift 4s ease-in-out infinite" }}>
        <path
          d="M12 40c0-5.523 4.477-10 10-10 1.36 0 2.657.27 3.84.764A8 8 0 0142 36c0 4.418-3.582 8-8 8H18a6 6 0 01-6-4z"
          fill="#F0EEE9"
          stroke="rgba(57,45,43,0.12)"
          strokeWidth="1"
        />
      </g>
    </svg>
  );
}

function CloudyIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <g style={{ animation: "ww-drift 5s ease-in-out infinite", animationDelay: "0.4s" }}>
        <path
          d="M8 36c0-5.523 4.477-10 10-10 .46 0 .915.03 1.36.09A8 8 0 0136 30c0 4.418-3.582 8-8 8H14a6 6 0 01-6-2z"
          fill="rgba(57,45,43,0.2)"
        />
      </g>
      <g style={{ animation: "ww-drift 4s ease-in-out infinite" }}>
        <path
          d="M12 44c0-5.523 4.477-10 10-10 1.36 0 2.657.27 3.84.764A8 8 0 0142 40c0 4.418-3.582 8-8 8H18a6 6 0 01-6-4z"
          fill="#392D2B"
          opacity="0.55"
        />
      </g>
    </svg>
  );
}

function RainIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <path
        d="M10 30c0-5.523 4.477-10 10-10 1.36 0 2.657.27 3.84.764A8 8 0 0140 26c0 4.418-3.582 8-8 8H16a6 6 0 01-6-4z"
        fill="#392D2B"
        opacity="0.55"
      />
      {[0, 1, 2].map((i) => (
        <line
          key={i}
          x1={18 + i * 8}
          y1="40"
          x2={15 + i * 8}
          y2="50"
          stroke="#7AB6D9"
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            animation: "ww-rain 1.2s ease-in infinite",
            animationDelay: `${i * 0.35}s`,
          }}
        />
      ))}
    </svg>
  );
}

function ThunderIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <path
        d="M8 28c0-5.523 4.477-10 10-10 1.36 0 2.657.27 3.84.764A8 8 0 0138 24c0 4.418-3.582 8-8 8H14a6 6 0 01-6-4z"
        fill="#392D2B"
        opacity="0.55"
      />
      <path
        d="M27 33l-5 10h5l-4 9 11-14h-6l4-5z"
        fill="#C86733"
        style={{ animation: "ww-flash 2.4s ease-in-out infinite" }}
      />
    </svg>
  );
}

function SnowIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <path
        d="M10 26c0-5.523 4.477-10 10-10 1.36 0 2.657.27 3.84.764A8 8 0 0140 22c0 4.418-3.582 8-8 8H16a6 6 0 01-6-4z"
        fill="#392D2B"
        opacity="0.5"
      />
      {[0, 1, 2].map((i) => (
        <g
          key={i}
          style={{
            animation: "ww-snow 2s ease-in infinite",
            animationDelay: `${i * 0.55}s`,
          }}
        >
          <line x1={18 + i * 8} y1="36" x2={18 + i * 8} y2="48" stroke="#7AB6D9" strokeWidth="2" strokeLinecap="round" />
          <line x1={14 + i * 8} y1="42" x2={22 + i * 8} y2="42" stroke="#7AB6D9" strokeWidth="2" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
}

function FogIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      {[0, 1, 2].map((i) => (
        <line
          key={i}
          x1="8"
          y1={20 + i * 9}
          x2="48"
          y2={20 + i * 9}
          stroke="#392D2B"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity={0.5 - i * 0.12}
          style={{
            animation: "ww-drift 3s ease-in-out infinite",
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
    </svg>
  );
}

function WeatherIcon({ condition }: { condition: string }) {
  switch (condition) {
    case "clear-day":   return <SunIcon />;
    case "clear-night": return <MoonIcon />;
    case "few-clouds":  return <FewCloudsIcon />;
    case "cloudy":      return <CloudyIcon />;
    case "rain":        return <RainIcon />;
    case "thunder":     return <ThunderIcon />;
    case "snow":        return <SnowIcon />;
    default:            return <FogIcon />;
  }
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherState | null>(null);
  const [celsius, setCelsius] = useState(true);

  useEffect(() => {
    const fetchWeather = (lat: number, lon: number, cityFallback?: string) => {
      fetch(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&exclude=minutely,hourly,daily,alerts`
      )
        .then((r) => r.json())
        .then((data) => {
          const cur = data.current;
          const tz: string = data.timezone ?? "";
          const city = cityFallback ?? tz.split("/").pop()?.replace(/_/g, " ") ?? "Unknown";
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

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(FALLBACK_LAT, FALLBACK_LON, FALLBACK_CITY),
        { timeout: 5000 }
      );
    } else {
      fetchWeather(FALLBACK_LAT, FALLBACK_LON, FALLBACK_CITY);
    }
  }, []);

  if (!weather) return null;

  const displayTemp = celsius ? weather.temp : Math.round(weather.temp * 9 / 5 + 32);
  const condition = conditionKey(weather.id, weather.isDay);
  const desc = weather.desc.charAt(0).toUpperCase() + weather.desc.slice(1);

  return (
    <div className="ww-widget" role="complementary" aria-label="Current weather">
      <div className="ww-left">
        <div className="ww-location">
          <svg width="10" height="13" viewBox="0 0 10 13" fill="none" aria-hidden="true">
            <path d="M5 0C2.24 0 0 2.24 0 5c0 3.75 5 8 5 8s5-4.25 5-8c0-2.76-2.24-5-5-5zm0 6.5C4.17 6.5 3.5 5.83 3.5 5S4.17 3.5 5 3.5 6.5 4.17 6.5 5 5.83 6.5 5 6.5z" fill="currentColor" />
          </svg>
          <span>{weather.city}</span>
        </div>
        <div className="ww-temp">
          <span className="ww-temp-num">{displayTemp}</span>
          <span className="ww-temp-unit">
            <button
              type="button"
              className={celsius ? "active" : ""}
              onClick={() => setCelsius(true)}
              aria-label="Celsius"
            >°C</button>
            <span className="ww-sep">|</span>
            <button
              type="button"
              className={!celsius ? "active" : ""}
              onClick={() => setCelsius(false)}
              aria-label="Fahrenheit"
            >°F</button>
          </span>
        </div>
      </div>

      <div className="ww-right">
        <div className="ww-icon">
          <WeatherIcon condition={condition} />
        </div>
        <div className="ww-desc">{desc}</div>
      </div>

      <style jsx global>{`
        .ww-widget {
          position: fixed;
          top: 16px;
          right: 16px;
          z-index: 10;
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 16px;
          padding: 12px 14px;
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
        .ww-temp {
          display: flex;
          align-items: baseline;
          gap: 5px;
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
        .ww-temp-unit button:hover {
          opacity: 1;
        }
        .ww-sep {
          opacity: 0.25;
          padding: 0 1px;
        }
        .ww-right {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .ww-icon {
          width: 56px;
          height: 56px;
        }
        .ww-desc {
          font-size: 10px;
          font-weight: 500;
          text-align: center;
          opacity: 0.6;
          max-width: 72px;
          line-height: 1.3;
        }
        @keyframes ww-rays {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes ww-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.1); opacity: 0.85; }
        }
        @keyframes ww-drift {
          0%, 100% { transform: translateX(0); }
          50%       { transform: translateX(4px); }
        }
        @keyframes ww-rain {
          0%   { transform: translateY(0); opacity: 1; }
          75%  { opacity: 0.8; }
          100% { transform: translateY(10px); opacity: 0; }
        }
        @keyframes ww-flash {
          0%, 85%, 100% { opacity: 1; }
          90%            { opacity: 0.08; }
          95%            { opacity: 0.9; }
        }
        @keyframes ww-snow {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          75%  { opacity: 0.9; }
          100% { transform: translateY(12px) rotate(180deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
