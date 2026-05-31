"use client";

interface CameraRequiredScreenProps {
  reason?: string;
}

export default function CameraRequiredScreen({
  reason,
}: CameraRequiredScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
        <div className="mb-4 flex justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7 text-red-600"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10l4.553-2.069A1 1 0 0121 8.81V15.19a1 1 0 01-1.447.894L15 14M3 8h12a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V9a1 1 0 011-1z"
              />
              <line x1="2" y1="2" x2="22" y2="22" strokeLinecap="round" />
            </svg>
          </span>
        </div>
        <h2 className="text-lg font-semibold text-[#0F172A]">
          Kamera Diperlukan
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#475569]">
          Sesi ini mengharuskan kamera aktif sesuai kebijakan sekolah. Aktifkan
          izin kamera browser kamu lalu reload halaman.
        </p>
        {reason && (
          <p className="mt-2 text-xs text-[#94A3B8]">Detail: {reason}</p>
        )}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 w-full rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8]"
        >
          Reload Halaman
        </button>
      </div>
    </div>
  );
}
