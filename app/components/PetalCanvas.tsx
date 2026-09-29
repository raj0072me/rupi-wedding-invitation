"use client";

import { useEffect, useRef } from "react";

interface Petal {
  x: number;
  y: number;
  r: number;
  color: string;
  vx: number;
  vy: number;
  angle: number;
  spin: number;
  opacity: number;
  shape: "circle" | "oval" | "teardrop" | "heart";
  wobble: number;
  wobbleSpeed: number;
  wobbleAmp: number;
}

// Warm wedding palette: marigold, rose, jasmine, gulal-pink
const PETAL_COLORS = [
  "#FF8C00", // deep marigold orange
  "#FFA500", // marigold amber
  "#FFD700", // golden marigold
  "#FF6B9D", // rose pink
  "#FF4E91", // hot pink (gulal)
  "#FFC0CB", // blush pink
  "#FFFFFF", // jasmine white
  "#FFE5B4", // peach blossom
  "#FF7043", // burnt orange petal
  "#FFCC02", // bright yellow marigold
];

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function createPetal(canvasWidth: number): Petal {
  return {
    x: randomBetween(-30, canvasWidth + 30),
    y: randomBetween(-60, -10),
    r: randomBetween(5, 14),
    color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
    vx: randomBetween(-0.6, 0.6),
    vy: randomBetween(0.6, 1.8),
    angle: randomBetween(0, Math.PI * 2),
    spin: randomBetween(-0.03, 0.03),
    opacity: randomBetween(0.12, 0.30),
    shape: (["circle", "oval", "teardrop", "oval"] as Petal["shape"][])[
      Math.floor(Math.random() * 4)
    ],
    wobble: randomBetween(0, Math.PI * 2),
    wobbleSpeed: randomBetween(0.015, 0.04),
    wobbleAmp: randomBetween(0.5, 1.8),
  };
}

function drawPetal(ctx: CanvasRenderingContext2D, p: Petal) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle = p.color;
  ctx.beginPath();

  if (p.shape === "circle") {
    ctx.ellipse(0, 0, p.r, p.r, 0, 0, Math.PI * 2);
  } else if (p.shape === "oval") {
    ctx.ellipse(0, 0, p.r * 0.55, p.r, 0, 0, Math.PI * 2);
  } else if (p.shape === "teardrop") {
    // Teardrop: thin at top, round at bottom
    ctx.moveTo(0, -p.r);
    ctx.bezierCurveTo(p.r * 0.8, -p.r * 0.3, p.r * 0.8, p.r * 0.7, 0, p.r);
    ctx.bezierCurveTo(-p.r * 0.8, p.r * 0.7, -p.r * 0.8, -p.r * 0.3, 0, -p.r);
  } else {
    // heart
    const s = p.r * 0.06;
    ctx.moveTo(0, p.r * 0.7);
    ctx.bezierCurveTo(-p.r, p.r * 0.1, -p.r * 1.2, -p.r * 0.8, 0, -p.r * 0.4);
    ctx.bezierCurveTo(p.r * 1.2, -p.r * 0.8, p.r, p.r * 0.1, 0, p.r * 0.7);
    void s;
  }
  ctx.fill();
  ctx.restore();
}

const PETAL_COUNT = 55;

export default function PetalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const petalsRef = useRef<Petal[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialise petals spread across screen
    petalsRef.current = Array.from({ length: PETAL_COUNT }, (_, i) => {
      const p = createPetal(canvas.width);
      // Spread initial Y so they don't all start at top
      if (i < PETAL_COUNT * 0.7) {
        p.y = randomBetween(0, canvas.height);
      }
      return p;
    });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of petalsRef.current) {
        // Wobble drift
        p.wobble += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.wobble) * p.wobbleAmp;
        p.y += p.vy;
        p.angle += p.spin;

        // Reset when out of screen
        if (p.y > canvas.height + 20) {
          const fresh = createPetal(canvas.width);
          Object.assign(p, fresh);
        }

        drawPetal(ctx, p);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}
