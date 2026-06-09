"use client";

import { useGsCurrentUser, useGsLogout, useEditCurrentUser } from "@/services";
import AdminProfileContent from "@/components/organisms/profile/AdminProfileContent";
import EditProfileModal from "@/components/organisms/profile/EditProfileModal";
import { showToast } from "@/libs/toast";
import { useState } from "react";

export default function AdminDashboardProfilPage() {
  const { data: user, isLoading } = useGsCurrentUser();
  const logoutMutation = useGsLogout();
  const editProfileMutation = useEditCurrentUser();
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleChangePhoto = () => {
    showToast.info("Fitur ubah foto akan segera tersedia");
    setIsPhotoLoading(false);
  };

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (data: { fullName: string; phoneNumber: string }) => {
    try {
      await editProfileMutation.mutateAsync(data);
      showToast.success("Profil berhasil diperbarui!");
    } catch (err: any) {
      showToast.error(err.message || "Gagal memperbarui profil.");
      throw err;
    }
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
    <>
      <AdminProfileContent
        isLoading={isLoading}
        fullName={profile.fullName || user?.fullName || "-"}
        email={user?.email || "-"}
        phone={profile.phoneNumber || user?.phoneNumber || "-"}
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
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialFullName={profile.fullName || user?.fullName || ""}
        initialPhoneNumber={profile.phoneNumber || user?.phoneNumber || ""}
        onSave={handleSaveProfile}
        isPending={editProfileMutation.isPending}
      />
    </>
  );
}
