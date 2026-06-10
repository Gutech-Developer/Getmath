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
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-lottie-teal hover:opacity-85 transition duration-200"
        >
          <span aria-hidden="true">&larr;</span>
          Kembali ke Beranda
        </Link>

        <div className="mt-4 getmath-card p-5 sm:p-6 lg:p-7 pt-1 lg:pt-1.5">
          <div className="mb-5 text-center">
            <div className="flex justify-center mb-1.5">
              <Image
                src="/img/logo/logo.png"
                alt="GetMath"
                width={80}
                height={80}
                className="w-topbar-height h-topbar-height object-contain"
              />
            </div>
            <h2 className="text-3xl font-extrabold text-lottie-teal leading-tight mb-1.5">
              Selamat Datang!
            </h2>
            <p className="text-[13px] text-lottie-zinc-500">Masuk ke akun GetMath kamu</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginOrganism;
