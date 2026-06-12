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
import { captureVideoSnapshot } from "@/libs/emotion/snapshot";

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
  flushAndReset: () => { result: EmotionResult | null; imageBase64?: string };
  /** Flush + reset, garansi non-null: kalau buffer kosong, kembalikan EmotionResult "unknown" (fallback fatal-error). */
  flushOrUnknown: () => { result: EmotionResult; imageBase64?: string };
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

  // Cache gambar terbaik berdasarkan tingkat confidence emosi di setiap sampel (Best Frame Cache Map)
  const bestImagesRef = useRef<
    Record<string, { imageBase64: string; confidence: number }>
  >({});

  const stop = useCallback(() => {
    startingRef.current = false; // abort any pending start() continuation
    samplerRef.current?.stop();
    samplerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    bestImagesRef.current = {}; // Bersihkan cache gambar
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

          // KANONIK: Ambil frame saat ini dan simpan jika confidence-nya lebih tinggi
          // dari gambar terbaik emosi ini yang pernah dicatat selama variant ini berlangsung
          if (videoRef.current) {
            const base64 = captureVideoSnapshot(videoRef.current);
            if (base64) {
              const prevBest = bestImagesRef.current[s.label];
              if (!prevBest || s.confidence > prevBest.confidence) {
                bestImagesRef.current[s.label] = {
                  imageBase64: base64,
                  confidence: s.confidence,
                };
              }
            }
          }
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

  // Perbarui fungsi flush untuk mengambil gambar terbaik dari modus emosi dominan
  const flushAndReset = useCallback((): {
    result: EmotionResult | null;
    imageBase64?: string;
  } => {
    const result = aggregatorRef.current.computeResult();
    let imageBase64: string | undefined = result
      ? bestImagesRef.current[result.mode]?.imageBase64
      : undefined;

    // Fallback #1: Jika gambar modus kosong, ambil dari emosi non-neutral dengan confidence tertinggi yang tersedia
    if (result && !imageBase64) {
      const nonNeutral = [
        "happy",
        "sad",
        "angry",
        "fearful",
        "disgusted",
        "surprised",
      ];
      let maxConf = -1;
      let fallbackLabel = "";
      for (const label of nonNeutral) {
        const cached = bestImagesRef.current[label];
        if (cached && cached.confidence > maxConf) {
          maxConf = cached.confidence;
          fallbackLabel = label;
        }
      }
      if (fallbackLabel) {
        imageBase64 = bestImagesRef.current[fallbackLabel]?.imageBase64;
      }
    }

    // Fallback #2: Jika masih kosong sama sekali, ambil frame real-time saat tombol diklik
    if (!imageBase64 && videoRef.current) {
      imageBase64 = captureVideoSnapshot(videoRef.current);
    }

    // Reset cache aggregator dan gambar
    aggregatorRef.current.reset();
    bestImagesRef.current = {};
    setHasSample(false);

    return { result, imageBase64 };
  }, []);

  const flushOrUnknown = useCallback((): {
    result: EmotionResult;
    imageBase64?: string;
  } => {
    const result =
      aggregatorRef.current.computeResult() ??
      aggregatorRef.current.buildUnknownResult();

    // 1. Ambil gambar dari modus dominan
    let imageBase64: string | undefined = bestImagesRef.current[result.mode]?.imageBase64;

    // 2. Fallback #1: Jika gambar modus kosong, ambil dari emosi non-neutral dengan confidence tertinggi yang tersedia
    if (!imageBase64) {
      const nonNeutral = [
        "happy",
        "sad",
        "angry",
        "fearful",
        "disgusted",
        "surprised",
      ];
      let maxConf = -1;
      let fallbackLabel = "";
      for (const label of nonNeutral) {
        const cached = bestImagesRef.current[label];
        if (cached && cached.confidence > maxConf) {
          maxConf = cached.confidence;
          fallbackLabel = label;
        }
      }
      if (fallbackLabel) {
        imageBase64 = bestImagesRef.current[fallbackLabel]?.imageBase64;
      }
    }

    // 3. Fallback #2: Jika masih kosong sama sekali, ambil frame real-time saat tombol diklik
    if (!imageBase64 && videoRef.current) {
      imageBase64 = captureVideoSnapshot(videoRef.current);
    }

    // Reset cache aggregator dan gambar
    aggregatorRef.current.reset();
    bestImagesRef.current = {};
    setHasSample(false);

    return { result, imageBase64 };
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
