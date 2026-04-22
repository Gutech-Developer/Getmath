"use client";

import React, { useState, useEffect, useRef } from "react";
import SearchIcon from "../../atoms/icons/SearchIcon";
import CommandF from "../../atoms/icons/CommandF";

export const SearchBar = () => {
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="relative w-80">
      <div className="w-full h-10 border border-grey-stroke rounded-lg bg-grey-lightest flex gap-2 items-center p-2">
        <SearchIcon className="w-4 h-4 text-grey" />
        <input
          ref={inputRef}
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="text-xs outline-none bg-transparent flex-1"
          placeholder="Search..."
        />
        {searchValue && (
          <button
            onClick={() => setSearchValue("")}
            className="text-grey hover:text-neutral-02 transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <CommandF className="w-7 h-7" />
      </div>
    </div>
  );
};
