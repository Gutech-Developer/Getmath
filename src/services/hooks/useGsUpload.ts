"use client";

import { useMutation } from "@tanstack/react-query";
import { gsUploadFile, gsDeleteFile } from "@/libs/api/gsAction";

export function useGsUploadFile() {
  return useMutation<{ url: string }, Error, FormData>({
    mutationFn: (formData) => gsUploadFile(formData),
  });
}

export function useGsDeleteFile() {
  return useMutation<void, Error, string>({
    mutationFn: (url) => gsDeleteFile(url),
  });
}
