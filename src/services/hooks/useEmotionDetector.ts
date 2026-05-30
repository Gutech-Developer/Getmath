"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EmotionSampler } from "@/libs/emotion/EmotionSampler";
import { EmotionAggregator } from "@/libs/emotion/EmotionAggregator";
import type { EmotionResult, EmotionSample } from "@/libs/emotion/types";
import { showToast } from "@/libs/toast";

export interface UseEmotionDetectorOptions {
  enabled: boolean;
  intervalMs?: number;
}

export interface UseEmotionDetectorResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  currentEmotion: EmotionSample | null;
  ready: boolean;
  hasSample: boolean;
  error: string | null;
  /** Flush hasil agregat + reset buffer. Kembalikan null kalau belum ada sampel. */
  flushAndReset: () => EmotionResult | null;
  /** Flush + reset, garansi non-null: kalau buffer kosong, kembalikan EmotionResult "unknown" (fallback fatal-error). */
  flushOrUnknown: () => EmotionResult;
  start: () => Promise<void>;
  stop: () => void;
}

export function useEmotionDetector(
  options: UseEmotionDetectorOptions,
): UseEmotionDetectorResult {
  const { enabled, intervalMs = 500 } = options;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const samplerRef = useRef<EmotionSampler | null>(null);
  const aggregatorRef = useRef<EmotionAggregator>(new EmotionAggregator());
  // Guard: prevent concurrent start() calls (React StrictMode, fast re-render)
  const startingRef = useRef(false);

  const [currentEmotion, setCurrentEmotion] = useState<EmotionSample | null>(
    null,
  );
  const [ready, setReady] = useState(false);
  const [hasSample, setHasSample] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    startingRef.current = false; // abort any pending start() continuation
    samplerRef.current?.stop();
    samplerRef.current = null;
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setReady(false);
  }, []);

  const start = useCallback(async () => {
    if (!enabled || !videoRef.current || startingRef.current) return;
    startingRef.current = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
        audio: false,
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      const sampler = new EmotionSampler({
        video: videoRef.current,
        intervalMs,
        onSample: (s) => {
          setCurrentEmotion(s);
          aggregatorRef.current.push(s);
          setHasSample(true);
        },
        onError: (err) => setError(err.message),
      });
      await sampler.start();
      // If stop() was called while model was loading, abort — don't set ready.
      if (!startingRef.current) return;
      samplerRef.current = sampler;
      aggregatorRef.current.reset();
      setHasSample(false);
      setReady(true);

      // Listen ke stream cabut tiba-tiba
      stream.getVideoTracks().forEach((t) => {
        t.onended = () => setError("Kamera berhenti / dicabut");
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      showToast.error(`Kamera diperlukan: ${msg}`);
      throw err;
    } finally {
      startingRef.current = false;
    }
  }, [enabled, intervalMs]);

  const flushAndReset = useCallback((): EmotionResult | null => {
    const result = aggregatorRef.current.computeResult();
    aggregatorRef.current.reset();
    setHasSample(false);
    return result;
  }, []);

  const flushOrUnknown = useCallback((): EmotionResult => {
    const result =
      aggregatorRef.current.computeResult() ??
      aggregatorRef.current.buildUnknownResult();
    aggregatorRef.current.reset();
    setHasSample(false);
    return result;
  }, []);

  // Pause sampling saat tab hidden
  useEffect(() => {
    if (!enabled) return;
    const onVis = () => {
      const v = videoRef.current;
      if (!v) return;
      if (document.hidden) v.pause();
      else void v.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [enabled]);

  // Cleanup on unmount
  useEffect(() => () => stop(), [stop]);

  return {
    videoRef,
    currentEmotion,
    ready,
    hasSample,
    error,
    flushAndReset,
    flushOrUnknown,
    start,
    stop,
  };
}
