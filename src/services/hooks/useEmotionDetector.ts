"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
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
  /** True saat kamera siap (ready) tapi tidak ada wajah terdeteksi selama ≥10 detik. */
  noFaceWarning: boolean;
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
  // Holds the active MediaStream so it can be re-attached when the <video>
  // node is replaced (e.g. hidden-video → EmotionDetectionWidget on ready).
  const streamRef = useRef<MediaStream | null>(null);
  // Guard: prevent concurrent start() calls (React StrictMode, fast re-render)
  const startingRef = useRef(false);

  const [currentEmotion, setCurrentEmotion] = useState<EmotionSample | null>(
    null,
  );
  const [ready, setReady] = useState(false);
  const [hasSample, setHasSample] = useState(false);
  const [noFaceWarning, setNoFaceWarning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Timestamp (Date.now()) of the last successful sample. Used by the no-face
  // watchdog below. Stored in a ref so updating it never causes a re-render.
  const lastSampleAtRef = useRef<number>(0);

  const stop = useCallback(() => {
    startingRef.current = false; // abort any pending start() continuation
    samplerRef.current?.stop();
    samplerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
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
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      const sampler = new EmotionSampler({
        video: videoRef.current,
        intervalMs,
        onSample: (s) => {
          lastSampleAtRef.current = Date.now();
          setNoFaceWarning(false);
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
      lastSampleAtRef.current = Date.now(); // reset watchdog baseline when ready
      setHasSample(false);
      setNoFaceWarning(false);
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

  // Auto-stop saat error fatal: lepas kamera & worker agar tidak buang resource.
  useEffect(() => {
    if (error) stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  // Re-attach the MediaStream if the <video> node ever gets a new srcObject.
  // The hidden <video> is always mounted (no swap), so this is a safety net.
  useLayoutEffect(() => {
    if (!ready || !streamRef.current || !videoRef.current) return;
    if (videoRef.current.srcObject !== streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      void videoRef.current.play().catch(() => {});
    }
  }); // no dep array — runs after every render so any node swap is handled

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

  // No-face watchdog (spec §15): saat kamera sudah ready tapi tidak ada wajah
  // terdeteksi selama ≥10 detik, set noFaceWarning=true. Warning hilang otomatis
  // begitu sampel berikutnya masuk (di onSample di atas).
  const NO_FACE_TIMEOUT_MS = 10_000;
  useEffect(() => {
    if (!ready) return;
    const id = window.setInterval(() => {
      if (document.hidden) return; // jangan warn saat tab di-background
      const elapsed = Date.now() - lastSampleAtRef.current;
      setNoFaceWarning(elapsed >= NO_FACE_TIMEOUT_MS);
    }, 2_000); // cek tiap 2 detik, cukup responsif tanpa bikin banyak re-render
    return () => window.clearInterval(id);
  }, [ready]);

  // Cleanup on unmount
  useEffect(() => () => stop(), [stop]);

  return {
    videoRef,
    currentEmotion,
    ready,
    hasSample,
    noFaceWarning,
    error,
    flushAndReset,
    flushOrUnknown,
    start,
    stop,
  };
}
