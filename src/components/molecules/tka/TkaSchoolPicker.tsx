"use client";

import { useMemo, useState } from "react";
import SearchableInput from "@/components/atoms/SearchableInput";
import { useSchoolSearch } from "@/services/hooks/useSchool";

interface TkaSchoolPickerProps {
  valueLabel: string;
  onChange: (schoolId: string, schoolLabel: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function TkaSchoolPicker({
  valueLabel,
  onChange,
  label = "Sekolah",
  placeholder = "Cari sekolah...",
  required = false,
  disabled = false,
}: TkaSchoolPickerProps) {
  const [query, setQuery] = useState(valueLabel);
  const { schools, isLoading } = useSchoolSearch({ searchTerm: query });

  const options = useMemo(
    () =>
      schools.map((school) => ({
        value: school.id,
        label: school.name,
      })),
    [schools],
  );

  return (
    <SearchableInput
      label={label}
      required={required}
      disabled={disabled}
      value={valueLabel}
      onChange={(labelValue, option) => {
        setQuery(labelValue);
        onChange(option?.value ?? "", labelValue);
      }}
      options={options}
      isLoading={isLoading}
      placeholder={placeholder}
    />
  );
}
