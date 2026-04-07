"use client";
import LoginForm from "@/components/molecules/login/LoginForm";
import Image from "next/image";
import Link from "next/link";

const LoginOrganism: React.FC = () => {
  return (
    <div className="w-full flex items-center justify-center p-4 sm:p-5">
      <div className="w-full max-w-[448px]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[13px] text-[#6b7280] hover:text-[#4b5563]"
        >
          <span aria-hidden="true">&lt;</span>
          Kembali ke Beranda
        </Link>

        <div className="mt-4 bg-white/95 rounded-[24px] shadow-[0px_20px_60px_0px_rgba(26,35,126,0.12)] border border-[#1a237e]/10 p-5 sm:p-6 lg:p-7">
          <div className="mb-5 text-center">
            <div className="flex justify-center mb-2.5">
              <Image
                src="/img/logo/logo.png"
                alt="GetMath"
                width={52}
                height={52}
                className="w-[52px] h-[52px] object-contain"
              />
            </div>
            <h2 className="text-2xl lg:text-[34px] font-extrabold text-[#1a237e] leading-tight mb-1.5">
              Selamat Datang!
            </h2>
            <p className="text-[13px] text-grey">Masuk ke akun GetMath kamu</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginOrganism;
