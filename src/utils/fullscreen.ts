type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void>;
};

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void>;
};

export function isFullscreenSupported(): boolean {
  if (typeof document === "undefined") return false;
  const element = document.documentElement as FullscreenElement;
  return Boolean(element.requestFullscreen || element.webkitRequestFullscreen);
}

export function isFullscreenActive(): boolean {
  if (typeof document === "undefined") return false;
  const doc = document as FullscreenDocument;
  return Boolean(doc.fullscreenElement || doc.webkitFullscreenElement);
}

export async function enterFullscreen(): Promise<void> {
  if (typeof document === "undefined") return;
  if (isFullscreenActive()) return;
  const element = document.documentElement as FullscreenElement;
  if (element.requestFullscreen) {
    await element.requestFullscreen();
    return;
  }
  await element.webkitRequestFullscreen?.();
}

export async function exitFullscreen(): Promise<void> {
  if (typeof document === "undefined" || !isFullscreenActive()) return;
  const doc = document as FullscreenDocument;
  if (doc.exitFullscreen) {
    await doc.exitFullscreen();
    return;
  }
  await doc.webkitExitFullscreen?.();
}
