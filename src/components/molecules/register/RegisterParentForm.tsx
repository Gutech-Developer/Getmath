"use client";

import { useState } from "react";
import { useRegisterParent } from "@/services";
import { IParentRegisterInput } from "@/types/auth";
import { BodySmallMedium } from "@/components/atoms/Typography";
import EmailInput from "@/components/atoms/inputs/EmailInput";
import PasswordInput from "@/components/atoms/inputs/PasswordInput";
import { ContentInput } from "@/components/atoms/Input";
import { SubmitButton } from "@/components/atoms/buttons/SubmitButton";
import { toast } from "react-toastify";

const RegisterParentForm: React.FC = () => {
  const [formData, setFormData] = useState<IParentRegisterInput>({
    email: "",
    fullname: "",
    address: "",
    phone: "",
    work: "",
    age: 0,
    password: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");

  const { mutate: register, isPending, error } = useRegisterParent();

  const handleChange = (field: string, value: string | number) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      await register(formData);
      toast.success("Registration successful! Redirecting...");
    } catch (err: any) {
      toast.error(err?.message || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-3">
        <div>
          <label className="block mb-1">
            <BodySmallMedium className="text-sm">
              Nama Lengkap *
            </BodySmallMedium>
          </label>
          <ContentInput
            placeholder="Jane Doe"
            value={formData.fullname}
            onChange={(e) => handleChange("fullname", e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1">
            <BodySmallMedium className="text-sm">Email *</BodySmallMedium>
          </label>
          <EmailInput
            placeholder="jane@example.com"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1">
            <BodySmallMedium className="text-sm">Nomor HP *</BodySmallMedium>
          </label>
          <ContentInput
            type="tel"
            placeholder="08123456789"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1">
            <BodySmallMedium className="text-sm">Alamat *</BodySmallMedium>
          </label>
          <ContentInput
            placeholder="Street address, City"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1">
            <BodySmallMedium className="text-sm">Umur *</BodySmallMedium>
          </label>
          <ContentInput
            type="number"
            placeholder="25"
            value={formData.age.toString()}
            onChange={(e) => handleChange("age", parseInt(e.target.value) || 0)}
          />
        </div>

        <div>
          <label className="block mb-1">
            <BodySmallMedium className="text-sm">Pekerjaan *</BodySmallMedium>
          </label>
          <ContentInput
            placeholder="e.g., Teacher"
            value={formData.work}
            onChange={(e) => handleChange("work", e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1">
            <BodySmallMedium className="text-sm">Password *</BodySmallMedium>
          </label>
          <PasswordInput
            placeholder="Min 8 characters"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1">
            <BodySmallMedium className="text-sm">
              Konfirmasi Password *
            </BodySmallMedium>
          </label>
          <PasswordInput
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-error/10 p-3 mt-4">
          <p className="text-sm text-error">{error.message}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="mt-4 w-full flex justify-center">
        <SubmitButton
          variant="primary"
          text={isPending ? "Creating account..." : "Create Account"}
          className="w-full sm:w-auto sm:px-12 flex justify-center items-center"
          disabled={isPending}
        />
      </div>
    </form>
  );
};

export default RegisterParentForm;
