"use client";
import Link from "next/link";
import { useState } from "react";
import { BodySmallMedium } from "@/components/atoms/Typography";
import { SubmitButton } from "@/components/atoms/buttons/SubmitButton";
import EmailInput from "@/components/atoms/inputs/EmailInput";
import PasswordInput from "@/components/atoms/inputs/PasswordInput";
import { useLoginCounselor, useLoginParent } from "@/services";
import { toast } from "react-toastify";

type UserRole = "counselor" | "parent";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<UserRole>("counselor");

  const loginCounselor = useLoginCounselor();
  const loginParent = useLoginParent();

  const isLoading = loginCounselor.isPending || loginParent.isPending;
  const error = loginCounselor.error || loginParent.error;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (role === "counselor") {
        await loginCounselor.mutateAsync({ email, password });
        toast.success("Login successful! Welcome back.");
      } else {
        await loginParent.mutateAsync({ email, password });
        toast.success("Login successful! Welcome back.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Login failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      {/* Role Selection */}
      <div>
        <label className="block mb-2">
          <BodySmallMedium>Masuk sebagai</BodySmallMedium>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("counselor")}
            className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              role === "counselor"
                ? "bg-charcoal-green text-white-mineral"
                : "bg-white/5 text-charcoal-green-dark border border-grey-stroke hover:bg-grey-light"
            }`}
          >
            Konselor
          </button>
          <button
            type="button"
            onClick={() => setRole("parent")}
            className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              role === "parent"
                ? "bg-charcoal-green text-white-mineral"
                : "bg-white/5 text-charcoal-green-dark border border-grey-stroke hover:bg-grey-light"
            }`}
          >
            Orangtua
          </button>
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block">
          <BodySmallMedium>Email</BodySmallMedium>
        </label>
        <div className="mt-2">
          <EmailInput
            id="email"
            name="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block">
            <BodySmallMedium>Password</BodySmallMedium>
          </label>
          <div className="text-sm">
            <Link href="/forgot-password">
              <BodySmallMedium className="text-moss-stone hover:text-charcoal-green transition-colors">
                Lupa password?
              </BodySmallMedium>
            </Link>
          </div>
        </div>
        <div className="mt-2">
          <PasswordInput
            id="password"
            name="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-error/10 p-3">
          <p className="text-sm text-error">{error.message}</p>
        </div>
      )}

      {/* Submit Button */}
      <div>
        <SubmitButton
          variant="primary"
          text={isLoading ? "Sedang masuk..." : "Masuk"}
          className="w-full flex justify-center items-center"
          disabled={isLoading}
        />
      </div>

      {/* Register Link */}
      <div className="text-center">
        <BodySmallMedium className="text-grey">
          Belum punya akun?{" "}
          <Link
            href={`/register/${role}`}
            className="text-moss-stone hover:text-charcoal-green transition-colors font-medium"
          >
            Daftar
          </Link>
        </BodySmallMedium>
      </div>
    </form>
  );
};

export default LoginForm;
