import { useEffect, useRef, useCallback } from "react";
import { useSocket } from "../hooks/use-socket";

const TOTAL_SLICES = 5;
const SLICE_ANIM_MS = 400;

interface Props {
  imgSrc: string;
  revealedSlices: number[];
  isFullyRevealed: boolean;
}

export function ImageSliceReveal({ imgSrc, revealedSlices, isFullyRevealed }: Props) {
  const { emit } = useSocket();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const animFrameRef = useRef<number>(0);
  // Slices committed to canvas (fully animated)
  const committedRef = useRef<Set<number>>(new Set());
  // Queue of slices waiting to animate
  const queueRef = useRef<number[]>([]);
  const animatingRef = useRef(false);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return null;
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = container.getBoundingClientRect();
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    return { ctx, width, height };
  }, []);

  const drawCanvas = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, animSlice?: number, progress?: number) => {
      const img = imgRef.current;
      if (!img) return;
      const sliceW = width / TOTAL_SLICES;

      // Dark bg
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 0, width, height);

      // Draw committed slices fully
      for (const s of committedRef.current) {
        const sx = (s / TOTAL_SLICES) * img.naturalWidth;
        const sw = img.naturalWidth / TOTAL_SLICES;
        ctx.drawImage(img, sx, 0, sw, img.naturalHeight, s * sliceW, 0, sliceW, height);
      }

      // Draw current animating slice with slide-in
      if (animSlice !== undefined && progress !== undefined) {
        const p = Math.min(progress, 1);
        const sx = (animSlice / TOTAL_SLICES) * img.naturalWidth;
        const sw = img.naturalWidth / TOTAL_SLICES;
        const destH = height * p;
        const destY = height - destH;
        ctx.drawImage(img, sx, img.naturalHeight * (1 - p), sw, img.naturalHeight * p, animSlice * sliceW, destY, sliceW, destH);
      }
    },
    []
  );

  const animateSlice = useCallback(
    (sliceIdx: number, setup: ReturnType<typeof setupCanvas>) => {
      if (!setup) return;
      const { ctx, width, height } = setup;
      const start = performance.now();
      animatingRef.current = true;

      function frame(now: number) {
        const progress = (now - start) / SLICE_ANIM_MS;
        drawCanvas(ctx, width, height, sliceIdx, progress);
        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(frame);
        } else {
          committedRef.current.add(sliceIdx);
          drawCanvas(ctx, width, height);
          animatingRef.current = false;
          // Drain queue
          const next = queueRef.current.shift();
          if (next !== undefined) {
            animateSlice(next, setup);
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(frame);
    },
    [drawCanvas]
  );

  // Init canvas on mount + load image; also resets all refs when imgSrc changes (new round)
  useEffect(() => {
    cancelAnimationFrame(animFrameRef.current);
    committedRef.current = new Set();
    queueRef.current = [];
    animatingRef.current = false;

    const setup = setupCanvas();
    if (!setup) return;
    const { ctx, width, height } = setup;

    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 0, width, height);
    };
    img.src = imgSrc;

    const ro = new ResizeObserver(() => {
      const s = setupCanvas();
      if (s && imgRef.current) drawCanvas(s.ctx, s.width, s.height);
    });
    if (containerRef.current) ro.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      ro.disconnect();
    };
  }, [imgSrc, setupCanvas, drawCanvas]);

  // React to new slices being revealed
  useEffect(() => {
    for (const s of revealedSlices) {
      if (!committedRef.current.has(s) && !queueRef.current.includes(s)) {
        queueRef.current.push(s);
      }
    }
    if (!animatingRef.current && queueRef.current.length > 0) {
      const next = queueRef.current.shift()!;
      // Cancel any orphaned in-flight frame before resizing canvas for the new slice
      cancelAnimationFrame(animFrameRef.current);
      animateSlice(next, setupCanvas());
    }
  }, [revealedSlices, animateSlice, setupCanvas]);

  return (
    <div ref={containerRef} className="relative w-full" style={{ aspectRatio: "16/9" }}>
      {/* Canvas (hidden when fully revealed) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: isFullyRevealed ? "none" : "block" }}
      />

      {/* Full image fades in when all slices revealed */}
      <img
        src={imgSrc}
        alt="Game image"
        className="absolute inset-0 w-full h-full object-cover rounded-lg"
        style={{
          opacity: isFullyRevealed ? 1 : 0,
          transition: "opacity 300ms ease-in",
        }}
      />

      {/* Early reveal button */}
      {!isFullyRevealed && (
        <button
          onClick={() => emit("host:early_reveal")}
          className="absolute bottom-2 right-2 bg-black/70 text-red-300 text-xs px-3 py-1
                     rounded border border-red-800 hover:bg-red-900/60 transition-colors"
        >
          🚨 GIẢI MÃ SỚM
        </button>
      )}
    </div>
  );
}
