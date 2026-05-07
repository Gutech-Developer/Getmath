"use client";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { BodySmallMedium } from "@/components/atoms/Typography";
import { SubmitButton } from "@/components/atoms/buttons/SubmitButton";
import EmailInput from "@/components/atoms/inputs/EmailInput";
import PasswordInput from "@/components/atoms/inputs/PasswordInput";
import { useGsLogin, useGsGoogleLogin } from "@/services";
import { toast } from "sonner";
import NotebookIcon from "@/components/atoms/icons/NotebookIcon";
import DashboardIcon from "@/components/atoms/icons/DashboardIcon";
import ThreeUserGroupIcon from "@/components/atoms/icons/ThreeUserGroupIcon";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";

const registerOptions: Array<{
  role: "teacher" | "student" | "parent";
  label: string;
  href: string;
  className: string;
  icon: React.ReactNode;
}> = [
  {
    role: "student",
    label: "Buat Akun Siswa",
    href: "/register/student",
    className:
      "border-[#1a237e]/10 text-[#1a237e] hover:border-[#1a237e]/25 hover:bg-[#1a237e]/5",
    icon: <NotebookIcon className="w-3.5 h-3.5" variant="outline" />,
  },
  {
    role: "teacher",
    label: "Buat Akun Guru",
    href: "/register/teacher",
    className:
      "border-[#7c3aed]/20 text-[#7c3aed] hover:border-[#7c3aed]/35 hover:bg-[#7c3aed]/5",
    icon: <DashboardIcon className="w-3.5 h-3.5" variant="outline" />,
  },
  {
    role: "parent",
    label: "Buat Akun Orang Tua",
    href: "/register/parent",
    className:
      "border-[#047857]/20 text-[#047857] hover:border-[#047857]/35 hover:bg-[#047857]/5",
    icon: <ThreeUserGroupIcon className="w-3.5 h-3.5" variant="outline" />,
  },
];

const LoginFormContent: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const login = useGsLogin();
  const googleLogin = useGsGoogleLogin();

  const isLoading = login.isPending || googleLogin.isPending || isGoogleLoading;
  const error = login.error || googleLogin.error;

  const handleGoogleLoginSuccess = async (codeResponse: any) => {
    try {
      setIsGoogleLoading(true);
      await googleLogin.mutateAsync({
        googleToken: codeResponse.code,
        redirectUri: "postmessage",
      });
      toast.success("Login dengan Google berhasil. Selamat datang kembali.");
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : "Login Google gagal. Silakan coba lagi.";
      toast.error(msg);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const startGoogleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: handleGoogleLoginSuccess,
    onError: () => {
      toast.error("Gagal terhubung dengan Google. Silakan coba lagi.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email dan password wajib diisi.");
      return;
    }

    try {
      await login.mutateAsync({ email, password });
      toast.success("Login berhasil. Selamat datang kembali.");
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : "Login gagal. Silakan coba lagi.";
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <button
        type="button"
        onClick={() => startGoogleLogin()}
        disabled={isLoading}
        className="w-full rounded-[12px] border border-gray-300 bg-white py-2.5 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          className="w-5 h-5"
        >
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
        </svg>
        {isGoogleLoading ? "Mengarahkan ke Google..." : "Masuk dengan Google"}
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[#1a237e]/10" />
        <span className="text-[12px] text-[#9ca3af]">atau dengan email</span>
        <div className="h-px flex-1 bg-[#1a237e]/10" />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="block">
          <BodySmallMedium className="text-[#4b5563]">Email</BodySmallMedium>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8m-1 10H4a1 1 0 01-1-1V7a1 1 0 011-1h16a1 1 0 011 1v10a1 1 0 01-1 1z"
              />
            </svg>
          </span>
          <EmailInput
            id="email"
            name="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-[12px] bg-[#1a237e]/5 px-3.5 py-2.5 pl-8 text-[13px] outline-[#1a237e]/10 focus:outline-[#00acc1]"
            placeholder="nama@email.com"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block">
            <BodySmallMedium className="text-[#4b5563]">
              Password
            </BodySmallMedium>
          </label>
          <div className="text-sm">
            <Link href="/forgot-password">
              <BodySmallMedium className="text-[#00acc1] hover:text-[#1a237e] transition-colors">
                Lupa password?
              </BodySmallMedium>
            </Link>
          </div>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] z-10">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 11c-1.657 0-3 1.343-3 3v4h6v-4c0-1.657-1.343-3-3-3z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 11V8a5 5 0 0110 0v3"
              />
            </svg>
          </span>
          <PasswordInput
            id="password"
            name="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-[12px] bg-[#1a237e]/5 py-2.5 pl-8 pr-8 text-[13px] outline-[#1a237e]/10 focus:outline-[#00acc1]"
            placeholder="Masukkan password"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-error/10 p-3">
          <p className="text-sm text-error">{error.message}</p>
        </div>
      )}

      <div className="pt-1">
        <SubmitButton
          variant="outline"
          text={isLoading ? "Sedang masuk..." : "Masuk"}
          className="w-full flex justify-center items-center border-0 text-white bg-[linear-gradient(173deg,#1a237e_0%,#00acc1_100%)] hover:text-white rounded-[12px] shadow-[0px_10px_20px_rgba(26,35,126,0.2)]"
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center gap-3 pt-1">
        <div className="h-px flex-1 bg-[#1a237e]/10" />
        <span className="text-[12px] text-[#9ca3af]">Belum punya akun?</span>
        <div className="h-px flex-1 bg-[#1a237e]/10" />
      </div>

      <div className="space-y-2.5">
        {registerOptions.map((item) => (
          <Link
            key={item.role}
            href={item.href}
            className={`flex items-center gap-2 rounded-[12px] border bg-white px-3 py-2.5 text-sm font-semibold transition-colors ${item.className}`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </form>
  );
};

const LoginForm: React.FC = () => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <LoginFormContent />
    </GoogleOAuthProvider>
  );
};

export default LoginForm;
