import { cn } from "@/libs/utils";
import { IconProps } from "@/types/iconProps";

const InfoCircleIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      className={cn("h-4 w-4", className)}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="10"
        cy="10"
        r="8.125"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M10 8.125V13.3333"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="10" cy="5.83333" r="0.833333" fill="currentColor" />
    </svg>
  );
};

export default InfoCircleIcon;
