import RegisterParent from "@/components/organisms/register/RegisterParent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register as Parent | Gajah Puteh Art Therapy",
  description: "Register as a parent on Gajah Puteh Art Therapy platform",
};

export default function RegisterParentPage() {
  return <RegisterParent />;
}
