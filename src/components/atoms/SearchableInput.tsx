/**
 * SearchableInput - Searchable input with dropdown suggestions
 * Reusable component untuk input dengan suggestions
 */

import React, { useRef, useState, useEffect } from "react";

export interface SearchableOption {
  value: string;
  label: string;
  metadata?: any;
}

interface SearchableInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string, selected?: SearchableOption) => void;
  options: SearchableOption[];
  isLoading?: boolean;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  emptyMessage?: string;
  className?: string;
}

export default function SearchableInput({
  placeholder = "Cari atau pilih...",
  value,
  onChange,
  options,
  isLoading = false,
  disabled = false,
  label,
  required = false,
  emptyMessage = "Tidak ada hasil",
  className = "",
}: SearchableInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<SearchableOption[]>(
    options
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const filtered = options.filter((option) =>
      option.label.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [value, options]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleSelect = (option: SearchableOption) => {
    onChange(option.label, option);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-[#4b5563] mb-1.5">
          {label}
          {required && <span className="text-[#dc2626]">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-[14px] border border-[#1a237e]/10 bg-[#1a237e]/5 px-4 py-2.5 text-[13px] text-[#1f2937] placeholder:text-[#1f2937]/50 outline-none transition focus:ring-2 focus:ring-[#00acc1]/30 disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {isLoading && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#1a237e]/20 border-t-[#00acc1]" />
          </div>
        )}
      </div>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-[12px] border border-[#1a237e]/10 bg-white shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="p-3 text-center text-xs text-[#6b7280]">
              Memuat...
            </div>
          ) : filteredOptions.length > 0 ? (
            <div className="max-h-[240px] overflow-y-auto">
              {filteredOptions.map((option, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className="w-full px-4 py-2.5 text-left text-[13px] text-[#1f2937] hover:bg-[#1a237e]/8 transition focus:outline-none focus:bg-[#1a237e]/8 border-b border-[#1a237e]/5 last:border-b-0"
                >
                  <div className="font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3 text-center text-xs text-[#6b7280]">
              {emptyMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
