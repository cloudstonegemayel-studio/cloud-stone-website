"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Script from "next/script";
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

export function PresentationViewer({ pdfUrl, title, sourcePage }: PresentationViewerProps) {
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);

  const [pdfReady,     setPdfReady]     = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pdfDoc,       setPdfDoc]       = useState<any>(null);
  const [currentPage,  setCurrentPage]  = useState(1);
  const [totalPages,   setTotalPages]   = useState(0);
  const [rendering,    setRendering]    = useState(false);
  const [contactOpen,  setContactOpen]  = useState(false);
  const [loadError,    setLoadError]    = useState(false);

  const loadPdf = useCallback(async () => {
    if (!window.pdfjsLib) return;
    try {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      const doc = await window.pdfjsLib.getDocument(pdfUrl).promise;
      setPdfDoc(doc);
      setTotalPages(doc.numPages);
      setCurrentPage(1);
    } catch (e) {
      console.error("[PDF load error]", e);
      setLoadError(true);
    }
  }, [pdfUrl]);

  const renderPage = useCallback(async (pageNum: number) => {
    if (!pdfDoc || !canvasRef.current) return;

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    setRendering(true);
    try {
      const page     = await pdfDoc.getPage(pageNum);
      const canvas   = canvasRef.current;
      const ctx      = canvas.getContext("2d")!;
      const dpr      = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: 1 });

      // Account for Navbar (~70px) + bottom bar (~90px) + padding
      const maxW = Math.min(window.innerWidth - 80, 1200);
      const maxH = window.innerHeight - 200;
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

  // If PDF.js was already loaded by a previous page visit, onLoad won't fire again.
  // Detect it here on mount so client-side navigation works without a hard reload.
  useEffect(() => {
    if (window.pdfjsLib) { setPdfReady(true); loadPdf(); }
  }, [loadPdf]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (contactOpen) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") setCurrentPage(p => Math.min(p + 1, totalPages));
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   setCurrentPage(p => Math.max(p - 1, 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [totalPages, contactOpen]);

  const goPrev = () => setCurrentPage(p => Math.max(p - 1, 1));
  const goNext = () => setCurrentPage(p => Math.min(p + 1, totalPages));

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        strategy="afterInteractive"
        onLoad={() => { setPdfReady(true); loadPdf(); }}
      />

      <div style={{
        minHeight: "100vh",
        background: "#F0EEE9",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "hidden",
        position: "relative",
      }}>
        {/* PDF canvas area */}
        <div style={{
          flex: 1,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "30px 40px 10px",
          position: "relative",
        }}>
          {!pdfReady && !loadError && (
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
              <PixelButton label="Download PDF" href={pdfUrl} />
            </div>
          )}

          <canvas
            ref={canvasRef}
            style={{
              display: pdfDoc ? "block" : "none",
              maxWidth: "100%",
              boxShadow: "0 8px 40px rgba(57,45,43,0.10)",
              opacity: rendering ? 0.6 : 1,
              transition: "opacity 200ms ease",
            }}
          />

          {pdfDoc && totalPages > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                disabled={currentPage <= 1}
                aria-label="Previous slide"
                style={{
                  position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
                  width: 44, height: 44,
                  background: "rgba(57,45,43,0.06)",
                  border: "1px solid rgba(57,45,43,0.15)",
                  color: "#392D2B", fontSize: 22,
                  cursor: currentPage <= 1 ? "default" : "pointer",
                  opacity: currentPage <= 1 ? 0.25 : 0.7,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "opacity 200ms ease",
                }}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={currentPage >= totalPages}
                aria-label="Next slide"
                style={{
                  position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                  width: 44, height: 44,
                  background: "rgba(57,45,43,0.06)",
                  border: "1px solid rgba(57,45,43,0.15)",
                  color: "#392D2B", fontSize: 22,
                  cursor: currentPage >= totalPages ? "default" : "pointer",
                  opacity: currentPage >= totalPages ? 0.25 : 0.7,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "opacity 200ms ease",
                }}
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* Bottom bar: title · pagination · contact button */}
        <div style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 30px 28px",
          flexShrink: 0,
          borderTop: "1px solid rgba(57,45,43,0.1)",
          gap: 20,
        }}>
          {/* Title */}
          <h1 style={{
            margin: 0, flexShrink: 0,
            fontFamily: "var(--font-rader, 'PP Rader', sans-serif)",
            fontWeight: 400, fontSize: "clamp(14px, 1.5vw, 22px)",
            color: "#392D2B", letterSpacing: "-0.02em",
          }}>
            {title}
          </h1>

          {/* Pagination */}
          {pdfDoc && totalPages > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, justifyContent: "center" }}>
              <button
                type="button"
                onClick={goPrev}
                disabled={currentPage <= 1}
                style={{
                  background: "none", border: "none",
                  cursor: currentPage <= 1 ? "default" : "pointer",
                  fontFamily: "var(--font-inter-tight)", fontWeight: 600,
                  fontSize: 9, letterSpacing: "1.17px", textTransform: "uppercase",
                  color: currentPage <= 1 ? "rgba(57,45,43,0.2)" : "rgba(57,45,43,0.6)",
                  transition: "color 200ms ease",
                }}
              >
                ← Prev
              </button>

              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
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
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      style={{
                        width: active ? 20 : 6, height: 6,
                        borderRadius: 99, border: "none", cursor: "pointer",
                        background: active ? "#392D2B" : "rgba(57,45,43,0.2)",
                        padding: 0, transition: "width 200ms ease, background 200ms ease",
                      }}
                    />
                  );
                })}
              </div>

              <button
                type="button"
                onClick={goNext}
                disabled={currentPage >= totalPages}
                style={{
                  background: "none", border: "none",
                  cursor: currentPage >= totalPages ? "default" : "pointer",
                  fontFamily: "var(--font-inter-tight)", fontWeight: 600,
                  fontSize: 9, letterSpacing: "1.17px", textTransform: "uppercase",
                  color: currentPage >= totalPages ? "rgba(57,45,43,0.2)" : "rgba(57,45,43,0.6)",
                  transition: "color 200ms ease",
                }}
              >
                Next →
              </button>

              <span style={{
                fontFamily: "var(--font-inter-tight)", fontSize: 9,
                color: "rgba(57,45,43,0.3)", letterSpacing: "0.5px", flexShrink: 0,
              }}>
                {currentPage} / {totalPages}
              </span>
            </div>
          )}

          {/* Contact button */}
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
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "flex-start", marginBottom: 24,
            }}>
              <div>
                <p style={{
                  fontFamily: "var(--font-inter-tight)", fontSize: 9,
                  fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.17px",
                  color: "rgba(57,45,43,0.4)", marginBottom: 6,
                }}>
                  Inquiry
                </p>
                <h2 style={{
                  fontFamily: "var(--font-rader, 'PP Rader', sans-serif)",
                  fontWeight: 400, fontSize: 22,
                  color: "#392D2B", margin: 0, lineHeight: 0.9,
                }}>
                  {title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setContactOpen(false)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "var(--font-inter-tight)", fontSize: 9,
                  fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.17px",
                  color: "rgba(57,45,43,0.4)",
                }}
              >
                Close ×
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
