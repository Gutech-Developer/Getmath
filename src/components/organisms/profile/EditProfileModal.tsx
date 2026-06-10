"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/molecules/Modal";
import { ContentInput } from "@/components/atoms/Input";
import { SubmitButton } from "@/components/atoms/buttons/SubmitButton";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFullName: string;
  initialPhoneNumber: string;
  onSave: (data: { fullName: string; phoneNumber: string }) => Promise<void>;
  isPending: boolean;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  initialFullName,
  initialPhoneNumber,
  onSave,
  isPending,
}: EditProfileModalProps) {
  const [fullName, setFullName] = useState(initialFullName);
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [error, setError] = useState<string | null>(null);

  // Sync state with initial values when modal opens
  useEffect(() => {
    if (isOpen) {
      setFullName(initialFullName);
      setPhoneNumber(initialPhoneNumber);
      setError(null);
    }
  }, [isOpen, initialFullName, initialPhoneNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("Nama lengkap tidak boleh kosong.");
      return;
    }
    if (!phoneNumber.trim()) {
      setError("Nomor HP/WhatsApp tidak boleh kosong.");
      return;
    }

    try {
      await onSave({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui profil.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profil" size="sm">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#1E293B]">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <ContentInput
            placeholder="Masukkan nama lengkap Anda"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#1E293B]">
            Nomor HP/WhatsApp <span className="text-red-500">*</span>
          </label>
          <ContentInput
            placeholder="Contoh: 081234567890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-xs font-medium text-red-500 bg-red-50 border border-red-100 rounded-lg p-3">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <SubmitButton
            text={isPending ? "Menyimpan..." : "Simpan Perubahan"}
            disabled={isPending}
            className="px-5 py-2.5"
          />
        </div>
      </form>
    </Modal>
  );
}
