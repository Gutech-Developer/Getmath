# Panduan Implementasi Snapshot Kamera Siswa (Frontend)

Panduan ini ditujukan bagi **tim frontend** (`getsmart-frontend`) dan **agent coding frontend** untuk menambahkan fitur pengambilan foto snapshot wajah siswa secara otomatis saat mengirimkan jawaban remedial.

---

## 1. Konteks & Tujuan

Backend saat ini telah mendukung pengarsipan gambar deteksi emosi secara asinkron ke Google Drive sekolah (untuk menghindari kuota limit `403 storageQuotaExceeded` pada Service Account). 

Agar fitur ini berjalan, **Frontend berkewajiban untuk mengirimkan 1 gambar wajah siswa berformat Base64 Data URL** di dalam body payload submission remedial variant.

> ℹ️ **Catatan Pemilihan Gambar (Best Frame Cache Map)**: 
> * Gambar **tidak** dipilih secara manual oleh siswa dari penyimpanan komputer/file explorer mereka. 
> * Gambar yang dikirim **bukan** merupakan snapshot acak sesaat sebelum tombol submit diklik. Pemilihan gambar dilakukan **100% otomatis** dengan menyimpan frame kamera yang memiliki **tingkat confidence tertinggi** untuk kategori emosi dominan (modus) selama variant soal tersebut dikerjakan (dengan menerapkan taktik "Best Frame Cache Map" di memori lokal).

---

## 2. Kontrak HTTP API (Payload Perubahan)

Pada pemanggilan API submit remedial variant:

```http
POST /api/progress/modules/:courseModuleId/remedial/attempts/:remedialAttemptId/variants/submit
```

Payload body menerima field baru bernama **`imageBase64`** (tipe data `string`, opsional/defensive di backend, namun wajib diisi oleh flow normal frontend):

### Contoh Request Body

```json
{
  "variantId": "37bda6d0-ffaa-441c-b1ef-dfc180cb6bca",
  "selectedOptionId": "1cbb1b5c-b4c6-44d2-900c-ec8fe97c9983",
  "startedAt": "2026-05-26T10:00:00Z",
  "completedAt": "2026-05-26T10:01:30Z",
  "emotion": {
    "mode": "neutral",
    "distribution": {
      "neutral": 0.62,
      "happy": 0.1,
      "sad": 0.08,
      "angry": 0.04,
      "fearful": 0.06,
      "disgusted": 0.02,
      "surprised": 0.05,
      "unknown": 0.03
    },
    "sampleCount": 30,
    "durationMs": 90000,
    "startedAt": "2026-05-26T10:00:00Z",
    "endedAt": "2026-05-26T10:01:30Z"
  },
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/..."
}
```

> ⚠️ **PENTING (Batasan Backend)**: Backend membatasi ukuran gambar biner maksimal **1MB**. Payload di atas batas ini akan ditolak dengan error `413 Payload Too Large` atau error validasi. Frontend wajib melakukan _resizing_ dan kompresi kualitas gambar (rekomendasi rincian di bawah).

---

## 3. Langkah-Langkah Implementasi

### Langkah 1: Perbarui Tipe Data (DTO)

Update interface `SubmitRemedialVariantInput` di berkas:
📄 **[`src/services/hooks/useGsProgress.ts`](file:///home/glennhkm/Documents/Projects/Gutech/getsmart/getsmart-frontend/src/services/hooks/useGsProgress.ts)**

```typescript
export interface SubmitRemedialVariantInput {
  variantId: string;
  selectedOptionId: string | null;
  startedAt?: string;
  completedAt?: string;
  emotion?: EmotionInput;
  imageBase64?: string; // <--- TAMBAHKAN FIELD INI
}
```

---

### Langkah 2: Buat Fungsi Helper Snapshot (Best Practice)

Gunakan HTML5 Canvas untuk menangkap frame video, mengubah resolusinya (maksimal dimensi 640px) agar file sangat kecil, dan mengompresinya menggunakan format JPEG kualitas menengah (50% / `0.5`).

Proses ini sangat cepat (~10-30ms) dan berjalan di level native browser (C++).

Buat helper baru di berkas helper/utilitas emosi Anda, misalnya di:
📄 **`src/libs/emotion/snapshot.ts`** (atau gabungkan ke `src/libs/emotion/index.ts`)

```typescript
/**
 * Mengambil snapshot dari elemen HTMLVideoElement, mengecilkan skalanya (max 640px),
 * dan mengembalikannya sebagai string Base64 Data URL berformat JPEG kualitas 50%.
 * Menghasilkan output sangat kecil (~30KB - 80KB) yang ramah bandwidth siswa.
 */
export function captureVideoSnapshot(
  video: HTMLVideoElement | null,
): string | undefined {
  if (!video || video.readyState < 2 || video.paused || video.ended) {
    return undefined;
  }

  try {
    const canvas = document.createElement("canvas");

    // Batasan dimensi maksimal 640px demi menghemat memori & bandwidth
    const MAX_DIMENSION = 640;
    let width = video.videoWidth;
    let height = video.videoHeight;

    if (width === 0 || height === 0) return undefined;

    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      if (width > height) {
        height = Math.round((height * MAX_DIMENSION) / width);
        width = MAX_DIMENSION;
      } else {
        width = Math.round((width * MAX_DIMENSION) / height);
        height = MAX_DIMENSION;
      }
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    // Gambar frame video saat ini ke canvas
    ctx.drawImage(video, 0, 0, width, height);

    // Kompresi kualitas JPEG ke 0.5 (50%) untuk menghemat kapasitas Google Drive sekolah
    return canvas.toDataURL("image/jpeg", 0.5);
  } catch (error) {
    console.error("[EmotionSnapshot] Gagal mengambil snapshot kamera:", error);
    return undefined;
  }
}
```

---

## 3. Langkah-Langkah Implementasi

### Langkah 1: Perbarui Tipe Data (DTO)

Update interface `SubmitRemedialVariantInput` di berkas:
📄 **[`src/services/hooks/useGsProgress.ts`](file:///home/glennhkm/Documents/Projects/Gutech/getsmart/getsmart-frontend/src/services/hooks/useGsProgress.ts)**

```typescript
export interface SubmitRemedialVariantInput {
  variantId: string;
  selectedOptionId: string | null;
  startedAt?: string;
  completedAt?: string;
  emotion?: EmotionInput;
  imageBase64?: string; // <--- TAMBAHKAN FIELD INI
}
```

---

### Langkah 2: Buat Fungsi Helper Snapshot (Best Practice)

Gunakan HTML5 Canvas untuk menangkap frame video, mengubah resolusinya (maksimal dimensi 640px) agar file sangat kecil, dan mengompresinya menggunakan format JPEG kualitas menengah (50% / `0.5`).

Buat helper baru di berkas helper/utilitas emosi Anda, misalnya di:
📄 **`src/libs/emotion/snapshot.ts`** (atau gabungkan ke `src/libs/emotion/index.ts`)

```typescript
/**
 * Mengambil snapshot dari elemen HTMLVideoElement, mengecilkan skalanya (max 640px),
 * dan mengembalikannya sebagai string Base64 Data URL berformat JPEG kualitas 50%.
 */
export function captureVideoSnapshot(
  video: HTMLVideoElement | null,
): string | undefined {
  if (!video || video.readyState < 2 || video.paused || video.ended) {
    return undefined;
  }

  try {
    const canvas = document.createElement("canvas");
    const MAX_DIMENSION = 640;
    let width = video.videoWidth;
    let height = video.videoHeight;

    if (width === 0 || height === 0) return undefined;

    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      if (width > height) {
        height = Math.round((height * MAX_DIMENSION) / width);
        width = MAX_DIMENSION;
      } else {
        width = Math.round((width * MAX_DIMENSION) / height);
        height = MAX_DIMENSION;
      }
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    ctx.drawImage(video, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", 0.5);
  } catch (error) {
    console.error("[EmotionSnapshot] Gagal mengambil snapshot kamera:", error);
    return undefined;
  }
}
```

---

### Langkah 3: Perbarui Hook `useEmotionDetector`

Agar gambar yang dikirim memiliki representasi emosi terbaik, **jangan mengambil gambar sembarangan pada detik terakhir**. Kita harus menyimpan gambar dengan **nilai confidence tertinggi** untuk emosi dominan selama pengerjaan soal.

Buka berkas hook emosi:
📄 **[`src/services/hooks/useEmotionDetector.ts`](file:///home/glennhkm/Documents/Projects/Gutech/getsmart/getsmart-frontend/src/services/hooks/useEmotionDetector.ts)**

Perbarui hook untuk mencatat gambar terbaik berdasarkan tingkat confidence emosi di setiap sampel:

```typescript
import { captureVideoSnapshot } from "@/libs/emotion/snapshot"; // Import helper snapshot

// 1. Ubah return type hook useEmotionDetector
export interface UseEmotionDetectorResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  currentEmotion: EmotionSample | null;
  ready: boolean;
  hasSample: boolean;
  noFaceWarning: boolean;
  error: string | null;
  // Kembalikan objek berisi hasil emosi & base64 dari gambar dengan confidence tertinggi untuk modus terpilih
  flushAndReset: () => { result: EmotionResult | null; imageBase64?: string };
  flushOrUnknown: () => { result: EmotionResult; imageBase64?: string };
  start: () => Promise<void>;
  stop: () => void;
}

export function useEmotionDetector(
  options: UseEmotionDetectorOptions,
): UseEmotionDetectorResult {
  // ... state & ref existing ...

  // Tambahkan ref baru untuk menyimpan cache gambar terbaik per emosi
  const bestImagesRef = useRef<
    Record<string, { imageBase64: string; confidence: number }>
  >({});

  const start = useCallback(async () => {
    // ... setup getUserMedia & play() ...

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
    // ... sampler.start() & reset state ...
  }, [enabled, intervalMs]);

  // Perbarui fungsi flush untuk mengambil gambar terbaik dari modus emosi dominan
  const flushAndReset = useCallback(() => {
    const result = aggregatorRef.current.computeResult();
    let imageBase64 = result
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

  const flushOrUnknown = useCallback(() => {
    const result =
      aggregatorRef.current.computeResult() ??
      aggregatorRef.current.buildUnknownResult();

    // 1. Ambil gambar dari modus dominan
    let imageBase64 = bestImagesRef.current[result.mode]?.imageBase64;

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

  const stop = useCallback(() => {
    // ... stop handler existing ...
    bestImagesRef.current = {}; // Bersihkan cache gambar
  }, []);

  // ... rest of hook code ...
}
```

---

### Langkah 4: Integrasikan ke Komponen Halaman Remedial

Buka berkas halaman utama:
📄 **[`src/components/templates/pages/classroom/ClassDiagnosisContentPageTemplate.tsx`](file:///home/glennhkm/Documents/Projects/Gutech/getsmart/getsmart-frontend/src/components/templates/pages/classroom/ClassDiagnosisContentPageTemplate.tsx)**

Ganti logika pada **`handleCorrectRemedial`** agar menggunakan fungsi flush baru yang mengembalikan gambar modus dengan tingkat confidence tertinggi:

```typescript
const handleCorrectRemedial = () => {
  if (!remedialAttemptId || !currentVariant || !selectedRemedialOptionId)
    return;

  if (!emotion.hasSample) {
    if (!emotion.ready) {
      showToast.info("Sedang memuat model deteksi emosi, mohon tunggu...");
    } else {
      showToast.warning("Pastikan wajah kamu terlihat di kamera.");
    }
    return;
  }

  // 1. Panggil flushOrUnknown: otomatis mengembalikan data emosi & gambar dengan confidence tertinggi untuk modus tersebut
  const { result: emotionResult, imageBase64 } = emotion.flushOrUnknown();

  const emotionInput = toEmotionInput(emotionResult);
  const startedAt = new Date(emotionResult.startedAtMs).toISOString();
  const completedAt = new Date(emotionResult.endedAtMs).toISOString();

  console.log("[RemedialSnapshot] Dominant emotion:", emotionResult.mode);
  console.log(
    "[RemedialSnapshot] Best frame Base64 size (chars):",
    imageBase64?.length ?? 0,
  );

  // 2. Jalankan mutasi dengan menyertakan imageBase64
  submitRemedialVariantMutation.mutate(
    {
      remedialAttemptId,
      input: {
        variantId: currentVariant.variantId,
        selectedOptionId: selectedRemedialOptionId,
        startedAt,
        completedAt,
        emotion: emotionInput,
        imageBase64, // Kirim gambar terbaik modus emosi dominan
      },
    },
    {
      onSuccess: (data) => {
        // ... kode success handler ...
      },
      onError: (err: any) => {
        console.error("[RemedialTest] submitRemedialVariant ERROR:", err);
      },
    },
  );
};
```

---

## 4. Keuntungan Teknis & Praktik Terbaik yang Diterapkan

1. **Resolusi yang Terkontrol (Max 640px)**: Mencegah browser mengirimkan file JPEG mentah berukuran besar (> 2MB) yang dapat menyebabkan error `413 Payload Too Large` dari backend atau menghabiskan kuota upload internet siswa.
2. **Kompresi JPEG 50% (`0.5`)**: Memberikan keseimbangan sempurna antara kejelasan wajah untuk audit emosi dan ukuran file yang minimal (~30KB-70KB).
3. **Mekanisme _Fallback_ Aman**: Jika terjadi masalah pada kamera (misal stream macet tiba-tiba), fungsi `captureVideoSnapshot` akan mengembalikan `undefined`. Backend telah didesain secara defensif sehingga request submission tanpa gambar tetap berjalan sukses tanpa menggagalkan pengiriman nilai ujian remedial siswa.
4. **Alur Asinkronous di Backend**: Pengunggahan ke Google Drive diproses di latar belakang (_background worker_) oleh Go API. Frontend akan langsung menerima respons sukses `200 OK` segera setelah transaksi DB berhasil disimpan, tanpa ada jeda atau _lag_ antarmuka bagi siswa.
