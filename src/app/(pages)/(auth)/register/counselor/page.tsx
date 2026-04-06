import RegisterCounselor from "@/components/organisms/register/RegisterCounselor";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register as Counselor | Gajah Puteh Art Therapy",
  description: "Register as a counselor on Gajah Puteh Art Therapy platform",
};

export default function RegisterCounselorPage() {
  return <RegisterCounselor />;
}
