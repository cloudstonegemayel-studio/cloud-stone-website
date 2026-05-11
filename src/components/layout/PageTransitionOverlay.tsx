"use client";

import { useEffect, useRef } from "react";
import { usePageTransition } from "@/lib/transitionContext";

const BLOB_DEFS = [
  { p: [-1.10, -0.30,  0.05] as const, r: 0.80 },
  { p: [ 0.10, -0.40,  0.10] as const, r: 1.00 },
  { p: [ 1.15, -0.20, -0.05] as const, r: 0.75 },
  { p: [-0.70,  0.45,  0.05] as const, r: 0.55 },
  { p: [ 0.45,  0.70,  0.05] as const, r: 0.85 },
  { p: [ 0.10,  0.00, -0.75] as const, r: 0.85 },
  { p: [ 0.00, -0.10,  0.75] as const, r: 0.80 },
];

const ROT_PERIOD = 8000; // ms per full Y rotation
const BG_COLOR   = "#DDE7EF";
const CLOUD_HEX  = 0xaed0f0;

export function PageTransitionOverlay() {
  const { phase } = usePageTransition();
  const active = phase !== "idle";

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Start/stop Three.js based on whether the overlay is active
  useEffect(() => {
    if (!active) {
      // Clean up renderer when going idle
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    let destroyed = false;

    // Dynamically import Three.js so it doesn't land in the initial bundle
    import("three").then((THREE) => {
      if (destroyed || !canvas) return;

      const W = window.innerWidth;
      const H = window.innerHeight;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H);
      renderer.setClearColor(new THREE.Color(BG_COLOR), 1);

      const scene  = new THREE.Scene();
      scene.background = new THREE.Color(BG_COLOR);

      const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
      camera.position.set(0, 0, 5);

      const cloudMat = new THREE.MeshBasicMaterial({ color: CLOUD_HEX });
      const cloud    = new THREE.Group();

      for (const { p, r } of BLOB_DEFS) {
        const geo  = new THREE.SphereGeometry(r, 32, 24);
        const mesh = new THREE.Mesh(geo, cloudMat);
        mesh.position.set(p[0], p[1], p[2]);
        cloud.add(mesh);
      }
      cloud.scale.set(0.25, 0.25, 0.25);
      scene.add(cloud);

      const t0 = performance.now();

      const animate = () => {
        if (destroyed) return;
        rafRef.current = requestAnimationFrame(animate);
        const t = performance.now() - t0;
        cloud.rotation.y = -(t / ROT_PERIOD) * Math.PI * 2;
        cloud.position.y = -0.1 + Math.sin(t * 0.0016) * 0.04;
        renderer.render(scene, camera);
      };

      rafRef.current = requestAnimationFrame(animate);

      cleanupRef.current = () => {
        destroyed = true;
        cancelAnimationFrame(rafRef.current);
        renderer.dispose();
        cloudMat.dispose();
        for (const child of cloud.children) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (child as any).geometry?.dispose();
        }
      };
    });

    return () => {
      destroyed = true;
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const isExpanding  = phase === "expand";
  const isContracting = phase === "contract";

  return (
    <div
      aria-hidden="true"
      style={{
        position:      "fixed",
        inset:         0,
        zIndex:        9999,
        pointerEvents: active ? "auto" : "none",
        opacity: isExpanding ? 1 : isContracting ? 0 : active ? 1 : 0,
        transition: isExpanding
          ? "opacity 600ms cubic-bezier(0.16,1,0.3,1)"
          : isContracting
          ? "opacity 500ms cubic-bezier(0.77,0,0.175,1)"
          : "none",
        background: active ? BG_COLOR : "transparent",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}
