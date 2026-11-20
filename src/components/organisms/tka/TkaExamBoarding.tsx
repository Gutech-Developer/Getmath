"use client";

import { useState } from "react";
import CheckCircleIcon from "@/components/atoms/icons/CheckCircleIcon";
import ClipboardIcon from "@/components/atoms/icons/ClipboardIcon";
import ClockIcon from "@/components/atoms/icons/ClockIcon";
import ShieldIcon from "@/components/atoms/icons/ShieldIcon";
import VideoIcon from "@/components/atoms/icons/VideoIcon";
import { AlertBanner } from "@/components/molecules/AlertBanner";
import CameraRequiredScreen from "@/components/molecules/classroom/CameraRequiredScreen";
import {
  CAMERA_REQUIREMENTS,
  DIAGNOSTIC_RULES,
} from "@/constant/classDiagnosis";
import { GsApiError } from "@/libs/api";
import { isEmotionSupported } from "@/libs/emotion";
import { showToast } from "@/libs/toast";
import { useStartOrResumeTka } from "@/services";
import type {
  CameraPermissionState,
  DiagnosticFlowStep,
} from "@/types/classDiagnosis";
import type { TKAStudentSessionResponse } from "@/types/tka";
import { enterFullscreen, exitFullscreen } from "@/utils/fullscreen";

type Step = Extract<DiagnosticFlowStep, "camera" | "briefing">;

const TKA_RULES = [
  "TKA hanya dapat dikerjakan satu kali.",
  "Gunakan laptop atau desktop, bukan ponsel/tablet.",
  "Kamera wajib aktif selama ujian untuk analisis emosi di browser.",
  "Video tidak direkam dan tidak dikirim ke server.",
  ...DIAGNOSTIC_RULES,
];

const HERO_STYLE = {
  backgroundImage:
    "linear-gradient(135deg, #1f2375 0%, #2e3a8c 58%, #0e7490 100%)",
};

function StepIndicator({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-3">
      {[1, 2].map((number) => {
        const active = (step === "camera" && number === 1) || (step === "briefing" && number === 2);
        const completed = step === "briefing" && number === 1;
        return (
          <div key={number} className="flex items-center gap-2">
            <span
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                active
                  ? "bg-white text-[#1f2375]"
                  : completed
                    ? "bg-emerald-400 text-white"
                    : "bg-white/20 text-white/80"
              }`}
            >
              {completed ? "✓" : number}
            </span>
            <span className="text-xs font-semibold text-white/80">
              {number === 1 ? "Akses & Kamera" : "Briefing"}
            </span>
            {number === 1 && <span className="h-px w-5 bg-white/25" />}
          </div>
        );
      })}
    </div>
  );
}

export default function TkaExamBoarding({
  testId,
  isMobile,
  onStarted,
}: {
  testId: string;
  isMobile: boolean;
  onStarted: (session: TKAStudentSessionResponse) => void;
}) {
  const [step, setStep] = useState<Step>("camera");
  const [accessCode, setAccessCode] = useState("");
  const [consent, setConsent] = useState(false);
  const [cameraState, setCameraState] = useState<CameraPermissionState>("idle");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  const startMutation = useStartOrResumeTka(testId);

  const handleCamera = async () => {
    setCameraError(null);
    if (!isEmotionSupported()) {
      setCameraState("denied");
      setCameraError(
        "Browser ini belum mendukung deteksi emosi. Gunakan Chrome/Edge/Firefox versi terbaru.",
      );
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("denied");
      setCameraError("Browser ini belum mendukung akses kamera.");
      return;
    }

    setCameraState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      stream.getTracks().forEach((track) => track.stop());
      setCameraState("granted");
      setStep("briefing");
    } catch {
      setCameraState("denied");
      setCameraError(
        "Akses kamera ditolak. Izinkan akses kamera agar TKA dapat dimulai.",
      );
    }
  };

  const handleStart = () => {
    setStartError(null);
    void enterFullscreen().catch(() => {});
    startMutation.mutate(
      {
        accessCode: accessCode.trim(),
        cameraConsent: true,
        deviceInfo: navigator.userAgent,
      },
      {
        onSuccess: (session) => {
          showToast.success("Sesi TKA siap");
          onStarted(session);
        },
        onError: (error) => {
          void exitFullscreen().catch(() => {});
          if (error instanceof GsApiError && error.status === 409) {
            window.location.href = `/student/tka/${testId}/result`;
            return;
          }
          if (
            error instanceof GsApiError &&
            error.status === 403 &&
            error.message.toLowerCase().includes("kode")
          ) {
            setStep("camera");
            setCameraError(error.message);
            setStartError(null);
            return;
          }
          setStartError(error.message);
        },
      },
    );
  };

  if (isMobile) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-lg items-center py-10">
        <div className="w-full rounded-3xl border border-[#E5E7EB] bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
            <ShieldIcon className="h-8 w-8 text-rose-600" />
          </div>
          <h1 className="mt-5 text-xl font-semibold text-[#111827]">
            TKA tidak tersedia di perangkat ini
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
            TKA hanya dapat dikerjakan melalui laptop atau komputer desktop.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center py-6">
      <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <aside
          className="relative overflow-hidden rounded-[32px] p-7 text-white shadow-[0_24px_60px_rgba(31,35,117,0.25)] sm:p-9"
          style={HERO_STYLE}
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">
              <ClipboardIcon className="h-3.5 w-3.5" />
              Tes Kompetensi Akademik
            </div>
            <h1 className="mt-5 text-3xl font-semibold leading-tight sm:text-4xl">
              Siap mengerjakan TKA?
            </h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/75">
              Siapkan kode akses, izinkan kamera untuk analisis emosi, lalu
              masuk ke mode fokus. Pastikan koneksi stabil dan perangkat
              terhubung ke daya.
            </p>

            <div className="mt-7">
              <StepIndicator step={step} />
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <VideoIcon className="h-5 w-5 text-cyan-200" />
                <p className="mt-2 text-sm font-semibold">Kamera & Emosi</p>
                <p className="mt-1 text-xs leading-5 text-white/65">
                  Analisis emosi berjalan di browser. Video tidak dikirim ke
                  server.
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <ClockIcon className="h-5 w-5 text-cyan-200" />
                <p className="mt-2 text-sm font-semibold">Waktu Fokus</p>
                <p className="mt-1 text-xs leading-5 text-white/65">
                  Timer berjalan dari deadline personal setelah sesi dimulai.
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-2 text-xs text-white/60">
              <ShieldIcon className="h-4 w-4" />
              Ujian akan masuk mode fullscreen otomatis.
            </div>
          </div>
        </aside>

        <div className="rounded-[32px] border border-[#E5E7EB] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-7">
          {step === "camera" ? (
            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-lottie-teal">
                  Step 1 dari 2
                </p>
                <h2 className="mt-1 text-xl font-semibold text-[#111827]">
                  Kode Akses & Izin Kamera
                </h2>
                <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                  Masukkan kode dari guru, lalu setujui penggunaan kamera.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#4B5563]">
                  Kode Akses <span className="text-rose-500">*</span>
                </label>
                <input
                  value={accessCode}
                  onChange={(event) =>
                    setAccessCode(event.target.value.toUpperCase())
                  }
                  maxLength={50}
                  placeholder="Contoh: TKA-ABCDEF"
                  className="w-full rounded-2xl border border-[#D1D5DB] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold uppercase tracking-wide text-[#111827] outline-none transition focus:border-lottie-teal focus:bg-white focus:ring-4 focus:ring-lottie-mint-glow/15"
                />
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-lottie-teal/10 bg-lottie-teal/[0.03] p-3.5 text-sm text-[#4B5563]">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-lottie-teal"
                />
                <span className="leading-6">
                  Saya menyetujui penggunaan kamera untuk analisis emosi di
                  browser. Video tidak direkam dan tidak dikirim ke server.
                </span>
              </label>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">
                  Sebelum mulai
                </p>
                {CAMERA_REQUIREMENTS.map((requirement) => (
                  <div
                    key={requirement}
                    className="flex items-start gap-2.5 rounded-xl bg-[#F8FAFC] px-3 py-2.5 text-sm text-[#4B5563]"
                  >
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{requirement}</span>
                  </div>
                ))}
              </div>

              {cameraState === "denied" && cameraError?.includes("ditolak") ? (
                <CameraRequiredScreen reason={cameraError} />
              ) : cameraError ? (
                <AlertBanner variant="error">{cameraError}</AlertBanner>
              ) : null}

              <button
                type="button"
                onClick={handleCamera}
                disabled={
                  !accessCode.trim() || !consent || cameraState === "requesting"
                }
                className="w-full rounded-2xl bg-lottie-teal px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/15 transition hover:bg-lottie-teal/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cameraState === "requesting"
                  ? "Meminta akses kamera..."
                  : "Buka Kamera & Lanjutkan"}
              </button>

              <a
                href="/student/dashboard/tka"
                className="block text-center text-sm font-medium text-[#6B7280] transition hover:text-lottie-teal"
              >
                Kembali ke daftar TKA
              </a>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-lottie-teal">
                  Step 2 dari 2
                </p>
                <h2 className="mt-1 text-xl font-semibold text-[#111827]">
                  Briefing Ujian
                </h2>
                <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                  Baca aturan berikut sebelum masuk ke mode fokus.
                </p>
              </div>

              <div className="space-y-2">
                {TKA_RULES.map((rule, index) => (
                  <div
                    key={rule}
                    className="flex items-start gap-3 rounded-xl border border-[#F1F5F9] bg-[#F8FAFC] px-3 py-2.5"
                  >
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-bold text-lottie-teal shadow-sm">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-6 text-[#4B5563]">{rule}</p>
                  </div>
                ))}
              </div>

              {startError && <AlertBanner variant="error">{startError}</AlertBanner>}

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5">
                <p className="text-sm font-semibold text-amber-800">
                  Mode fokus
                </p>
                <p className="mt-1 text-xs leading-5 text-amber-700">
                  Ujian akan masuk fullscreen. Jika keluar dari fullscreen,
                  pengerjaan dikunci sampai kamu kembali ke mode fokus.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setStep("camera");
                    setStartError(null);
                  }}
                  className="w-full rounded-2xl border border-[#E5E7EB] px-4 py-3 text-sm font-semibold text-[#6B7280] transition hover:bg-[#F8FAFC]"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={startMutation.isPending}
                  className="w-full rounded-2xl bg-lottie-teal px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/15 transition hover:bg-lottie-teal/90 disabled:opacity-60"
                >
                  {startMutation.isPending ? "Memulai..." : "Mulai Ujian"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
