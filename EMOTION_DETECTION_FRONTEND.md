# Frontend Implementation Guide — Emotion Detection

Panduan untuk **tim frontend `getsmart-frontend`** untuk mengimplementasi fitur deteksi emosi siswa. Dokumen ini sudah **disesuaikan 100% dengan codebase frontend existing** (Next.js 16, React 19, TanStack Query, Atomic Design, sonner, React Compiler, `pnpm`) **dan dengan kontrak HTTP API final** yang sudah ter-deploy.

> **Pendamping arsitektur:** [`EMOTION_DETECTION.md`](./EMOTION_DETECTION.md). Kalau ada konflik, dokumen arsitektur yang menang.

---

## Daftar Isi

1. [Konteks Codebase (WAJIB dibaca dulu)](#1-konteks-codebase-wajib-dibaca-dulu)
2. [Konsep & Mental Model](#2-konsep--mental-model)
3. [Terminologi Penting](#3-terminologi-penting)
4. [Kontrak HTTP API (Source of Truth)](#4-kontrak-http-api-source-of-truth)
5. [Setup Awal](#5-setup-awal)
6. [Penempatan File (Atomic Design)](#6-penempatan-file-atomic-design)
7. [Layer 1 — Web Worker (face-api)](#7-layer-1--web-worker-face-api)
8. [Layer 2 — Types & EmotionAggregator](#8-layer-2--types--emotionaggregator)
9. [Layer 3 — EmotionSampler](#9-layer-3--emotionsampler)
10. [Layer 4 — Hook `useEmotionDetector`](#10-layer-4--hook-useemotiondetector)
11. [Layer 5 — TanStack Query Hooks (`useGsEmotion`)](#11-layer-5--tanstack-query-hooks-usegsemotion)
12. [Layer 6 — Integrasi ke Halaman Remedial](#12-layer-6--integrasi-ke-halaman-remedial)
13. [Layer 7 — Integrasi ke Module Learning (SUBJECT)](#13-layer-7--integrasi-ke-module-learning-subject)
14. [Feedback Message Picker](#14-feedback-message-picker)
15. [Error Handling & Edge Cases](#15-error-handling--edge-cases)
16. [Testing (vitest)](#16-testing-vitest)
17. [Checklist Akhir](#17-checklist-akhir)

---

## 1. Konteks Codebase (WAJIB dibaca dulu)

Sebelum menulis kode apa pun, pahami konvensi proyek `getsmart-frontend` yang sudah berlaku. Implementasi emosi **harus mengikuti pola ini**, bukan bikin pola baru.

### 1.1. Stack

| Stack | Versi | Catatan |
|---|---|---|
| Next.js | `16.1.1` (App Router, `--webpack`) | `output: "standalone"`, **`reactCompiler: true`** |
| React | `19.2.3` | Server/Client Components, React Compiler aktif |
| TypeScript | `^5` strict | path alias `@/*` → `./src/*` |
| Tailwind | `v4` (`@tailwindcss/postcss`) | utility-first |
| State/data | `@tanstack/react-query` `^5.90.2` | **semua** request lewat hooks `useGs*` |
| HTTP | Server Action wrapper (`@/libs/api`) | internal-api-key tidak pernah ke browser |
| Toast | `sonner` via wrapper `@/libs/toast` | pakai `showToast.success/error/...` |
| Auth/cookie | `js-cookie` + `gs-jwt` server | auto-refresh handled |
| Test | `vitest` `^4.1.5` | jangan pakai Jest |
| Package manager | **`pnpm`** | jangan `npm install`, jangan `yarn add` |

### 1.2. Konvensi penting yang HARUS diikuti

1. **Atomic Design** untuk komponen (`atoms` → `molecules` → `organisms` → `templates`).
2. **App Router route group** untuk role-based: `src/app/(pages)/(private)/{role}/...`.
3. **Path alias `@/*`** — selalu pakai `@/components/...`.
4. **`"use client"`** di top file kalau ada hook React / browser API.
5. **HTTP via `gsPost`/`gsGet` (server action)**, dibungkus TanStack Query hook di `src/services/hooks/useGs*.ts`. **Jangan pakai `fetch` langsung dari komponen.**
6. **Query keys** terdaftar di `src/libs/api/queryKeys.ts`.
7. **Toast pakai wrapper** `import { showToast } from "@/libs/toast"`.
8. **React Compiler aktif** → tidak perlu `useCallback` / `useMemo` manual.
9. **Page = thin wrapper**: `page.tsx` cuma terima `params`, lalu render template dari `src/components/templates/pages/...`.

### 1.3. Yang SUDAH ADA di repo (jangan duplikat)

| Lokasi | Status | Yang harus dilakukan |
|---|---|---|
| `src/components/molecules/classroom/EmotionDetectionWidget.tsx` | **UI mockup**, props static | Pass `videoRef` dan `emotionLabel` real dari hook |
| `src/components/molecules/classroom/EmotionNotification.tsx` | **UI mockup** | Pakai apa adanya untuk feedback per soal |
| `src/components/templates/pages/classroom/ClassDiagnosisContentPageTemplate.tsx` | **Existing** | **Titik integrasi utama untuk remedial** |
| `src/services/hooks/useGsProgress.ts` | **Existing** `useSubmitRemedialVariant` | **Wajib di-update**: `emotion` sekarang OBJEK, bukan string (lihat §4) |
| `src/libs/api/queryKeys.ts` | Pusat semua query keys | Tambah namespace `emotions` di sini |
| `src/libs/toast.ts` | Wrapper sonner | Pakai `showToast.warning(...)` untuk error kamera |
| `src/libs/utils.ts` | `cn(...)` helper | Pakai kalau gabung class Tailwind |

> **Implikasi:** sebagian besar UI sudah ada. Yang baru: **logic layer** (worker, sampler, aggregator, hook), **1 hook query baru** (`useSubmitEmotionBucket`) untuk pengiriman data emosi, dan **update DTO** `SubmitRemedialVariantInput` (lihat §4.2). Hook pembacaan/analitik belum termasuk di iterasi ini.

### 1.4. Route remedial yang real

```
/student/dashboard/class/[slug]/materi/[id]/remedia/[remediaId]
```

Note: `remedia` (bukan `remedial`) — typo yang sudah ter-deploy. **Jangan diubah.** `remediaId` di params = `courseModuleId` untuk hook backend.

---

## 2. Konsep & Mental Model

### 2.1. Inti fitur

Deteksi emosi siswa via webcam saat (a) mengerjakan **remedial test** dan (b) **module learning** (= courseModule tipe SUBJECT — lihat §3), kirim ringkasan terstruktur ke backend. Di iterasi ini fokus pada **flow pengiriman data emosi**; konsumsi data (insight siswa, dashboard guru) menyusul.

### 2.2. Aturan main (jangan dilanggar)

1. **Video webcam JANGAN PERNAH dikirim ke server.** Yang dikirim hanya distribusi 8 label + metadata window.
2. **Semua komputasi CV di browser.** Server cuma terima objek `EmotionInput` (mode + distribution + sampleCount + durationMs + window timestamps).
3. **Emotion data WAJIB ada di SETIAP submit variant remedial.** Field `emotion` di `SubmitRemedialVariantInput` **harus terisi sebagai objek lengkap**. Kalau worker belum siap, **tunda submit** sampai minimal 1 sampel valid masuk. Kalau kamera fatal-error mid-session, kirim object dengan `mode: "unknown"` + distribusi yang `unknown: 1.0`.
4. **TIDAK ADA consent modal / opt-in.** Sekolah mitra sudah memberi izin institusional. Kalau siswa decline camera permission browser → blocking screen `CameraRequiredScreen`, **bukan fallback diam-diam**.
5. **Backend selalu rekomputasi `mode` dari `distribution`.** Field `mode` di payload hanya fallback bila semua proporsi nol. Frontend **harus tetap kirim** `mode` agar payload valid; saat fase analitik dibuka nanti, label yang muncul adalah hasil rekomputasi server, bukan persis yang frontend kirim.

### 2.3. Pipeline

```
📹 Webcam → 🎬 <video> → 🖼️ ImageBitmap (transferable)
   ↓ postMessage ke Worker
🤖 face-api di Worker → 7-emotion vector
   ↓
📊 EmotionSample {label, confidence, vector, ts}
   ↓ feed ke EmotionAggregator
📦 Aggregator (buffer per soal / per bucket ~30s)
   ↓ saat next-question / bucket flush
🎯 EmotionInput {mode, distribution(8 keys), sampleCount, durationMs, startedAt, endedAt}
   ↓ kirim
🚀 POST ke backend:
   • Remedial: ikut di body Submit Remedial Variant
   • Module learning (SUBJECT): endpoint terpisah Submit Emotion Bucket
```

---

## 3. Terminologi Penting

| Istilah | Arti di kode |
|---|---|
| **Course Module** | Entitas yang punya `courseModuleId` + field `type` enum: `SUBJECT` atau `DIAGNOSTIC_TEST`. |
| **Module Learning** | **Selalu** merujuk ke course module bertipe **`SUBJECT`** (baca materi + video + ELKPD). **Bukan** modul tipe `DIAGNOSTIC_TEST`. |
| **Remedial** | Sesi lanjutan dari course module tipe `DIAGNOSTIC_TEST` ketika siswa gagal lulus dan masuk fase remedial (paket A/B/C per soal). |
| **Variant** | Satu varian soal remedial dalam paket A/B/C — granularitas terkecil di remedial. |
| **Attempt** | Sesi pengerjaan tes (`attemptId`). Untuk remedial, satu attempt mencakup seluruh paket A/B/C per soal. |
| **Bucket** | Satu window sampling emosi pasif (mis. 30 detik) saat siswa belajar di module SUBJECT. |
| **Context** | Enum `MODULE_LEARNING` (saat di modul SUBJECT) atau `REMEDIAL` (saat di modul DIAGNOSTIC_TEST → fase remedial). Wajib dikirim di payload bucket. |

> **Aturan emas**: ketika dokumen ini menyebut "module learning", itu **selalu** courseModule tipe `SUBJECT`. Sampling pasif tidak berjalan di halaman tes diagnostik utama; tes diagnostik tidak melibatkan emosi (hanya remedial-nya yang dapat sampling per-variant + bucket).

---

## 4. Kontrak HTTP API (Source of Truth)

Kontrak HTTP API sudah final di server. Frontend **wajib mengikuti** struktur di bawah persis. Semua endpoint emosi berada di bawah base URL API + prefix `/api/progress/...` (sama seperti endpoint progress lain yang sudah dipakai di `useGsProgress.ts`).

### 4.1. Enum 8 label

`neutral | happy | sad | angry | fearful | disgusted | surprised | unknown`

Backend menolak (`400`) kalau `mode` di luar enum ini. Setiap key di `distribution` **harus ada** (boleh `0`).

### 4.2. `EmotionInput` (objek yang dikirim frontend)

Ini struktur **wajib** baik untuk Submit Remedial Variant maupun Submit Emotion Bucket:

```ts
interface EmotionInput {
  mode: EmotionLabel;                    // salah satu enum 8 label
  distribution: {                        // 8 key, semua wajib, jumlah ≈ 1.0
    neutral: number;
    happy: number;
    sad: number;
    angry: number;
    fearful: number;
    disgusted: number;
    surprised: number;
    unknown: number;
  };
  sampleCount: number;                   // jumlah frame yang berhasil di-process
  durationMs: number;                    // total durasi window (Date.now() endedAt - startedAt)
  startedAt?: string;                    // ISO 8601 — opsional tapi sangat disarankan
  endedAt?: string;                      // ISO 8601 — opsional tapi sangat disarankan
}
```

> Backend **menormalisasi** distribution ke total 1.0 dan **menghitung ulang** `mode` dari distribusi. Jadi kalau distribusi anda sedikit tidak presisi (sum 0.97 atau 1.03), tetap aman. Tapi pastikan tidak ada nilai negatif.

### 4.3. Endpoint #1 — Submit Remedial Variant (UPDATED)

```
POST /api/progress/modules/:courseModuleId/remedial/attempts/:attemptId/variants/submit
```

Body **baru** (perhatikan `emotion` sekarang OBJEK, bukan string):

```json
{
  "variantId": "uuid",
  "selectedOptionId": "uuid",
  "startedAt": "2026-05-26T10:00:00Z",
  "completedAt": "2026-05-26T10:01:30Z",
  "emotion": {
    "mode": "neutral",
    "distribution": { "neutral": 0.62, "happy": 0.10, "sad": 0.08, "angry": 0.04, "fearful": 0.06, "disgusted": 0.02, "surprised": 0.05, "unknown": 0.03 },
    "sampleCount": 30,
    "durationMs": 90000,
    "startedAt": "2026-05-26T10:00:00Z",
    "endedAt": "2026-05-26T10:01:30Z"
  }
}
```

Server akan:
1. Menyimpan data emosi terstruktur (mode, distribusi 8 label, sample count, durasi, timestamp) untuk variant yang baru disubmit.
2. **Menghitung ulang rollup emosi attempt-level secara asinkron** (untuk fase analitik berikutnya). Response submit tidak menunggu proses ini selesai.
3. Mengembalikan response yang **identik** dengan sebelumnya (next variant / discussion / summary).

### 4.4. Endpoint #2 — Submit Emotion Bucket (BARU, untuk module SUBJECT)

```
POST /api/progress/modules/:courseModuleId/emotion-bucket
```

Body:

```json
{
  "context": "MODULE_LEARNING",
  "attemptId": null,
  "emotion": {
    "mode": "happy",
    "distribution": { "...": "8 key" },
    "sampleCount": 60,
    "durationMs": 120000,
    "startedAt": "2026-05-26T09:00:00Z",
    "endedAt":   "2026-05-26T09:02:00Z"
  }
}
```

Karakteristik:
- **Fire-and-forget**: server menaruh job ke buffered channel, worker batch-insert setiap 2 detik atau setiap 64 item.
- Response selalu **`202 Accepted`**, tidak ada ID bucket di response.
- `context = "MODULE_LEARNING"` saat siswa sedang baca file / nonton video di modul SUBJECT → `attemptId` harus `null`.
- `context = "REMEDIAL"` boleh dipakai bila ingin record window emosi diluar siklus per-variant (mis. saat siswa lagi baca pembahasan) → `attemptId` wajib.
- **`503`**: queue penuh — boleh skip (data analitik best-effort, tidak retry agresif).
- **`404`**: kalau context=REMEDIAL tapi attemptId bukan milik siswa.

> **Catatan:** Endpoint pembacaan/analitik emosi (per-attempt & per-module) **belum** dirilis ke frontend di iterasi ini. Frontend untuk saat ini fokus pada flow **pengiriman data emosi** saja (dua endpoint di atas). Saat analitik siap dibuka, akan ditambahkan section terpisah & TanStack Query hooks pendamping.

### 4.5. Backward-compatibility

- Field `emotion` di body submit variant sekarang **objek terstruktur**, bukan string. Format lama (`emotion: "confident"`) **akan ditolak** dengan `400`.
- DTO TypeScript existing `SubmitRemedialVariantInput.emotion: string` **harus diubah** ke `emotion: EmotionInput` (server menerima `undefined` secara defensif, tapi flow frontend wajib mengirim).

---

## 5. Setup Awal

### 5.1. Install dependency

```bash
pnpm add @vladmandic/face-api
```

`@vladmandic/face-api` sudah bundle TFJS — tidak perlu install terpisah.

### 5.2. Model files

Taro di `public/models/`:
- `tiny_face_detector_model-weights_manifest.json`
- `tiny_face_detector_model-shard1`
- `face_expression_model-weights_manifest.json`
- `face_expression_model-shard1`

Source: <https://github.com/vladmandic/face-api/tree/master/model>

### 5.3. Worker

Plain JS di `public/workers/emotion-worker.js`. Worker akan `importScripts` face-api dari CDN (MVP) — bundle ke `public/workers/face-api.min.js` saat go-prod kalau koneksi sekolah terbatas.

### 5.4. CSP

`next.config.ts` belum set custom CSP. Kalau nanti ditambah, whitelist:
- `worker-src 'self' blob:`
- `script-src 'self' https://cdn.jsdelivr.net`
- `connect-src 'self' https://cdn.jsdelivr.net`

---

## 6. Penempatan File (Atomic Design)

```
getsmart-frontend/
├── public/
│   ├── models/                                   # NEW — face-api weights
│   └── workers/
│       └── emotion-worker.js                     # NEW — plain JS worker
└── src/
    ├── libs/
    │   ├── api/
    │   │   └── queryKeys.ts                      # UPDATE — tambah `emotions` namespace
    │   └── emotion/                              # NEW — logic layer
    │       ├── index.ts                          # barrel export
    │       ├── types.ts                          # EmotionLabel, EmotionInput, EmotionSample
    │       ├── EmotionAggregator.ts              # buffer + computeResult()
    │       ├── EmotionSampler.ts                 # video → worker orchestrator
    │       ├── normalize.ts                      # toEmotionInput() — bentuk payload kontrak backend
    │       └── feedback.ts                       # message picker per emosi
    ├── services/
    │   └── hooks/
    │       ├── useEmotionDetector.ts             # NEW — React hook utama
    │       ├── useEmotionDetectorBucketed.ts     # NEW — turunan untuk module SUBJECT (auto-flush per 30s)
    │       ├── useGsEmotion.ts                   # NEW — TanStack Query mutations + queries
    │       └── useGsProgress.ts                  # UPDATE — `emotion: EmotionInput` di SubmitRemedialVariantInput
    └── components/
        ├── molecules/
        │   └── classroom/
        │       ├── CameraRequiredScreen.tsx      # NEW — blocking screen
        │       ├── EmotionDetectionWidget.tsx    # EXISTING — refactor minor (video real)
        │       └── EmotionNotification.tsx       # EXISTING — pakai apa adanya
        └── templates/
            └── pages/
                └── classroom/
                    └── ClassDiagnosisContentPageTemplate.tsx   # UPDATE — wire emotion
                    # (Untuk module SUBJECT, integrasi di template halaman materi — lihat §13)
```

---

## 7. Layer 1 — Web Worker (face-api)

`public/workers/emotion-worker.js` — plain JS file supaya tidak perlu loader Webpack khusus.

### 7.1. Confidence threshold — kenapa wajib

face-api selalu mengembalikan distribusi probabilitas 7 emosi yang totalnya 1.0, **bahkan untuk frame buram / wajah tertutup masker / pencahayaan jelek**. Pada frame ambigu, output bisa seperti:

```js
{ neutral: 0.21, happy: 0.19, sad: 0.18, angry: 0.15, fearful: 0.13, disgusted: 0.08, surprised: 0.06 }
```

argmax = `"neutral"` dengan confidence **0.21**. Itu bukan deteksi yang valid — itu noise. Kalau di-push ke aggregator apa adanya, frame-frame noise akan **mendistorsi distribusi**: distribusi laporan emosi siswa jadi terlihat "agak campur" padahal sebenarnya banyak frame yang tidak meaningful.

**Solusi standar industri**: tolak frame dengan confidence di bawah threshold. Daripada drop frame (yang menyembunyikan informasi), label-i sebagai **`"unknown"`** — ini punya makna semantik yang jelas: "siswa terlihat tapi ekspresinya ambigu / tidak terbaca". Aggregator menangani `unknown` sebagai label kanonik ke-8.

**Threshold rekomendasi**: `0.40`. Angka ini berdasarkan empiris face-api/expression-net — di atas 0.4, prediksi mulai cukup konsisten; di bawah itu, hampir random. Boleh di-tune di interval `[0.35, 0.55]` sesuai sensitivitas yang diinginkan.

| Threshold | Behavior | Trade-off |
|---|---|---|
| `0.30` | Sangat permisif | Banyak frame ambigu masuk, distribusi noisy |
| **`0.40`** (default) | Seimbang | Sweet spot untuk kelas online |
| `0.50` | Konservatif | `unknown` lebih sering muncul, tapi label yang masuk lebih confident |
| `0.60+` | Sangat strict | Banyak frame jadi `unknown`; cocok hanya kalau pencahayaan kelas terjamin |

### 7.2. Implementasi worker

```js
// public/workers/emotion-worker.js
importScripts(
  "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13/dist/face-api.min.js",
);

// === Tuning constants ===
// Frame dengan max(confidence) < threshold di-label "unknown" supaya tidak mendistorsi distribusi.
const CONFIDENCE_THRESHOLD = 0.40;

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
      // (Sampler skip. Layer atas bisa pantau dengan "wajah hilang 10 detik" → toast.)
      if (!detection) {
        self.postMessage({ type: "RESULT", payload: null, ts });
        return;
      }

      // Build vector (7 keys dari face-api) + cari argmax + max confidence
      const expr = detection.expressions;
      let argmaxLabel = "neutral";
      let maxScore = -1;
      const vector = {};
      for (const key in expr) {
        vector[key] = expr[key];
        if (expr[key] > maxScore) { maxScore = expr[key]; argmaxLabel = key; }
      }

      // Kasus 2: wajah terdeteksi tapi confidence di bawah threshold
      // → label sebagai "unknown" (label kanonik ke-8). Vector tetap dikirim
      // utuh untuk debugging / upgrade ke confidence-weighted aggregation nanti.
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
```

### 7.3. Behavior matrix

| Skenario | `detection` | `maxScore` | `payload.label` | Akibat di aggregator |
|---|---|---|---|---|
| Wajah jelas, ekspresi confident | non-null | ≥0.40 | `"happy"` (dll) | counts emosi naik |
| Wajah terlihat tapi ekspresi ambigu (frame buram, sudut aneh) | non-null | <0.40 | `"unknown"` | counts `unknown` naik |
| Wajah tidak terdeteksi (siswa keluar frame, gelap total) | `null` | — | `null` (payload) | Sampler skip, tidak push ke aggregator |
| Worker error | — | — | — | Emit ERROR → main thread handle |

Catatan untuk hasil distribusi akhir:
- **`unknown` muncul kapan?** Saat wajah ada tapi model tidak yakin emosinya apa.
- **Wajah hilang ≠ unknown.** Wajah hilang = sample tidak ada sama sekali (sampler skip, count tidak naik). Layer atas (`useEmotionDetector.hasSample`) pantau ini dengan timeout 10s untuk trigger toast "Pastikan wajah di kamera".

### 7.4. Catatan model

face-api mengembalikan **7 label** (tanpa `unknown`). Label `unknown` muncul **HANYA** dari worker karena threshold check di atas, atau dari fallback fatal-error di layer atas (`buildUnknownResult`). Tidak ada path lain yang menghasilkan `unknown`.

---

## 8. Layer 2 — Types & EmotionAggregator

### 8.1. `src/libs/emotion/types.ts`

```ts
export type EmotionLabel =
  | "neutral" | "happy" | "sad" | "angry"
  | "fearful" | "disgusted" | "surprised" | "unknown";

// 7-label vector dari face-api (tanpa unknown)
export interface EmotionVector {
  neutral: number; happy: number; sad: number; angry: number;
  fearful: number; disgusted: number; surprised: number;
}

export interface EmotionSample {
  label: EmotionLabel;
  confidence: number;
  vector: EmotionVector;
  ts: number;            // Date.now() saat sampel diambil
}

// Kontrak backend — 8 key WAJIB ada, total ≈ 1.0
export interface EmotionDistribution {
  neutral: number; happy: number; sad: number; angry: number;
  fearful: number; disgusted: number; surprised: number; unknown: number;
}

// Bentuk objek yang dikirim ke API (lihat section 4)
export interface EmotionInput {
  mode: EmotionLabel;
  distribution: EmotionDistribution;
  sampleCount: number;
  durationMs: number;
  startedAt?: string;    // ISO 8601
  endedAt?: string;      // ISO 8601
}

// Bentuk internal sebelum di-serialize ke EmotionInput
export interface EmotionResult {
  mode: EmotionLabel;
  distribution: EmotionDistribution;
  sampleCount: number;
  durationMs: number;
  startedAtMs: number;
  endedAtMs: number;
}
```

### 8.2. `src/libs/emotion/EmotionAggregator.ts`

```ts
import type { EmotionLabel, EmotionSample, EmotionResult, EmotionDistribution } from "./types";

const LABELS: EmotionLabel[] = [
  "neutral", "happy", "sad", "angry",
  "fearful", "disgusted", "surprised", "unknown",
];

function emptyDistribution(): EmotionDistribution {
  return {
    neutral: 0, happy: 0, sad: 0, angry: 0,
    fearful: 0, disgusted: 0, surprised: 0, unknown: 0,
  };
}

export class EmotionAggregator {
  private samples: EmotionSample[] = [];
  private startedAt: number = Date.now();

  reset() {
    this.samples = [];
    this.startedAt = Date.now();
  }
  push(s: EmotionSample) { this.samples.push(s); }
  hasData() { return this.samples.length > 0; }

  /** Pakai untuk window fatal-error (kamera mati di tengah jalan). */
  buildUnknownResult(): EmotionResult {
    const now = Date.now();
    const dist = emptyDistribution();
    dist.unknown = 1;
    return {
      mode: "unknown",
      distribution: dist,
      sampleCount: 0,
      durationMs: Math.max(0, now - this.startedAt),
      startedAtMs: this.startedAt,
      endedAtMs: now,
    };
  }

  computeResult(): EmotionResult | null {
    if (this.samples.length === 0) return null;

    // Hitung proporsi LABEL DOMINAN per frame (mode-based).
    // Alternatif: rata-rata vector. Mode-based lebih stabil untuk feedback empatis.
    const counts: Record<EmotionLabel, number> = {
      neutral: 0, happy: 0, sad: 0, angry: 0,
      fearful: 0, disgusted: 0, surprised: 0, unknown: 0,
    };
    for (const s of this.samples) counts[s.label] += 1;

    const total = this.samples.length;
    const distribution = emptyDistribution();
    let mode: EmotionLabel = "neutral";
    let max = -1;
    for (const k of LABELS) {
      const pct = counts[k] / total;
      // Bulatkan 4 desimal supaya payload JSON tidak nampak "0.1666666666"
      distribution[k] = Math.round(pct * 10000) / 10000;
      if (counts[k] > max) { max = counts[k]; mode = k; }
    }

    const endedAtMs = this.samples[this.samples.length - 1].ts;
    return {
      mode,
      distribution,
      sampleCount: total,
      durationMs: Math.max(0, endedAtMs - this.startedAt),
      startedAtMs: this.startedAt,
      endedAtMs,
    };
  }
}
```

### 8.3. `src/libs/emotion/normalize.ts`

Bridge dari `EmotionResult` (bentuk internal) ke `EmotionInput` (kontrak backend) — supaya tidak ada code yang langsung manipulasi shape DTO.

```ts
import type { EmotionInput, EmotionResult } from "./types";

export function toEmotionInput(r: EmotionResult): EmotionInput {
  return {
    mode: r.mode,
    distribution: r.distribution,
    sampleCount: r.sampleCount,
    durationMs: r.durationMs,
    startedAt: new Date(r.startedAtMs).toISOString(),
    endedAt: new Date(r.endedAtMs).toISOString(),
  };
}
```

---

## 9. Layer 3 — EmotionSampler

`src/libs/emotion/EmotionSampler.ts` — orchestrator video + worker.

### 9.1. Pola: **skip-if-busy + watchdog** (WAJIB)

`postMessage` ke worker bersifat non-blocking, jadi `setInterval` "naif" akan **terus mengirim frame baru meskipun worker belum selesai memproses frame sebelumnya**. Pada device lambat (Chromebook sekolah, mobile mid-range) face-api bisa butuh 300–600ms per inference — kalau `intervalMs = 250`:

- **Queue worker membengkak** — setiap tick antri ke message queue worker tanpa batas.
- **Memori bocor** — `ImageBitmap` ±400KB/frame, ratusan menumpuk di queue → tab OOM-killed.
- **Sample basi** — saat worker akhirnya balas, gambar yang dianalisis sudah ratusan ms lalu. Distribusi emosi jadi lagging.
- **Baterai habis** — worker CPU 100% terus.

Solusi: **trailing-edge drop**. Kalau worker masih sibuk saat tick berikutnya, **skip tick itu**. Interval bukan kontrak "selalu jalankan tiap N ms" tapi "coba tiap N ms — kalau busy, lewati". Sampling rate efektif jadi adaptif ke kecepatan device.

Tambahan **watchdog** mencegah dead-lock: kalau worker hang (model crash, OOM internal), flag `inFlight` tidak akan pernah di-clear → semua tick selanjutnya skip selamanya. Watchdog 5s reset flag + emit error → blocking screen.

### 9.2. Implementasi

```ts
import type { EmotionSample } from "./types";

export interface EmotionSamplerOptions {
  video: HTMLVideoElement;
  intervalMs: number;
  modelUrl?: string;
  onSample: (s: EmotionSample) => void;
  onError?: (err: Error) => void;
  /** Max waktu worker boleh "sibuk" sebelum dianggap hang. Default 5000. */
  inflightTimeoutMs?: number;
}

const DEFAULT_INFLIGHT_TIMEOUT_MS = 5000;

export class EmotionSampler {
  private worker: Worker | null = null;
  private timer: number | null = null;
  private running = false;

  // Back-pressure guard
  private inFlight = false;
  private inFlightSince = 0;

  // Debug counter (opsional — useful untuk diagnosa device lambat)
  private stats = { sampled: 0, skipped: 0 };

  private opts: EmotionSamplerOptions;

  constructor(opts: EmotionSamplerOptions) { this.opts = opts; }

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;
    this.worker = new Worker("/workers/emotion-worker.js");

    // INIT — wait until model loaded
    await new Promise<void>((resolve, reject) => {
      const onReady = (e: MessageEvent) => {
        if (e.data.type === "READY") {
          this.worker?.removeEventListener("message", onReady);
          resolve();
        }
        if (e.data.type === "ERROR") reject(new Error(e.data.error));
      };
      this.worker!.addEventListener("message", onReady);
      this.worker!.postMessage({
        type: "INIT",
        payload: { modelUrl: this.opts.modelUrl ?? "/models" },
      });
    });

    // Handler utama — clear inFlight di SETIAP balasan dari worker
    this.worker.addEventListener("message", (e) => {
      const { type, payload, ts } = e.data;
      if (type === "RESULT" || type === "ERROR") {
        this.inFlight = false;
      }
      if (type === "RESULT" && payload) {
        this.stats.sampled += 1;
        this.opts.onSample({ ...payload, ts });
      }
      if (type === "ERROR") this.opts.onError?.(new Error(e.data.error));
    });

    this.timer = window.setInterval(() => { void this.tick(); }, this.opts.intervalMs);
  }

  private async tick() {
    if (!this.worker || !this.running) return;

    // === Skip-if-busy guard ===
    if (this.inFlight) {
      // Watchdog: kalau in-flight terlalu lama, anggap worker hang
      const timeout = this.opts.inflightTimeoutMs ?? DEFAULT_INFLIGHT_TIMEOUT_MS;
      if (Date.now() - this.inFlightSince > timeout) {
        this.inFlight = false;
        this.opts.onError?.(
          new Error(`Emotion worker stalled (>${timeout}ms no response)`),
        );
      } else {
        this.stats.skipped += 1;
      }
      return;
    }

    const v = this.opts.video;
    if (v.readyState < 2 || v.paused || v.ended) return;

    try {
      const bitmap = await createImageBitmap(v);
      this.inFlight = true;
      this.inFlightSince = Date.now();
      this.worker.postMessage(
        { type: "DETECT", payload: { imageBitmap: bitmap, ts: Date.now() } },
        [bitmap],   // transferable — zero-copy, ownership pindah ke worker
      );
    } catch (err) {
      this.inFlight = false;   // gagal sebelum kirim → bukan in-flight
      this.opts.onError?.(err as Error);
    }
  }

  /** Optional: snapshot stats (dipakai dev panel atau auto-tuning interval). */
  getStats() {
    return { ...this.stats };
  }

  stop() {
    this.running = false;
    this.inFlight = false;
    if (this.timer !== null) { window.clearInterval(this.timer); this.timer = null; }
    this.worker?.terminate();
    this.worker = null;
  }
}
```

### 9.3. Perilaku end-to-end (contoh)

`intervalMs = 250`, inference face-api ~400ms per frame:

```
t=0     tick → inFlight=false → postMessage frame A → inFlight=true
t=250   tick → inFlight=true  → SKIP   (stats.skipped++)
t=400   worker balas A → inFlight=false → onSample(A)
t=500   tick → inFlight=false → postMessage frame B → inFlight=true
t=750   tick → inFlight=true  → SKIP
t=900   worker balas B → inFlight=false
t=1000  tick → postMessage frame C → ...
```

Effective rate ≈ **2 sampel/detik**, bukan 4 yang dijanjikan interval. Ini **fitur, bukan bug** — sample rate menyesuaikan dengan kecepatan device.

### 9.4. Tuning interval

- **Remedial** → `intervalMs: 500` (responsif, durasi pendek per variant)
- **Module SUBJECT** → `intervalMs: 1000` (hemat baterai, sesi panjang)
- **Jangan turun di bawah 250ms** — sebagian besar device tidak akan bisa mengejar, dan kamu cuma menambah skip tanpa menambah sample.

### 9.5. Auto-tuning (nice-to-have, bukan must)

Setelah punya `stats.skipped`, kamu bisa adaptif:

```ts
// Cek tiap 10 detik
setInterval(() => {
  const { sampled, skipped } = sampler.getStats();
  const ratio = skipped / (sampled + skipped || 1);
  if (ratio > 0.4) console.warn("[emotion] device lambat — pertimbangkan naikkan intervalMs");
}, 10_000);
```

Untuk MVP, cukup constant interval + skip-if-busy. Auto-tuning bisa fase berikutnya.

---

## 10. Layer 4 — Hook `useEmotionDetector`

`src/services/hooks/useEmotionDetector.ts`:

```ts
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
  /** Flush hasil agregat + reset buffer. Kembalikan `null` kalau belum ada sampel. */
  flushAndReset: () => EmotionResult | null;
  /** Flush + reset, garansi non-null: kalau buffer kosong, kembalikan EmotionResult `unknown` (fallback fatal-error). */
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

  const [currentEmotion, setCurrentEmotion] = useState<EmotionSample | null>(null);
  const [ready, setReady] = useState(false);
  const [hasSample, setHasSample] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    if (!enabled || !videoRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" }, audio: false,
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
    }
  }, [enabled, intervalMs]);

  const stop = useCallback(() => {
    samplerRef.current?.stop();
    samplerRef.current = null;
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setReady(false);
  }, []);

  const flushAndReset = useCallback((): EmotionResult | null => {
    const result = aggregatorRef.current.computeResult();
    aggregatorRef.current.reset();
    setHasSample(false);
    return result;
  }, []);

  const flushOrUnknown = useCallback((): EmotionResult => {
    const result = aggregatorRef.current.computeResult()
      ?? aggregatorRef.current.buildUnknownResult();
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

  useEffect(() => () => stop(), [stop]);

  return {
    videoRef, currentEmotion, ready, hasSample, error,
    flushAndReset, flushOrUnknown, start, stop,
  };
}
```

---

## 11. Layer 5 — TanStack Query Hooks (`useGsEmotion`)

> **Scope iterasi ini:** hanya hook **pengiriman** data emosi. Hook pembacaan/analitik (per-attempt & per-module) belum dibuat — tunggu fase analitik dibuka.

### 11.1. Tambah query keys

Di `src/libs/api/queryKeys.ts`, tambahkan namespace baru:

```ts
export const queryKeys = {
  // ... existing
  emotions: {
    all: ["emotions"] as const,
    // namespace untuk hook pembacaan akan ditambahkan saat fase analitik dibuka
  },
};
```

### 11.2. `src/services/hooks/useGsEmotion.ts`

```ts
"use client";

import { useMutation } from "@tanstack/react-query";
import { gsPost } from "@/libs/api/gsAction";
import type { EmotionInput } from "@/libs/emotion/types";

// ── Submit emotion bucket (module SUBJECT atau remedial diluar siklus variant) ──

export interface SubmitEmotionBucketInput {
  context: "MODULE_LEARNING" | "REMEDIAL";
  attemptId?: string | null;
  emotion: EmotionInput;
}

export function useSubmitEmotionBucket(courseModuleId: string) {
  return useMutation<void, Error, SubmitEmotionBucketInput>({
    mutationFn: (input) =>
      gsPost<void>(
        `/progress/modules/${courseModuleId}/emotion-bucket`,
        input,
      ),
    // Best-effort: jangan retry agresif, jangan toast error (data analitik, bukan kritikal)
    retry: 0,
  });
}
```

### 11.3. Update `useGsProgress.ts`

DTO existing `SubmitRemedialVariantInput.emotion: string` **harus diubah**:

```ts
// Before
emotion?: string;

// After
import type { EmotionInput } from "@/libs/emotion/types";
emotion?: EmotionInput;
```

Mutation `useSubmitRemedialVariant` tetap sama — frontend cukup menyertakan objek `emotion` di body. Tidak ada invalidation analitik di iterasi ini.

---

## 12. Layer 6 — Integrasi ke Halaman Remedial

### 12.1. Titik integrasi

`src/components/templates/pages/classroom/ClassDiagnosisContentPageTemplate.tsx`. Template ini sudah handle camera permission, timer, render soal, submit per-variant. **Yang ditambahkan**:

1. Mount `useEmotionDetector({ enabled: isRemedial, intervalMs: 500 })`.
2. Saat siswa klik "Mulai Remedial", panggil `emotion.start()`. Reject → render `<CameraRequiredScreen />`.
3. Wire `videoRef` ke `<EmotionDetectionWidget />`.
4. Saat submit variant:
   - Kalau `!emotion.hasSample` → disable tombol + toast "Sedang mendeteksi emosi".
   - Panggil `const result = emotion.flushAndReset()` lalu `toEmotionInput(result!)` jadi payload.
   - Kalau `result === null` (race condition rare), pakai `emotion.flushOrUnknown()` sebagai fallback.
5. Saat salah jawab → `<EmotionNotification />` dengan message dari `pickFeedback(result.mode)`.

### 12.2. Patch (pseudo-diff)

```tsx
import { useEmotionDetector } from "@/services/hooks/useEmotionDetector";
import { useSubmitRemedialVariant } from "@/services/hooks/useGsProgress";
import { toEmotionInput } from "@/libs/emotion/normalize";
import { pickFeedback } from "@/libs/emotion/feedback";
import CameraRequiredScreen from "@/components/molecules/classroom/CameraRequiredScreen";
import EmotionDetectionWidget from "@/components/molecules/classroom/EmotionDetectionWidget";
import EmotionNotification from "@/components/molecules/classroom/EmotionNotification";

// ... di dalam component template:

const isRemedial = !!remediaId;        // = courseModuleId tipe DIAGNOSTIC_TEST yang masuk fase remedial
const emotion = useEmotionDetector({ enabled: isRemedial, intervalMs: 500 });
const submitVariant = useSubmitRemedialVariant();
const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

const handleStartRemedial = async () => {
  try {
    await emotion.start();             // throws kalau camera deny → blocking screen via emotion.error
  } catch {
    return;
  }
  // ... existing start logic (useStartRemedialAttempt mutate, dst)
};

const handleSubmitVariant = async (selectedOptionId: string) => {
  if (!emotion.hasSample) {
    showToast.info("Sedang mendeteksi emosi, mohon tunggu sebentar...");
    return;
  }
  const result = emotion.flushAndReset() ?? emotion.flushOrUnknown();
  const startedAt = new Date(result.startedAtMs).toISOString();
  const completedAt = new Date(result.endedAtMs).toISOString();

  const res = await submitVariant.mutateAsync({
    courseModuleId: remediaId,
    attemptId: currentAttemptId!,
    input: {
      variantId: currentVariant.variantId,
      selectedOptionId,
      startedAt,
      completedAt,
      emotion: toEmotionInput(result),      // ← objek lengkap, BUKAN string
    },
  });

  if (!res.isCorrect) setFeedbackMsg(pickFeedback(result.mode));
};

// JSX:
{emotion.error && <CameraRequiredScreen reason={emotion.error} />}

{emotion.ready && (
  <EmotionDetectionWidget
    videoRef={emotion.videoRef}
    emotionLabel={emotion.currentEmotion?.label ?? "Mendeteksi..."}
    isLive
  />
)}

<button
  type="button"
  disabled={!emotion.hasSample || submitVariant.isPending}
  onClick={() => handleSubmitVariant(selectedOptionId)}
>
  {emotion.hasSample ? "Soal Berikutnya" : "Mendeteksi emosi..."}
</button>

{feedbackMsg && (
  <EmotionNotification
    questionIndex={activeQuestionIndex}
    emotionDescription={feedbackMsg}
    onDismiss={() => setFeedbackMsg(null)}
  />
)}
```

### 12.3. `CameraRequiredScreen.tsx`

`src/components/molecules/classroom/CameraRequiredScreen.tsx`:

```tsx
"use client";

interface CameraRequiredScreenProps { reason?: string; }

export default function CameraRequiredScreen({ reason }: CameraRequiredScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
        <h2 className="text-lg font-semibold text-[#0F172A]">Kamera Diperlukan</h2>
        <p className="mt-3 text-sm leading-6 text-[#475569]">
          Sesi remedial mengharuskan kamera aktif sesuai kebijakan sekolah.
          Aktifkan izin kamera browser kamu lalu reload halaman.
        </p>
        {reason && <p className="mt-2 text-xs text-[#94A3B8]">Detail: {reason}</p>}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white"
        >
          Reload Halaman
        </button>
      </div>
    </div>
  );
}
```

### 12.4. Halaman Review Hasil Remedial (di-skip di iterasi ini)

> Insight emosi per-attempt **tidak** dirender di halaman review pada iterasi ini — endpoint pembacaan analitik belum dibuka untuk frontend. Kartu insight (bar chart distribusi 8 label per-question, dst.) akan dikerjakan terpisah saat fase analitik dirilis.

### 12.5. Hal yang HARUS diperhatikan

- **Camera double-use**: kalau template existing sudah panggil `getUserMedia` sendiri untuk preview, **konsolidasikan** — biarkan hanya `useEmotionDetector.start()` yang panggil `getUserMedia`. Hindari error `NotReadableError: Could not start video source`.
- **Backward-compat DTO**: hapus semua tempat di codebase yang masih kirim `emotion: "string"` ke `useSubmitRemedialVariant`. TypeScript akan komplain setelah update tipe di `useGsProgress.ts` — fix semua call site.
- **`startedAt` / `completedAt`** di body submit variant: pakai dari window emosi (`startedAtMs`/`endedAtMs`) agar konsisten dengan window sampling. Bukan dari mount soal.

---

## 13. Layer 7 — Integrasi ke Module Learning (SUBJECT)

> **Module learning ≡ courseModule bertipe `SUBJECT`** — bukan tipe `DIAGNOSTIC_TEST`. Cek field `courseModule.type === "SUBJECT"` sebelum aktifkan sampling pasif.

### 13.1. Strategi

- `intervalMs: 1000` — hemat baterai.
- **Bucket window 30 detik** — setiap 30 detik, flush hasil agregat dan kirim ke `useSubmitEmotionBucket(...)`.
- Tidak ada feedback real-time ke siswa — data dikirim untuk dipakai di fase analitik berikutnya.
- Saat siswa pindah halaman / unmount: `navigator.sendBeacon` boleh dipakai untuk kirim window terakhir (opsional, MVP boleh skip).

### 13.2. Hook turunan `useEmotionDetectorBucketed`

`src/services/hooks/useEmotionDetectorBucketed.ts`:

```ts
"use client";

import { useEffect, useRef } from "react";
import { useEmotionDetector } from "./useEmotionDetector";
import { useSubmitEmotionBucket } from "./useGsEmotion";
import { toEmotionInput } from "@/libs/emotion/normalize";

interface UseEmotionDetectorBucketedOptions {
  /** Wajib SUBJECT — pemanggil harus pastikan ini courseModule SUBJECT */
  courseModuleId: string;
  enabled: boolean;
  bucketMs?: number;        // default 30_000
}

export function useEmotionDetectorBucketed(opts: UseEmotionDetectorBucketedOptions) {
  const { courseModuleId, enabled, bucketMs = 30_000 } = opts;
  const detector = useEmotionDetector({ enabled, intervalMs: 1000 });
  const submitBucket = useSubmitEmotionBucket(courseModuleId);
  const flushTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!detector.ready || !enabled) return;

    const tick = () => {
      const result = detector.flushAndReset();
      if (result && result.sampleCount > 0) {
        submitBucket.mutate({
          context: "MODULE_LEARNING",
          attemptId: null,
          emotion: toEmotionInput(result),
        });
      }
      flushTimer.current = window.setTimeout(tick, bucketMs);
    };
    flushTimer.current = window.setTimeout(tick, bucketMs);

    return () => {
      if (flushTimer.current !== null) {
        window.clearTimeout(flushTimer.current);
        flushTimer.current = null;
      }
      // Flush final saat unmount (best-effort, jangan await)
      const final = detector.flushAndReset();
      if (final && final.sampleCount > 0) {
        submitBucket.mutate({
          context: "MODULE_LEARNING",
          attemptId: null,
          emotion: toEmotionInput(final),
        });
      }
    };
  }, [detector.ready, enabled, bucketMs, courseModuleId]);

  return detector;
}
```

### 13.3. Wire di template materi SUBJECT

Di template halaman materi (misal `ClassMateriContentPageTemplate.tsx`):

```tsx
const isSubjectModule = courseModule?.type === "SUBJECT";

const emotion = useEmotionDetectorBucketed({
  courseModuleId,
  enabled: isSubjectModule,
  bucketMs: 30_000,
});

// Saat halaman pertama load, prompt kamera (sama seperti remedial)
useEffect(() => {
  if (!isSubjectModule) return;
  emotion.start().catch(() => {});  // error sudah di-handle oleh hook (error state)
}, [isSubjectModule]);

if (emotion.error) return <CameraRequiredScreen reason={emotion.error} />;
```

### 13.4. Dashboard guru (di-skip di iterasi ini)

> Dashboard analitik emosi per modul untuk guru **tidak** dibuat di iterasi ini — endpoint pembacaan analitik belum dibuka untuk frontend. Data sudah dikumpulkan via Endpoint #1 & #2; visualisasi dashboard menyusul saat fase analitik dirilis.

---

## 14. Feedback Message Picker

`src/libs/emotion/feedback.ts` — sama seperti sebelumnya:

```ts
import type { EmotionLabel } from "./types";

const messages: Record<EmotionLabel, string[]> = {
  sad: [
    "Jangan menyerah, kamu sudah berusaha keras. Coba pelan-pelan baca soalnya lagi.",
    "Tarik napas dulu — satu soal salah bukan akhir segalanya. Lanjut yuk!",
  ],
  angry: [
    "Tenang sebentar. Ambil 5 detik untuk napas dalam, baru lihat soal lagi.",
    "Frustrasi itu wajar. Coba istirahat sebentar kalau perlu.",
  ],
  fearful: [
    "Tidak apa-apa salah — ini bagian dari belajar. Kamu pasti bisa!",
    "Soal ini menantang ya. Ayo coba sekali lagi, kamu lebih tahu dari yang kamu kira.",
  ],
  disgusted: ["Materinya berat? Coba lihat pembahasan setelah ini agar lebih paham."],
  surprised: ["Kaget ya? Yuk baca soalnya pelan-pelan sekali lagi."],
  happy: ["Mantap! Tetap pertahankan semangatnya."],
  neutral: ["Kamu tetap fokus — keep going!"],
  unknown: ["Tetap semangat ya, lanjut ke soal berikutnya."],
};

export function pickFeedback(emotion: EmotionLabel): string {
  const pool = messages[emotion] ?? messages.neutral;
  return pool[Math.floor(Math.random() * pool.length)];
}
```

---

## 15. Error Handling & Edge Cases

> **Prinsip**: kamera **wajib**. Kalau ada apa-apa, render `<CameraRequiredScreen />` dan blokir akses ke soal. Yang dikirim ke backend selalu objek `EmotionInput` lengkap (8 key distribusi).

### Skenario wajib di-handle

| Skenario | Penanganan |
|---|---|
| Browser tanpa webcam | `getUserMedia` reject → `<CameraRequiredScreen />`, blokir lanjut |
| Decline camera permission | Sama: `<CameraRequiredScreen />` dengan pesan reload |
| Tanpa support `Worker` / `OffscreenCanvas` (Safari < 16.4) | `isEmotionSupported()` false → blocking screen "Browser tidak didukung" |
| Worker gagal load model (CDN down) | `emotion.error` ter-set → blocking screen "Gagal load model AI" |
| Wajah tidak terdeteksi 1 frame | `payload: null` — sampler skip, jangan push |
| Wajah tidak terdeteksi 10+ detik (siswa keluar) | `hasSample === false` saat mau next-question → disable tombol + toast "Pastikan wajah di kamera" |
| Wajah terdeteksi tapi confidence rendah (<0.40) | Worker label sebagai `"unknown"` → masuk ke distribusi. Bukan bug |
| Tab di-background | `visibilitychange` listener pause `<video>` (hook sudah handle) |
| Camera stream cabut mid-session | `MediaStreamTrack.onended` → set `error` → blocking screen. Boleh kirim satu submit terakhir dengan `flushOrUnknown()` sebelum blok |
| Submit bucket return 503 | Skip (best-effort), JANGAN retry. Toast diam-diam aja |
| Submit variant 400 karena `mode` tidak match enum | **Bug serius** — pastikan `result.mode` selalu di-derive dari `EmotionAggregator` (yang menjamin enum valid) |
| Worker hang / inference >5s | Watchdog di sampler reset `inFlight`, emit error → `<CameraRequiredScreen />` "Deteksi emosi macet" |
| Device sangat lambat (skip rate >40%) | Bukan error — interval efektif menurun otomatis. Pertimbangkan naikkan `intervalMs` ke 1000 |

### Feature detection

```ts
export function isEmotionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    window.Worker &&
      window.OffscreenCanvas &&
      navigator.mediaDevices?.getUserMedia &&
      "createImageBitmap" in window,
  );
}
```

Pakai **sebelum** mount `useEmotionDetector`:

```tsx
if (!isEmotionSupported()) {
  return <CameraRequiredScreen reason="Browser kamu tidak mendukung deteksi emosi. Gunakan Chrome/Edge/Firefox versi terbaru." />;
}
```

---

## 16. Testing (vitest)

### 16.1. `EmotionAggregator`

`src/libs/emotion/__tests__/EmotionAggregator.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { EmotionAggregator } from "../EmotionAggregator";

describe("EmotionAggregator", () => {
  it("returns null when no samples", () => {
    expect(new EmotionAggregator().computeResult()).toBeNull();
  });

  it("computes mode and 8-key distribution", () => {
    const agg = new EmotionAggregator();
    const baseVector = { neutral: 0, happy: 0, sad: 0, angry: 0, fearful: 0, disgusted: 0, surprised: 0 };
    agg.push({ label: "happy", confidence: 0.9, vector: baseVector, ts: 1 });
    agg.push({ label: "happy", confidence: 0.8, vector: baseVector, ts: 2 });
    agg.push({ label: "sad",   confidence: 0.7, vector: baseVector, ts: 3 });

    const r = agg.computeResult()!;
    expect(r.mode).toBe("happy");
    expect(r.sampleCount).toBe(3);
    expect(Object.keys(r.distribution).sort()).toEqual(
      ["angry","disgusted","fearful","happy","neutral","sad","surprised","unknown"],
    );
    expect(r.distribution.happy).toBeCloseTo(0.6667, 3);
    expect(r.distribution.unknown).toBe(0);
  });

  it("buildUnknownResult returns full 8-key dist with unknown=1", () => {
    const r = new EmotionAggregator().buildUnknownResult();
    expect(r.mode).toBe("unknown");
    expect(r.distribution.unknown).toBe(1);
    expect(r.distribution.happy).toBe(0);
  });
});
```

### 16.2. `toEmotionInput`

```ts
import { describe, it, expect } from "vitest";
import { toEmotionInput } from "../normalize";

describe("toEmotionInput", () => {
  it("produces ISO 8601 timestamps", () => {
    const out = toEmotionInput({
      mode: "neutral",
      distribution: { neutral: 1, happy: 0, sad: 0, angry: 0, fearful: 0, disgusted: 0, surprised: 0, unknown: 0 },
      sampleCount: 1, durationMs: 1000,
      startedAtMs: 0, endedAtMs: 1000,
    });
    expect(out.startedAt).toBe("1970-01-01T00:00:00.000Z");
    expect(out.endedAt).toBe("1970-01-01T00:00:01.000Z");
    expect(out.distribution.unknown).toBe(0);
  });
});
```

---

## 17. Checklist Akhir

**DTO & Hooks**
- [ ] `SubmitRemedialVariantInput.emotion` di `useGsProgress.ts` diubah dari `string` ke `EmotionInput`
- [ ] `useGsEmotion.ts` punya `useSubmitEmotionBucket` (hook pembacaan/analitik **belum** dibuat di iterasi ini)
- [ ] Semua call site lama yang kirim `emotion: "string"` sudah dihapus / dikonversi
- [ ] Namespace `queryKeys.emotions` ada di `queryKeys.ts` (sub-key untuk pembacaan menyusul fase analitik)

**Remedial flow**
- [ ] `useEmotionDetector` mounted di `ClassDiagnosisContentPageTemplate`
- [ ] Kamera deny → `<CameraRequiredScreen />`, blokir akses ke soal
- [ ] Tombol "Soal Berikutnya" disable sampai `emotion.hasSample === true`
- [ ] Setiap submit variant kirim `emotion: EmotionInput` lengkap (cek Network tab — 8 key di distribusi)
- [ ] Saat salah jawab → `<EmotionNotification />` muncul dengan message dari `pickFeedback`

**Module SUBJECT flow**
- [ ] `useEmotionDetectorBucketed` aktif **HANYA** kalau `courseModule.type === "SUBJECT"`
- [ ] Bucket di-kirim ke `/progress/modules/:id/emotion-bucket` setiap 30s saat siswa belajar
- [ ] Final bucket di-flush saat unmount
- [ ] `context = "MODULE_LEARNING"`, `attemptId = null` untuk semua bucket SUBJECT

**Edge cases**
- [ ] Browser tanpa OffscreenCanvas → blocking screen "Browser tidak didukung"
- [ ] Tab di-background — sampling pause via `visibilitychange`
- [ ] Stream cabut mid-session → blocking screen, soal di-pause
- [ ] Wajah hilang 10s beruntun → tombol disable + toast peringatan
- [ ] Submit bucket 503 → silent skip, tidak ada toast / retry loop

**Privacy & Correctness**
- [ ] Network tab → **TIDAK ADA** blob image/video keluar perangkat
- [ ] Payload submit variant punya `emotion` objek dengan 8 key distribusi (cek 10 submit beruntun)
- [ ] `mode` di payload selalu salah satu dari 8 enum label
- [ ] Sum semua proporsi distribusi `≈ 1.0` (toleransi `[0.95, 1.05]` karena rounding)

**Cross-browser**
- [ ] Chrome ≥ 110 ✓
- [ ] Edge ≥ 110 ✓
- [ ] Firefox ≥ 110 ✓
- [ ] Safari ≥ 16.4 ✓ (di bawah itu → blocking screen)

---

## Penutup

Prinsip yang dipegang:

1. **Data WAJIB lengkap dan terstruktur** — setiap submit variant kirim **objek `EmotionInput`** (mode + 8-key distribution + sampleCount + durationMs + window). Tombol submit di-disable sampai sampel siap.
2. **Privacy di sisi data, bukan di sisi opt-in** — video tidak pernah keluar perangkat; siswa tidak punya opt-out (izin di-cover sekolah).
3. **Kamera wajib** — kalau gagal, `CameraRequiredScreen` blokir akses. Tidak ada fallback diam-diam.
4. **Module learning = courseModule SUBJECT** — sampling pasif via `useEmotionDetectorBucketed` HANYA aktif di tipe SUBJECT. Jangan aktifkan di DIAGNOSTIC_TEST utama (sampling aktif sudah ditangani per-variant di fase remedial-nya).
5. **Backend rekomputasi mode** — frontend mengirim `mode` tapi server akan derive ulang dari distribusi. Saat fase analitik dibuka, label yang muncul mengikuti hasil server.
6. **Fokus iterasi ini: kirim data, bukan baca data** — endpoint & hook untuk pembacaan/analitik (per-attempt & per-module) belum dirilis ke frontend. Jangan bangun UI insight siswa atau dashboard guru di iterasi ini.
7. **Ikuti konvensi project** — Atomic Design, TanStack Query, `@/libs/toast`, `pnpm`, `vitest`, path alias `@/*`.
8. **Minimum invasive** — extend template existing, jangan bikin template baru.

Kalau ada kebingungan tentang bentuk payload atau response, **section 4 (Kontrak HTTP API)** adalah source of truth — itulah kontrak persis yang server harapkan & kembalikan.
