"use client";

import { useGsCurrentUser, useGsLogout } from "@/services";
import StudentProfileContent from "@/components/organisms/profile/StudentProfileContent";
import { showToast } from "@/libs/toast";
import { useState } from "react";

export default function StudentDashboardProfilPage() {
  const { data: user, isLoading } = useGsCurrentUser();
  const logoutMutation = useGsLogout();
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);

  const handleChangePhoto = () => {
    showToast.info("Fitur ubah foto akan segera tersedia");
    setIsPhotoLoading(false);
  };

  const handleEditProfile = () => {
    showToast.info("Fitur edit profil akan segera tersedia");
  };

  const handleChangePassword = () => {
    showToast.info("Fitur ubah password akan segera tersedia");
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onError: (err) => {
        showToast.error(err.message ?? "Gagal logout");
      },
    });
  };

  const profile = (user?.profile as Record<string, any>) || {};

  return (
    <StudentProfileContent
      isLoading={isLoading}
      fullName={profile.fullName || user?.fullName || "-"}
      email={user?.email || "-"}
      phone={profile.phoneNumber || user?.phoneNumber || "-"}
      nis={profile.NIS || "-"}
      province={profile.province || "-"}
      city={profile.city || "-"}
      school={profile.schoolName || "-"}
      avatarInitial={(profile.fullName || user?.fullName || "?")
        .charAt(0)
        .toUpperCase()}
      onChangePhoto={handleChangePhoto}
      onEditProfile={handleEditProfile}
      onChangePassword={handleChangePassword}
      onLogout={handleLogout}
      isLogoutLoading={logoutMutation.isPending}
    />
  );
}
