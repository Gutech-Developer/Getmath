"use client";

import React, { useState, useEffect, useRef } from "react";
import SearchIcon from "../../atoms/icons/SearchIcon";
import CommandF from "../../atoms/icons/CommandF";
import { useRouter } from "next/navigation";
import { useTherapies } from "@/services";
import { useCurrentUser } from "@/services";
import { isCounselor } from "@/types/auth";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: "therapy";
  link: string;
}

export const SearchBar = () => {
  const [searchValue, setSearchValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch data
  const { data: user } = useCurrentUser();
  const { data: therapies } = useTherapies();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+F or Cmd+F
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Search logic
  useEffect(() => {
    if (!searchValue.trim() || !user) {
      setSearchResults([]);
      setIsOpen(false);
      return;
    }

    const query = searchValue.toLowerCase();
    const results: SearchResult[] = [];

    // Search therapies (only for counselor)
    if (therapies && isCounselor(user)) {
      therapies
        .filter(
          (therapy) =>
            therapy._id.toLowerCase().includes(query) ||
            therapy.childId.toLowerCase().includes(query) ||
            therapy.counselorId.toLowerCase().includes(query),
        )
        .slice(0, 5)
        .forEach((therapy) => {
          results.push({
            id: therapy._id,
            title: `Therapy - ${therapy._id.substring(0, 8)}...`,
            subtitle: `Child ID: ${therapy.childId.substring(0, 8)}...`,
            type: "therapy",
            link: `/counselor/therapy/${therapy._id}`,
          });
        });
    }

    setSearchResults(results.slice(0, 10)); // Limit to 10 results
    setIsOpen(results.length > 0);
    setSelectedIndex(-1);
  }, [searchValue, therapies, user]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || searchResults.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectResult(searchResults[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const handleClear = () => {
    setSearchValue("");
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleSelectResult = (result: SearchResult) => {
    router.push(result.link);
    setSearchValue("");
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "therapy":
        return (
          <svg
            className="w-4 h-4"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 6a3 3 0 013-3h8a3 3 0 013 3v8a3 3 0 01-3 3H6a3 3 0 01-3-3V6z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M7 9h6M7 12h4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "therapy":
        return "Therapy";
      default:
        return type;
    }
  };

  return (
    <div className="relative w-80">
      <div className="w-full h-10 border border-grey-stroke rounded-lg bg-grey-lightest flex gap-2 items-center p-2">
        <SearchIcon className="w-4 h-4 text-grey" />
        <input
          ref={inputRef}
          type="text"
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          className="text-xs outline-none bg-transparent flex-1"
          placeholder="Search..."
        />
        {searchValue && (
          <button
            onClick={handleClear}
            className="text-grey hover:text-neutral-02 transition-colors"
            aria-label="Clear search"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 5L5 15M5 5l10 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        <CommandF className="w-7 h-7" />
      </div>

      {/* Dropdown Results */}
      {isOpen && searchResults.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-neutral-01 border border-grey-stroke rounded-lg shadow-lg max-h-96 overflow-y-auto z-50"
        >
          <div className="p-2">
            <div className="text-xs text-grey px-3 py-2">
              {searchResults.length} result{searchResults.length > 1 ? "s" : ""}{" "}
              found
            </div>
            {searchResults.map((result, index) => (
              <button
                key={result.id}
                onClick={() => handleSelectResult(result)}
                className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  selectedIndex === index
                    ? "bg-moss-stone/10 border border-moss-stone"
                    : "hover:bg-grey-lightest"
                }`}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div
                  className={`mt-0.5 ${
                    selectedIndex === index ? "text-moss-stone" : "text-grey"
                  }`}
                >
                  {getTypeIcon(result.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-neutral-02 truncate">
                      {result.title}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        selectedIndex === index
                          ? "bg-moss-stone text-neutral-01"
                          : "bg-grey-lightest text-grey"
                      }`}
                    >
                      {getTypeLabel(result.type)}
                    </span>
                  </div>
                  <p className="text-xs text-grey truncate mt-0.5">
                    {result.subtitle}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && searchValue && searchResults.length === 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-neutral-01 border border-grey-stroke rounded-lg shadow-lg z-50"
        >
          <div className="p-4 text-center">
            <div className="text-grey text-sm">No results found</div>
            <div className="text-grey text-xs mt-1">
              Try searching for a different term
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
