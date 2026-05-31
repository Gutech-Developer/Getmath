// public/workers/emotion-worker.js
// Plain JS Web Worker — tidak pakai bundler Webpack khusus
// face-api di-load via CDN (bundle ke public/workers/face-api.min.js saat go-prod)

// TensorFlow.js (bundled dalam face-api) mendeteksi "browser" environment lewat
// `typeof window !== 'undefined' && typeof window.document !== 'undefined'`
// DAN di beberapa versi juga cek `typeof window.document.createElement === 'function'`.
// Di Web Worker, `window` dan `document` tidak ada → TFJS throws
// "getEnv - environment is not defined". Fix: stub keduanya sebelum import.
if (typeof window === "undefined") {
  // More complete stub so TFJS isBrowser() and env detection work in Workers.
  const fakeCanvas = {
    getContext: () => null,
    style: {},
    setAttribute: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    clientWidth: 0,
    clientHeight: 0,
    width: 0,
    height: 0,
  };
  self.document = {
    createElement: (tag) => {
      if (tag === "canvas") return fakeCanvas;
      return {
        style: {},
        setAttribute: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
      };
    },
    getElementsByTagName: () => [],
    getElementById: () => null,
    body: { appendChild: () => {}, removeChild: () => {} },
    readyState: "complete",
  };
  // window = self makes isBrowser() pass (checks typeof window !== 'undefined')
  self.window = self;
  // Stub DOM classes face-api uses instanceof checks on
  if (typeof HTMLVideoElement === "undefined") self.HTMLVideoElement = class {};
  if (typeof HTMLImageElement === "undefined") self.HTMLImageElement = class {};
  if (typeof HTMLCanvasElement === "undefined")
    self.HTMLCanvasElement = class {};
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
      // Force CPU backend before loading models.
      // In a Web Worker, TFJS can't set up WebGL (no real canvas/GPU context),
      // which leaves ENV in a broken state and throws "getEnv – environment is
      // not defined". Explicitly setting 'cpu' backend avoids the WebGL setup.
      await faceapi.tf.setBackend("cpu");
      await faceapi.tf.ready();
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
