import { cn } from "@/libs/utils";
import { IconProps } from "@/types/iconProps";

const FireIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      className={cn("w-4 h-4", className)}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 1.66666C10 1.66666 6.66667 5.83332 6.66667 9.16666C6.66667 11.0076 8.15905 12.5 10 12.5C11.841 12.5 13.3333 11.0076 13.3333 9.16666C13.3333 5.83332 10 1.66666 10 1.66666Z"
        className="fill-current"
      />
      <path
        d="M10 18.3333C13.6819 18.3333 16.6667 15.3486 16.6667 11.6667C16.6667 7.98476 13.6819 5 10 5C6.31811 5 3.33334 7.98476 3.33334 11.6667C3.33334 15.3486 6.31811 18.3333 10 18.3333Z"
        className="fill-current"
        opacity="0.5"
      />
    </svg>
  );
};

export default FireIcon;
