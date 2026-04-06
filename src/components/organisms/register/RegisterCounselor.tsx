"use client";

import { useState } from "react";
import Link from "next/link";
import RegisterParentForm from "@/components/molecules/register/RegisterParentForm";
import RegisterCounselorForm from "@/components/molecules/register/RegisterCounselorForm";

const RegisterCounselor: React.FC = () => {
  const [registerType, setRegisterType] = useState<"parent" | "counselor">(
    "counselor"
  );

  return (
    <div className="min-h-svh lg:h-screen lg:overflow-hidden w-full">
      {/* Mobile/Tablet: Page scrolls, Desktop: Fit to screen */}
      <div className="min-h-screen lg:h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-6xl lg:max-w-7xl xl:max-w-[1400px]">
          <div className="bg-white w-full rounded-2xl shadow-lg border border-grey-stroke/50">
            {/* Header with Toggle */}
            <div className="p-4 sm:p-5 lg:p-6 border-b border-grey-stroke">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-medium text-charcoal-green-dark mb-1">
                    Buat Akun Mu
                  </h2>
                  <p className="text-xs sm:text-sm text-grey">
                    Isi detail Anda untuk memulai.
                  </p>
                </div>

                {/* Role Toggle */}
                <div className="flex gap-2 p-1 bg-grey-stroke/20 rounded-lg w-fit">
                  <button
                    onClick={() => setRegisterType("parent")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      registerType === "parent"
                        ? "bg-charcoal-green text-white-mineral shadow-sm"
                        : "text-grey hover:text-charcoal-green"
                    }`}
                  >
                    Orangtua
                  </button>
                  <button
                    onClick={() => setRegisterType("counselor")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      registerType === "counselor"
                        ? "bg-charcoal-green text-white-mineral shadow-sm"
                        : "text-grey hover:text-charcoal-green"
                    }`}
                  >
                    Konselor
                  </button>
                </div>
              </div>
            </div>

            {/* Form Content - No scroll in container */}
            <div className="p-4 sm:p-5 lg:p-6">
              {registerType === "parent" ? (
                <RegisterParentForm />
              ) : (
                <RegisterCounselorForm />
              )}

              {/* Login Link */}
              <div className="mt-4 pt-4 border-t border-grey-stroke text-center">
                <p className="text-xs sm:text-sm text-grey">
                  Sudah punya akun?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-charcoal-green hover:text-moss-stone transition-colors"
                  >
                    Masuk
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterCounselor;
