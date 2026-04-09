"use client";

import { useEffect, useState } from "react";

interface EmotionNotificationProps {
  questionIndex: number;
  emotionLabel?: string;
  emotionDescription?: string;
  autoDismissMs?: number;
  onDismiss?: () => void;
}

export default function EmotionNotification({
  questionIndex,
  emotionLabel = "Fokus",
  emotionDescription = "Kamu terlihat fokus. Pertahankan kondisi ini selama tes berlangsung.",
  autoDismissMs = 9000,
  onDismiss,
}: EmotionNotificationProps) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const step = 100 / (autoDismissMs / 100);
    const interval = window.setInterval(() => {
      setProgress((prev) => {
        const next = prev - step;
        if (next <= 0) {
          window.clearInterval(interval);
          setVisible(false);
          onDismiss?.();
          return 0;
        }
        return next;
      });
    }, 100);

    return () => window.clearInterval(interval);
  }, [autoDismissMs, onDismiss]);

  if (!visible) return null;

  const handleClose = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <div
      className="fixed right-6 top-6 z-50 w-[280px] overflow-hidden rounded-2xl border border-[#86EFAC] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
      role="status"
      aria-live="polite"
      aria-label="Notifikasi deteksi emosi"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🤖</span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-[#0F172A]">
              Deteksi Emosi – Soal {questionIndex + 1}
            </p>
            <p className="text-[10px] text-[#94A3B8]">
              {Math.round(autoDismissMs / 1000)}d
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="shrink-0 rounded-md p-0.5 text-[#94A3B8] transition hover:text-[#334155]"
          aria-label="Tutup notifikasi"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
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

      {/* Body */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-[#22C55E]" />
          <span className="text-sm font-semibold text-[#0F172A]">
            {emotionLabel}
          </span>
        </div>
        <p className="mt-1 text-xs leading-5 text-[#475569]">
          {emotionDescription}
        </p>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[#F1F5F9]">
        <div
          className="h-full bg-[#22C55E] transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
