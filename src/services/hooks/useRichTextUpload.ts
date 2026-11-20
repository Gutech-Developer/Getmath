"use client";

import { showToast } from "@/libs/toast";
import { useGsDeleteFile, useGsUploadFile } from "./useGsUpload";

export function useRichTextUpload() {
  const uploadMutation = useGsUploadFile();
  const deleteMutation = useGsDeleteFile();

  const onImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadMutation.mutateAsync(formData);
    showToast.success("Gambar berhasil diunggah");
    return result.url;
  };

  const deleteImage = async (url: string) => {
    try {
      await deleteMutation.mutateAsync(url);
    } catch {}
  };

  return {
    onImageUpload,
    onImageDelete: deleteImage,
    deleteImage,
    isUploadingImage: uploadMutation.isPending,
  };
}
