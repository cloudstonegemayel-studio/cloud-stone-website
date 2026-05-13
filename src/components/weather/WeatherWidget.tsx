"use client";

import { useEffect, useRef, useState } from "react";

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

// ─── Three.js 3D cloud ────────────────────────────────────────────────────────
// Blob positions from the reference Three.js script (unchanged).
const BLOBS: Array<[number, number, number, number]> = [
  [-1.10, -0.30,  0.05, 0.80],
  [ 0.10, -0.40,  0.10, 1.00],
  [ 1.15, -0.20, -0.05, 0.75],
  [-0.70,  0.45,  0.05, 0.55],
  [ 0.45,  0.70,  0.05, 0.85],
  [ 0.10,  0.00, -0.75, 0.85],
  [ 0.00, -0.10,  0.75, 0.80],
];

function Cloud3D({ color = "#AED0F0", size = 56 }: { color?: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let destroyed = false;
    let rafId    = 0;
    let dispose: (() => void) | null = null;

    import("three").then((THREE) => {
      if (destroyed || !canvas) return;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(size, size);
      renderer.setClearColor(0x000000, 0);

      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
      camera.position.set(0, 0.2, 8.5);
      camera.lookAt(0, 0, 0);

      const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });
      const geo = new THREE.SphereGeometry(1, 32, 24);
      const cloud = new THREE.Group();
      for (const [x, y, z, r] of BLOBS) {
        const m = new THREE.Mesh(geo, mat);
        m.position.set(x, y, z);
        m.scale.setScalar(r);
        cloud.add(m);
      }
      cloud.position.y = -0.1;
      scene.add(cloud);

      const t0 = performance.now();
      const tick = (now: number) => {
        if (destroyed) return;
        const t = (now - t0) / 1000;
        cloud.rotation.y  = -(t / 6.0) * Math.PI * 2;
        cloud.position.y  = -0.1 + Math.sin(t * 1.6) * 0.04;
        renderer.render(scene, camera);
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);

      dispose = () => {
        cancelAnimationFrame(rafId);
        geo.dispose();
        mat.dispose();
        renderer.dispose();
      };
    });

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
      dispose?.();
    };
  }, [color, size]);

  return <canvas ref={canvasRef} style={{ display: "block" }} />;
}

// Wrapper: Cloud3D canvas with optional SVG overlay for weather effects.
// Effects SVG uses the same 56×56 coordinate space.
function CloudIcon({ color = "#AED0F0", overlay }: { color?: string; overlay?: React.ReactNode }) {
  return (
    <div style={{ position: "relative", width: 56, height: 56 }}>
      <Cloud3D color={color} size={56} />
      {overlay && (
        <svg
          viewBox="0 0 56 56"
          fill="none"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        >
          {overlay}
        </svg>
      )}
    </div>
  );
}

// ─── Icon components ──────────────────────────────────────────────────────────
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

// Partly cloudy: small orb visible in top-left, cloud rotates in front
function FewCloudsIcon({ night }: { night: boolean }) {
  return (
    <div style={{ position: "relative", width: 56, height: 56 }}>
      {/* orb behind cloud */}
      <svg viewBox="0 0 28 28" fill="none" style={{ position: "absolute", top: 0, left: 0, width: 28, height: 28, zIndex: 0 }}>
        {night ? (
          <>
            <defs>
              <mask id="ww-mMaskSm">
                <rect width="28" height="28" fill="white" />
                <circle cx="17" cy="11" r="7" fill="black" />
              </mask>
            </defs>
            <circle className="ww-moon" cx="12" cy="14" r="9" fill="#C86733" mask="url(#ww-mMaskSm)" />
          </>
        ) : (
          <>
            <g className="ww-sun-rays-sm" stroke="#C86733" strokeWidth="1.8" strokeLinecap="round">
              {Array.from({ length: 8 }, (_, i) => (
                <line key={i} x1="14" y1="5" x2="14" y2="1.5" transform={`rotate(${i * 45} 14 14)`} />
              ))}
            </g>
            <circle className="ww-sun-core" cx="14" cy="14" r="6" fill="#C86733" />
          </>
        )}
      </svg>
      {/* cloud in front */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        <Cloud3D color="#AED0F0" size={56} />
      </div>
    </div>
  );
}

function CloudyIcon() {
  return <CloudIcon color="#AED0F0" />;
}

function RainIcon() {
  return (
    <CloudIcon
      color="#AED0F0"
      overlay={
        <g className="ww-rain" stroke="#B7D1EA" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="44" x2="15" y2="54" />
          <line x1="28" y1="45" x2="25" y2="55" />
          <line x1="38" y1="44" x2="35" y2="54" />
        </g>
      }
    />
  );
}

function ThunderIcon() {
  return (
    <CloudIcon
      color="#BCB7B8"
      overlay={
        <polygon
          className="ww-bolt"
          points="29,40 22,52 29,49 23,56 38,44 31,46"
          fill="#C86733"
        />
      }
    />
  );
}

function SnowIcon() {
  return (
    <CloudIcon
      color="#B7D1EA"
      overlay={
        <g className="ww-snowflakes" fill="#F0EEE9">
          <circle cx="18" cy="50" r="2.5" />
          <circle cx="28" cy="52" r="2.5" />
          <circle cx="38" cy="50" r="2.5" />
        </g>
      }
    />
  );
}

function FogIcon() {
  return (
    <svg viewBox="0 0 120 80" fill="none" width="56" height="56">
      <g className="ww-fog">
        <rect x="20" y="18" width="80" height="8" rx="4" fill="#BCB7B8" />
        <rect x="28" y="36" width="66" height="8" rx="4" fill="#BCB7B8" />
        <rect x="22" y="54" width="74" height="8" rx="4" fill="#BCB7B8" />
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
  const [celsius, setCelsius]  = useState(true);

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
            id:   cur.weather[0].id as number,
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
          if (d.latitude && d.longitude && d.city) applyWeather(d.latitude, d.longitude, d.city);
          else fallback();
        })
        .catch(fallback);

    if (typeof navigator === "undefined") { fallback(); return; }

    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" })
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
          position: fixed; top: 16px; right: 16px; z-index: 55;
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border-radius: 16px; padding: 6px 12px 8px;
          color: #392D2B;
          font-family: var(--font-inter-tight,"Inter Tight",system-ui,sans-serif);
          box-shadow: 0 10px 30px rgba(0,0,0,0.12);
          display: grid; grid-template-columns: auto auto;
          column-gap: 16px; align-items: center;
          pointer-events: auto; user-select: none;
        }
        .ww-left  { display: flex; flex-direction: column; gap: 6px; }
        .ww-location {
          display: flex; align-items: center; gap: 4px;
          font-size: 11px; font-weight: 500; opacity: 0.6;
        }
        .ww-temp-num { font-size: 34px; font-weight: 600; line-height: 1; letter-spacing: -1px; }
        .ww-temp-unit { display: flex; align-items: center; gap: 1px; font-size: 11px; font-weight: 500; }
        .ww-temp-unit button {
          background: none; border: none; padding: 0 2px; cursor: pointer;
          color: #392D2B; opacity: 0.4; font-size: 11px; font-weight: 500;
          font-family: inherit; transition: opacity 0.2s; pointer-events: auto;
        }
        .ww-temp-unit button.active, .ww-temp-unit button:hover { opacity: 1; }
        .ww-sep { opacity: 0.25; padding: 0 1px; }
        .ww-right { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .ww-icon  { width: 56px; height: 56px; }
        .ww-desc  {
          font-size: 10px; font-weight: 500; text-align: center;
          opacity: 0.6; max-width: 72px; line-height: 1.3;
        }

        /* ── sun / moon ── */
        @keyframes ww-sun-pulse { 0%,100%{transform:scale(0.85)} 50%{transform:scale(1.15)} }
        @keyframes ww-core-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        @keyframes ww-moon-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
        .ww-sun-rays    { transform-origin:50px 50px; animation:ww-sun-pulse 1.8s ease-in-out infinite; }
        .ww-sun-rays-sm { transform-origin:14px 14px; animation:ww-sun-pulse 1.8s ease-in-out infinite; }
        .ww-sun-core    { transform-box:fill-box; transform-origin:50% 50%; animation:ww-core-pulse 2.6s ease-in-out infinite; }
        .ww-moon        { transform-box:fill-box; transform-origin:50% 50%; animation:ww-moon-pulse 4s ease-in-out infinite; }

        /* ── rain ── */
        @keyframes ww-rain-drop {
          0%  { transform:translateY(-5px); opacity:0; }
          20% { opacity:1; }
          80% { opacity:1; }
          100%{ transform:translateY(8px); opacity:0; }
        }
        .ww-rain line                { animation:ww-rain-drop 1.2s linear infinite; }
        .ww-rain line:nth-child(2)   { animation-delay:.35s; }
        .ww-rain line:nth-child(3)   { animation-delay:.7s;  }

        /* ── thunder ── */
        @keyframes ww-bolt-flash { 0%,80%,100%{opacity:1} 85%,90%{opacity:.3} }
        .ww-bolt { transform-box:fill-box; transform-origin:50% 50%; animation:ww-bolt-flash 2.2s ease-in-out infinite; }

        /* ── snow ── */
        @keyframes ww-snow-fall {
          0%  { transform:translateY(-4px); opacity:0; }
          25% { opacity:1; }
          100%{ transform:translateY(7px); opacity:0; }
        }
        .ww-snowflakes circle             { animation:ww-snow-fall 2s ease-in-out infinite; }
        .ww-snowflakes circle:nth-child(2){ animation-delay:.5s; }
        .ww-snowflakes circle:nth-child(3){ animation-delay:1s;  }

        /* ── fog ── */
        @keyframes ww-fog-shift { 0%,100%{transform:translateX(0)} 50%{transform:translateX(5px)} }
        .ww-fog rect              { animation:ww-fog-shift 3s ease-in-out infinite; }
        .ww-fog rect:nth-child(2) { animation-delay:.4s; }
        .ww-fog rect:nth-child(3) { animation-delay:.8s; }

        @media (max-width: 767px) { .ww-widget { display: none; } }
      `}</style>
    </div>
  );
}
