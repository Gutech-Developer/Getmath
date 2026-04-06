"use client";

import { useState, useEffect, useRef } from "react";
import { useTherapies, useChild } from "@/services";
import { ITherapy } from "@/types/therapy";

interface TherapySearchDropdownProps {
  selectedTherapyId: string;
  onSelectTherapy: (therapyId: string) => void;
  disabled?: boolean;
}

// Custom Dropdown Item Component
function DropdownItem({
  therapy,
  child,
  isSelected,
  onClick,
}: {
  therapy: ITherapy;
  child: any;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`px-4 py-3 cursor-pointer hover:bg-grey-stroke/5 transition-colors border-b border-grey-stroke/30 last:border-b-0 ${
        isSelected ? "bg-moss-stone/5" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-moss-stone/20 rounded-full flex items-center justify-center shrink-0">
          <svg
            className="w-5 h-5 text-moss-stone"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-sm font-medium text-neutral-02 truncate">
              Therapy Session #{therapy._id.slice(-6).toUpperCase()}
            </p>
          </div>
          <p className="text-xs text-grey truncate">
            Child: {child?.fullname || `Child #${child?.childOrder || "N/A"}`} •{" "}
            {new Date(therapy.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        {isSelected && (
          <svg
            className="w-5 h-5 text-moss-stone shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
    </div>
  );
}

// Component to display each therapy with its child
function TherapyItem({
  therapy,
  selectedTherapyId,
  onSelectTherapy,
}: {
  therapy: ITherapy;
  selectedTherapyId: string;
  onSelectTherapy: (therapyId: string) => void;
}) {
  const { data: child } = useChild(therapy.childId);

  return (
    <DropdownItem
      therapy={therapy}
      child={child}
      isSelected={selectedTherapyId === therapy._id}
      onClick={() => onSelectTherapy(therapy._id)}
    />
  );
}

export default function TherapySearchDropdown({
  selectedTherapyId,
  onSelectTherapy,
  disabled = false,
}: TherapySearchDropdownProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: therapies, isLoading: therapiesLoading } = useTherapies();

  // Get selected therapy details
  const selectedTherapy = therapies?.find((t) => t._id === selectedTherapyId);
  const { data: selectedChild } = useChild(selectedTherapy?.childId || "");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Set initial display value
  useEffect(() => {
    if (selectedTherapy && !searchQuery && !isDropdownOpen) {
      setSearchQuery(`Therapy #${selectedTherapy._id.slice(-6).toUpperCase()}`);
    }
  }, [selectedTherapy, isDropdownOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        // Restore selected therapy display
        if (selectedTherapy) {
          setSearchQuery(
            `Therapy #${selectedTherapy._id.slice(-6).toUpperCase()}`
          );
        }
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, selectedTherapy]);

  const handleSelectTherapy = (therapyId: string) => {
    const therapy = therapies?.find((t) => t._id === therapyId);
    if (therapy) {
      onSelectTherapy(therapyId);
      setSearchQuery(`Therapy #${therapy._id.slice(-6).toUpperCase()}`);
      setIsDropdownOpen(false);
    }
  };

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
    if (selectedTherapy) {
      setSearchQuery("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsDropdownOpen(true);
  };

  const handleClear = () => {
    onSelectTherapy("");
    setSearchQuery("");
    inputRef.current?.focus();
  };

  // Filter therapies based on search query
  const filteredTherapies = therapies?.filter((therapy) => {
    if (!debouncedSearch) return true;
    const query = debouncedSearch.toLowerCase();
    const therapyId = therapy._id.toLowerCase();
    return therapyId.includes(query);
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search therapy session by ID..."
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          disabled={disabled || therapiesLoading}
          className="w-full pl-10 pr-10 py-3 border border-grey-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-moss-stone focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {selectedTherapyId && (
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-grey hover:text-neutral-02 disabled:opacity-50"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-grey-stroke rounded-lg shadow-xl max-h-[400px] overflow-y-auto">
          {therapiesLoading ? (
            <div className="p-4 text-center">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
              </div>
            </div>
          ) : filteredTherapies && filteredTherapies.length > 0 ? (
            filteredTherapies
              .slice(0, 10)
              .map((therapy) => (
                <TherapyItem
                  key={therapy._id}
                  therapy={therapy}
                  selectedTherapyId={selectedTherapyId}
                  onSelectTherapy={handleSelectTherapy}
                />
              ))
          ) : (
            <div className="p-4 text-center text-grey text-sm">
              No therapy sessions found
            </div>
          )}
        </div>
      )}

      {/* Selected Child Info */}
      {selectedChild && !isDropdownOpen && (
        <div className="mt-2 p-3 bg-moss-stone/5 border border-moss-stone/20 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-moss-stone/20 rounded-full flex items-center justify-center shrink-0">
              <span className="text-moss-stone font-medium text-sm">
                {selectedChild.fullname?.charAt(0).toUpperCase() ||
                  selectedChild.nik.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-02">
                {selectedChild.fullname || `Child #${selectedChild.childOrder}`}
              </p>
              <p className="text-xs text-grey">
                {selectedChild.age} years • {selectedChild.education.stage}
              </p>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-grey mt-1">
        Search therapy session by ID (max 10 results)
      </p>
    </div>
  );
}
