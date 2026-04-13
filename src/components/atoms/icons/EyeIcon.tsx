import { cn } from "@/libs/utils";
import { IconProps } from "@/types/iconProps";

const EyeIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      className={cn("h-4 w-4", className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 12C2 12 5.63636 5.45454 12 5.45454C18.3636 5.45454 22 12 22 12C22 12 18.3636 18.5455 12 18.5455C5.63636 18.5455 2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
};

export default EyeIcon;
