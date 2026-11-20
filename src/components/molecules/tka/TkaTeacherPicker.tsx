"use client";

import { useMemo, useState } from "react";
import SearchableInput from "@/components/atoms/SearchableInput";
import { useDebouncedValue, useSearchUser } from "@/services";

interface TkaTeacherPickerProps {
  schoolId: string;
  valueLabel: string;
  onChange: (teacherId: string, teacherLabel: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export default function TkaTeacherPicker({
  schoolId,
  valueLabel,
  onChange,
  label = "Guru",
  placeholder = "Cari guru...",
  disabled = false,
}: TkaTeacherPickerProps) {
  const [query, setQuery] = useState(valueLabel);
  const debouncedQuery = useDebouncedValue(query);
  const { data, isPending } = useSearchUser(
    {
      role: "teacher",
      limit: 50,
      search: debouncedQuery || undefined,
      schoolId: schoolId || undefined,
    },
    { enabled: Boolean(schoolId) },
  );

  const options = useMemo(
    () =>
      (data?.users ?? []).map((user) => ({
        value: user.profileId,
        label: user.fullName,
      })),
    [data],
  );

  return (
    <SearchableInput
      label={label}
      value={valueLabel}
      onChange={(labelValue, option) => {
        setQuery(labelValue);
        onChange(option?.value ?? "", labelValue);
      }}
      options={options}
      isLoading={isPending}
      placeholder={schoolId ? placeholder : "Pilih sekolah terlebih dahulu"}
      disabled={disabled || !schoolId}
    />
  );
}
