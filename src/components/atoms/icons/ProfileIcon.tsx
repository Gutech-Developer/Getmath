import { cn } from "@/libs/utils";
import { IconProps } from "@/types/iconProps";
import React from "react";

const ProfileIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      className={cn("w-4 h-4", className)}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 10.8333C11.841 10.8333 13.3333 9.34095 13.3333 7.49996C13.3333 5.65898 11.841 4.16663 10 4.16663C8.15905 4.16663 6.66669 5.65898 6.66669 7.49996C6.66669 9.34095 8.15905 10.8333 10 10.8333Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M4.16669 15.8333C4.16669 13.5321 6.55953 11.6666 10 11.6666C13.4405 11.6666 15.8334 13.5321 15.8334 15.8333"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default ProfileIcon;
