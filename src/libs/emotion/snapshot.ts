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
