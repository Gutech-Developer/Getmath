"use client";

import { useState } from "react";
import type { RefObject } from "react";

interface EmotionDetectionWidgetProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  emotionLabel?: string;
  isLive?: boolean;
}

export default function EmotionDetectionWidget({
  videoRef,
  emotionLabel = "Fokus",
  isLive = true,
}: EmotionDetectionWidgetProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-40 w-[220px] overflow-hidden rounded-2xl border border-[#1E3A5F] bg-[#0B1929] text-white shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
      role="complementary"
      aria-label="Deteksi emosi langsung"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-1.5">
          {isLive && (
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#22C55E]" />
          )}
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">
            {isLive ? "Live Deteksi" : "Deteksi"}
          </span>
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5 text-white/60"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10l4.553-2.069A1 1 0 0121 8.81V15.19a1 1 0 01-1.447.894L15 14M3 8h12a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V9a1 1 0 011-1z"
            />
          </svg>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="rounded-md p-0.5 text-white/50 transition hover:text-white"
          aria-label="Tutup widget deteksi emosi"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Video preview */}
      <div className="relative mx-2 overflow-hidden rounded-xl border border-[#1E3A5F] bg-[#050E1A]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-28 w-full object-cover"
        />
        {/* Face detection overlay label */}
        <div className="absolute left-1.5 top-1.5 rounded bg-[#2563EB]/75 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
          AI Face
        </div>
        {/* Green face box overlay */}
        <div className="pointer-events-none absolute left-[30%] top-[15%] h-[60%] w-[40%] rounded border-2 border-[#22C55E]" />
      </div>

      {/* Emotion label */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="inline-block h-2 w-2 rounded-full bg-[#22C55E]" />
        <span className="text-xs font-semibold text-white/90">
          Emosi Terdeteksi:{" "}
          <span className="text-[#22C55E]">{emotionLabel}</span>
        </span>
      </div>
    </div>
  );
}
