/**
 * Helper untuk mengkonversi URL materi ke URL yang aman ditampilkan dalam <iframe>.
 *
 * - Video : YouTube → /embed/<id>
 * - PDF   : Heyzine flip-book / Google Drive /preview / Google Docs viewer
 * - E-LKPD: Liveworksheets → /embed/<slug> (URL share rewriten otomatis)
 */

export type EmbedType = "pdf" | "video" | "elkpd";

/**
 * Konversi berbagai format URL YouTube ke format embed.
 * Dukungan: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID,
 * youtube.com/embed/ID, m.youtube.com/*. Timestamp ?t=NNs / &start= dipertahankan.
 */
export function toYouTubeEmbed(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "").replace(/^m\./, "");

    let videoId: string | null = null;

    if (host === "youtu.be") {
      videoId = u.pathname.split("/").filter(Boolean)[0] ?? null;
    } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (u.pathname === "/watch") {
        videoId = u.searchParams.get("v");
      } else if (u.pathname.startsWith("/shorts/")) {
        videoId = u.pathname.split("/")[2] ?? null;
      } else if (u.pathname.startsWith("/embed/")) {
        videoId = u.pathname.split("/")[2] ?? null;
      } else if (u.pathname.startsWith("/live/")) {
        videoId = u.pathname.split("/")[2] ?? null;
      }
    }

    if (!videoId) return url;

    const params = new URLSearchParams();
    const t = u.searchParams.get("t") ?? u.searchParams.get("start");
    if (t) {
      const seconds = parseInt(t.replace(/[^0-9]/g, ""), 10);
      if (!Number.isNaN(seconds) && seconds > 0) {
        params.set("start", String(seconds));
      }
    }
    params.set("enablejsapi", "1");
    if (typeof window !== "undefined" && window.location.origin) {
      params.set("origin", window.location.origin);
    }
    const qs = params.toString();
    return `https://www.youtube.com/embed/${videoId}${qs ? `?${qs}` : ""}`;
  } catch {
    return url;
  }
}

/**
 * Konversi link PDF / Heyzine ke URL yang bisa diembed.
 * - heyzine.com/flip-book/<slug>(.html) / subdomain heyzine → langsung pakai.
 * - drive.google.com/file/d/<id>/* atau ?id=<id> → ubah ke /preview.
 * - URL berakhiran .pdf → fallback ke Google Docs viewer.
 */
export function toPdfEmbed(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "heyzine.com" || host.endsWith(".heyzine.com")) {
      return url;
    }

    if (host === "drive.google.com") {
      const fileMatch = u.pathname.match(/\/file\/d\/([^/]+)/);
      if (fileMatch) {
        return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
      }
      const idParam = u.searchParams.get("id");
      if (idParam) {
        return `https://drive.google.com/file/d/${idParam}/preview`;
      }
    }

    if (u.pathname.toLowerCase().endsWith(".pdf")) {
      return `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(url)}`;
    }
  } catch {
    // bukan URL valid
  }
  return url;
}

/**
 * Konversi link E-LKPD Liveworksheets agar memakai endpoint `/embed/...`
 * (URL share dengan X-Frame-Options=SAMEORIGIN tidak dapat di-iframe;
 * endpoint /embed/ memang dirancang embeddable).
 *
 * Pola yang ditangani:
 *   - liveworksheets.com/embed/...                → tidak diubah
 *   - liveworksheets.com/<slug>(.html)            → liveworksheets.com/embed/<slug>(.html)
 *   - liveworksheets.com/w/<lang>/<topic>/<id>    → liveworksheets.com/embed/<id>
 *   - host non-liveworksheets                     → tidak diubah
 */
export function toLiveworksheetsEmbed(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    const isLiveworksheets =
      host === "liveworksheets.com" || host.endsWith(".liveworksheets.com");

    if (!isLiveworksheets) return url;

    if (u.pathname.startsWith("/embed/") || u.pathname.includes("/embed/")) {
      return url;
    }

    const segments = u.pathname.split("/").filter(Boolean);
    if (segments.length === 0) return url;

    let embedSlug: string;
    if (segments[0] === "w" && segments.length >= 2) {
      embedSlug = segments[segments.length - 1];
    } else {
      embedSlug = segments[0];
    }

    u.pathname = `/embed/${embedSlug}`;
    return u.toString();
  } catch {
    return url;
  }
}

/** Pilih konverter embed sesuai jenis materi. */
export function toEmbedUrl(url: string, type: EmbedType): string {
  switch (type) {
    case "video":
      return toYouTubeEmbed(url);
    case "pdf":
      return toPdfEmbed(url);
    case "elkpd":
      return toLiveworksheetsEmbed(url);
    default:
      return url;
  }
}
