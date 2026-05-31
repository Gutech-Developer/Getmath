// public/workers/emotion-worker.js
// Plain JS Web Worker — tidak pakai bundler Webpack khusus
// face-api di-load via CDN (bundle ke public/workers/face-api.min.js saat go-prod)

// TensorFlow.js (bundled dalam face-api) mendeteksi "browser" environment lewat
// `typeof window !== 'undefined' && typeof window.document !== 'undefined'`
// DAN di beberapa versi juga cek `typeof window.document.createElement === 'function'`.
// Di Web Worker, `window` dan `document` tidak ada → TFJS throws
// "getEnv - environment is not defined". Fix: stub keduanya sebelum import.
if (typeof window === "undefined") {
  // document harus punya createElement sebagai function agar isBrowser() pass
  self.document = {
    createElement: function () {
      return {};
    },
    getElementsByTagName: function () {
      return [];
    },
  };
  // Set window = self SETELAH document di-set supaya window.document sudah valid
  self.window = self;
}

importScripts(
  "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13/dist/face-api.min.js",
);

// === Tuning constants ===
// Frame dengan max(confidence) < threshold di-label "unknown"
// supaya tidak mendistorsi distribusi dengan frame ambigu/noise.
// Sweet spot empiris: 0.40 (interval aman: 0.35–0.55)
const CONFIDENCE_THRESHOLD = 0.4;

let ready = false;

self.onmessage = async (e) => {
  const { type, payload } = e.data;

  if (type === "INIT") {
    try {
      const modelUrl = payload?.modelUrl ?? "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl);
      await faceapi.nets.faceExpressionNet.loadFromUri(modelUrl);
      ready = true;
      self.postMessage({ type: "READY" });
    } catch (err) {
      self.postMessage({ type: "ERROR", error: String(err) });
    }
    return;
  }

  if (type === "DETECT") {
    if (!ready) {
      self.postMessage({ type: "ERROR", error: "Worker not ready" });
      return;
    }
    const { imageBitmap, ts } = payload;
    try {
      const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
      canvas.getContext("2d").drawImage(imageBitmap, 0, 0);

      const detection = await faceapi
        .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      imageBitmap.close();

      // Kasus 1: wajah tidak terdeteksi sama sekali → null
      // Sampler skip. Layer atas pantau "wajah hilang 10 detik" → toast.
      if (!detection) {
        self.postMessage({ type: "RESULT", payload: null, ts });
        return;
      }

      // Build vector dari 7 label kanonik face-api secara eksplisit.
      // JANGAN gunakan for...in: detection.expressions adalah FaceExpressions
      // instance yang punya method (asSortedArray, dll.) — iterasi for...in
      // akan ikut menyalin properti non-emosi ke vector dan merusak argmax.
      const CANONICAL = [
        "neutral",
        "happy",
        "sad",
        "angry",
        "fearful",
        "disgusted",
        "surprised",
      ];
      const expr = detection.expressions;
      let argmaxLabel = "neutral";
      let maxScore = -1;
      const vector = {};
      for (const key of CANONICAL) {
        const score = expr[key] ?? 0;
        vector[key] = score;
        if (score > maxScore) {
          maxScore = score;
          argmaxLabel = key;
        }
      }

      // Kasus 2: wajah terdeteksi tapi confidence di bawah threshold
      // → label sebagai "unknown" (label kanonik ke-8)
      // Vector tetap dikirim utuh untuk debugging
      const label = maxScore < CONFIDENCE_THRESHOLD ? "unknown" : argmaxLabel;

      self.postMessage({
        type: "RESULT",
        payload: { label, confidence: maxScore, vector },
        ts,
      });
    } catch (err) {
      self.postMessage({ type: "ERROR", error: String(err) });
    }
  }
};
