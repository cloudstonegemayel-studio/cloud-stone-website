"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ContactForm } from "./ContactForm";
import { PixelButton } from "@/components/ui/PixelButton";

interface PresentationViewerProps {
  pdfUrl: string;
  title: string;
  sourcePage: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdfjsLib: any;
  }
}

const PDF_JS_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDF_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

export function PresentationViewer({ pdfUrl, title, sourcePage }: PresentationViewerProps) {
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const wrapRef       = useRef<HTMLDivElement>(null);
  const areaRef       = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
  // Pan state managed via refs for zero-rerender drag performance
  const panRef  = useRef({ x: 0, y: 0 });
  const dragRef = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null);
  const zoomRef = useRef(1);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pdfDoc,      setPdfDoc]      = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,  setTotalPages]  = useState(0);
  const [rendering,   setRendering]   = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [loadError,   setLoadError]   = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [zoomLevel,   setZoomLevel]   = useState(1);

  // Keep zoomRef in sync with state (for use in pointer handlers without closures)
  useEffect(() => { zoomRef.current = zoomLevel; }, [zoomLevel]);

  // Apply transform to wrapRef directly (no re-render)
  const applyWrapTransform = useCallback((x: number, y: number, zoom: number, animate: boolean) => {
    const w = wrapRef.current;
    if (!w) return;
    w.style.transition = animate ? "transform 200ms ease" : "none";
    w.style.transform  = `translate(${x}px, ${y}px) scale(${zoom})`;
  }, []);

  // Reset pan when zoom returns to 1 or page changes
  useEffect(() => {
    if (zoomLevel <= 1) panRef.current = { x: 0, y: 0 };
    applyWrapTransform(panRef.current.x, panRef.current.y, zoomLevel, true);
  }, [zoomLevel, applyWrapTransform]);

  useEffect(() => {
    panRef.current = { x: 0, y: 0 };
    applyWrapTransform(0, 0, zoomRef.current, true);
  }, [currentPage, applyWrapTransform]);

  // Pan pointer handlers
  const onPanDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (zoomRef.current <= 1) return;
    if ((e.target as HTMLElement).closest("button, a, input, select, textarea, [role='button']")) return;
    dragRef.current = { sx: e.clientX, sy: e.clientY, px: panRef.current.x, py: panRef.current.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPanMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const nx = dragRef.current.px + (e.clientX - dragRef.current.sx);
    const ny = dragRef.current.py + (e.clientY - dragRef.current.sy);
    panRef.current = { x: nx, y: ny };
    applyWrapTransform(nx, ny, zoomRef.current, false);
  }, [applyWrapTransform]);

  const onPanUp = useCallback(() => {
    if (!dragRef.current) return;
    dragRef.current = null;
    applyWrapTransform(panRef.current.x, panRef.current.y, zoomRef.current, true);
  }, [applyWrapTransform]);

  const loadPdf = useCallback(async () => {
    if (!window.pdfjsLib) return;
    setLoading(true);
    setLoadError(false);
    try {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER;
      const doc = await window.pdfjsLib.getDocument(pdfUrl).promise;
      setPdfDoc(doc);
      setTotalPages(doc.numPages);
      setCurrentPage(1);
    } catch (e) {
      console.error("[PDF load error]", e);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [pdfUrl]);

  // Robust PDF.js loading — works on first load AND on client-side navigation
  useEffect(() => {
    const tryInit = () => {
      if (window.pdfjsLib) { loadPdf(); return true; }
      return false;
    };

    if (tryInit()) return;

    // Script might already be in the DOM (previous page visit) but not yet executed
    let timer: ReturnType<typeof setInterval> | null = setInterval(() => {
      if (tryInit()) { if (timer) { clearInterval(timer); timer = null; } }
    }, 50);

    // If script isn't in DOM at all, inject it
    if (!document.querySelector(`script[src*="pdf.min.js"]`)) {
      const script = document.createElement("script");
      script.src = PDF_JS_URL;
      script.onload = () => {
        if (timer) { clearInterval(timer); timer = null; }
        loadPdf();
      };
      script.onerror = () => { setLoadError(true); setLoading(false); };
      document.head.appendChild(script);
    }

    return () => { if (timer) clearInterval(timer); };
  }, [loadPdf]);

  const renderPage = useCallback(async (pageNum: number) => {
    if (!pdfDoc || !canvasRef.current) return;
    if (renderTaskRef.current) { renderTaskRef.current.cancel(); renderTaskRef.current = null; }
    setRendering(true);
    try {
      const page     = await pdfDoc.getPage(pageNum);
      const canvas   = canvasRef.current;
      const ctx      = canvas.getContext("2d")!;
      const dpr      = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: 1 });

      const isMobile = window.innerWidth < 768;
      const maxW = isMobile
        ? window.innerWidth * 0.9
        : Math.min(window.innerWidth - 80, 1200);
      const maxH = window.innerHeight - 160;
      const scale = Math.min(maxW / viewport.width, maxH / viewport.height);

      const vp = page.getViewport({ scale });
      canvas.style.width  = `${vp.width}px`;
      canvas.style.height = `${vp.height}px`;
      canvas.width  = Math.floor(vp.width  * dpr);
      canvas.height = Math.floor(vp.height * dpr);

      const task = page.render({
        canvasContext: ctx,
        viewport:      page.getViewport({ scale: scale * dpr }),
        transform:     dpr !== 1 ? [1, 0, 0, 1, 0, 0] : null,
      });
      renderTaskRef.current = task;
      await task.promise;
    } catch (e: unknown) {
      if ((e as { name?: string })?.name !== "RenderingCancelledException") {
        console.error("[PDF render error]", e);
      }
    } finally {
      setRendering(false);
    }
  }, [pdfDoc]);

  useEffect(() => {
    if (pdfDoc) renderPage(currentPage);
  }, [pdfDoc, currentPage, renderPage]);

  useEffect(() => {
    const onResize = () => { if (pdfDoc) renderPage(currentPage); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [pdfDoc, currentPage, renderPage]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (contactOpen) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") setCurrentPage(p => Math.min(p + 1, totalPages));
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   setCurrentPage(p => Math.max(p - 1, 1));
      if (e.key === "+" || e.key === "=") setZoomLevel(z => Math.min(z + 0.25, 3));
      if (e.key === "-")                  setZoomLevel(z => Math.max(z - 0.25, 0.5));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [totalPages, contactOpen]);

  const goPrev = () => setCurrentPage(p => Math.max(p - 1, 1));
  const goNext = () => setCurrentPage(p => Math.min(p + 1, totalPages));

  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    position: "absolute", top: "50%", transform: "translateY(-50%)",
    width: 44, height: 44,
    background: "rgba(57,45,43,0.06)",
    border: "1px solid rgba(57,45,43,0.15)",
    color: "#392D2B", fontSize: 22,
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.25 : 0.7,
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "opacity 200ms ease",
  });

  return (
    <>
      <div style={{
        height: "100dvh",
        background: "#F0EEE9",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}>
        {/* PDF canvas area */}
        <div
          ref={areaRef}
          style={{
            flex: 1,
            minHeight: 0,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px 56px 8px",
            position: "relative",
            overflow: "hidden",
            cursor: zoomLevel > 1 ? (dragRef.current ? "grabbing" : "grab") : "default",
          }}
          onPointerDown={onPanDown}
          onPointerMove={onPanMove}
          onPointerUp={onPanUp}
          onPointerCancel={onPanUp}
        >
          {loading && !loadError && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 40, height: 40,
                border: "2px solid rgba(57,45,43,0.12)",
                borderTopColor: "#392D2B",
                borderRadius: "50%",
                animation: "prv-spin 0.8s linear infinite",
              }} />
              <p style={{
                fontFamily: "var(--font-inter-tight)", fontSize: 11,
                color: "rgba(57,45,43,0.4)", textTransform: "uppercase", letterSpacing: "1px",
              }}>
                Loading presentation...
              </p>
            </div>
          )}

          {loadError && (
            <div style={{ textAlign: "center" }}>
              <p style={{
                fontFamily: "var(--font-inter-tight)", fontSize: 13,
                color: "rgba(57,45,43,0.5)", marginBottom: 16,
              }}>
                Could not load the presentation.
              </p>
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--font-inter-tight)", fontSize: 11, fontWeight: 600,
                  letterSpacing: "1.17px", textTransform: "uppercase",
                  color: "#392D2B", textDecoration: "none",
                  padding: "8px 16px", border: "1px solid #392D2B",
                  display: "inline-block",
                }}>
                Download PDF
              </a>
            </div>
          )}

          {/* Pan wrapper — transform applied via ref */}
          <div ref={wrapRef} style={{ display: "flex", alignItems: "center", justifyContent: "center", transformOrigin: "center center" }}>
            <canvas
              ref={canvasRef}
              style={{
                display: pdfDoc ? "block" : "none",
                maxWidth: "100%",
                boxShadow: "0 8px 40px rgba(57,45,43,0.10)",
                opacity: rendering ? 0.6 : 1,
                transition: "opacity 200ms ease",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Prev / Next nav arrows */}
          {pdfDoc && totalPages > 1 && (
            <>
              <button type="button" onClick={goPrev} disabled={currentPage <= 1}
                aria-label="Previous slide"
                style={{ ...btnStyle(currentPage <= 1), left: 8 }}>
                ‹
              </button>
              <button type="button" onClick={goNext} disabled={currentPage >= totalPages}
                aria-label="Next slide"
                style={{ ...btnStyle(currentPage >= totalPages), right: 8 }}>
                ›
              </button>
            </>
          )}

          {/* Zoom + Download — float above the border line, top-right of canvas area */}
          {pdfDoc && (
            <div style={{
              position: "absolute", bottom: 12, right: 12,
              display: "flex", alignItems: "center", gap: 4,
              zIndex: 10,
            }}>
              <button
                type="button"
                onClick={() => setZoomLevel(z => Math.max(z - 0.25, 0.5))}
                disabled={zoomLevel <= 0.5}
                aria-label="Zoom out"
                style={{
                  width: 28, height: 28,
                  background: "rgba(240,238,233,0.9)", backdropFilter: "blur(4px)",
                  border: "1px solid rgba(57,45,43,0.15)",
                  cursor: zoomLevel <= 0.5 ? "default" : "pointer",
                  color: "#392D2B", fontSize: 18, lineHeight: 1,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: zoomLevel <= 0.5 ? 0.35 : 1,
                  transition: "opacity 200ms ease",
                }}
              >−</button>
              <span style={{
                fontFamily: "var(--font-inter-tight)", fontSize: 9, fontWeight: 600,
                color: "rgba(57,45,43,0.55)", letterSpacing: "0.5px", minWidth: 30,
                textAlign: "center", userSelect: "none",
                background: "rgba(240,238,233,0.9)", backdropFilter: "blur(4px)",
                padding: "5px 4px",
              }}>
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel(z => Math.min(z + 0.25, 3))}
                disabled={zoomLevel >= 3}
                aria-label="Zoom in"
                style={{
                  width: 28, height: 28,
                  background: "rgba(240,238,233,0.9)", backdropFilter: "blur(4px)",
                  border: "1px solid rgba(57,45,43,0.15)",
                  cursor: zoomLevel >= 3 ? "default" : "pointer",
                  color: "#392D2B", fontSize: 18, lineHeight: 1,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: zoomLevel >= 3 ? 0.35 : 1,
                  transition: "opacity 200ms ease",
                }}
              >+</button>
              <a
                href={pdfUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download PDF"
                title="Download PDF"
                style={{
                  width: 28, height: 28,
                  background: "rgba(240,238,233,0.9)", backdropFilter: "blur(4px)",
                  border: "1px solid rgba(57,45,43,0.15)",
                  color: "#392D2B",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  textDecoration: "none", flexShrink: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                </svg>
              </a>
            </div>
          )}
        </div>

        {/* Bottom bar — title + pagination + contact only */}
        <div style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px 14px",
          flexShrink: 0,
          borderTop: "1px solid rgba(57,45,43,0.1)",
          gap: 12,
          flexWrap: "nowrap",
        }}>
          {/* Title */}
          <h1 style={{
            margin: 0, flexShrink: 0,
            fontFamily: "var(--font-rader, 'PP Rader', sans-serif)",
            fontWeight: 400, fontSize: "clamp(13px, 1.4vw, 20px)",
            color: "#392D2B", letterSpacing: "-0.02em",
          }}>
            {title}
          </h1>

          {/* Pagination */}
          {pdfDoc && totalPages > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, justifyContent: "center", minWidth: 0, overflow: "hidden" }}>
              <button type="button" onClick={goPrev} disabled={currentPage <= 1}
                style={{
                  background: "none", border: "none",
                  cursor: currentPage <= 1 ? "default" : "pointer",
                  fontFamily: "var(--font-inter-tight)", fontWeight: 600,
                  fontSize: 9, letterSpacing: "1.17px", textTransform: "uppercase",
                  color: currentPage <= 1 ? "rgba(57,45,43,0.2)" : "rgba(57,45,43,0.6)",
                  transition: "color 200ms ease", flexShrink: 0,
                }}>← Prev</button>

              <div style={{ display: "flex", gap: 4, alignItems: "center", overflow: "hidden" }}>
                {Array.from({ length: Math.min(totalPages, 20) }, (_, i) => {
                  const page = i + 1;
                  const active = page === currentPage;
                  const visible = totalPages <= 20 || Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages;
                  if (!visible) {
                    if (page === 3 && currentPage > 5) return <span key={i} style={{ color: "rgba(57,45,43,0.3)", fontSize: 10 }}>…</span>;
                    if (page === totalPages - 2 && currentPage < totalPages - 4) return <span key={i} style={{ color: "rgba(57,45,43,0.3)", fontSize: 10 }}>…</span>;
                    return null;
                  }
                  return (
                    <button key={i} type="button" onClick={() => setCurrentPage(page)}
                      style={{
                        width: active ? 20 : 6, height: 6,
                        borderRadius: 99, border: "none", cursor: "pointer",
                        background: active ? "#392D2B" : "rgba(57,45,43,0.2)",
                        padding: 0, transition: "width 200ms ease, background 200ms ease",
                        flexShrink: 0,
                      }}
                    />
                  );
                })}
              </div>

              <button type="button" onClick={goNext} disabled={currentPage >= totalPages}
                style={{
                  background: "none", border: "none",
                  cursor: currentPage >= totalPages ? "default" : "pointer",
                  fontFamily: "var(--font-inter-tight)", fontWeight: 600,
                  fontSize: 9, letterSpacing: "1.17px", textTransform: "uppercase",
                  color: currentPage >= totalPages ? "rgba(57,45,43,0.2)" : "rgba(57,45,43,0.6)",
                  transition: "color 200ms ease", flexShrink: 0,
                }}>Next →</button>

              <span style={{
                fontFamily: "var(--font-inter-tight)", fontSize: 9,
                color: "rgba(57,45,43,0.3)", letterSpacing: "0.5px", flexShrink: 0,
              }}>{currentPage} / {totalPages}</span>
            </div>
          )}

          {/* Contact */}
          <div style={{ flexShrink: 0 }}>
            <PixelButton label="Contact" onClick={() => setContactOpen(true)} />
          </div>
        </div>
      </div>

      {/* Contact popup */}
      {contactOpen && (
        <div
          onClick={() => setContactOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(57,45,43,0.5)", backdropFilter: "blur(6px)",
            animation: "prv-fadein 200ms ease both",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "min(480px, calc(100vw - 40px))",
              background: "#F0EEE9",
              padding: "32px 30px",
              maxHeight: "90vh", overflowY: "auto",
              animation: "prv-popup-in 360ms cubic-bezier(0.16,1,0.3,1) both",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <p style={{ fontFamily: "var(--font-inter-tight)", fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.17px", color: "rgba(57,45,43,0.4)", marginBottom: 6 }}>
                  Inquiry
                </p>
                <h2 style={{ fontFamily: "var(--font-rader, 'PP Rader', sans-serif)", fontWeight: 400, fontSize: 22, color: "#392D2B", margin: 0, lineHeight: 0.9 }}>
                  {title}
                </h2>
              </div>
              <button type="button" onClick={() => setContactOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, lineHeight: 1, color: "rgba(57,45,43,0.5)", padding: 0 }}>
                ×
              </button>
            </div>
            <ContactForm sourcePage={sourcePage} compact />
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes prv-spin    { to { transform: rotate(360deg); } }
        @keyframes prv-fadein  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes prv-popup-in {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
