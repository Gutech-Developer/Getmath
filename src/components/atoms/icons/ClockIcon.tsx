import { cn } from "@/libs/utils";
import { IconProps } from "@/types/iconProps";

const ClockIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      className={cn("w-4 h-4", className)}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 1.875C5.51269 1.875 1.875 5.51269 1.875 10C1.875 14.4873 5.51269 18.125 10 18.125C14.4873 18.125 18.125 14.4873 18.125 10C18.125 5.51269 14.4873 1.875 10 1.875ZM10.625 6.25C10.625 5.90482 10.3452 5.625 10 5.625C9.65482 5.625 9.375 5.90482 9.375 6.25V10C9.375 10.2071 9.47462 10.4017 9.64287 10.5244L12.5596 12.6078C12.8421 12.8069 13.231 12.7381 13.4301 12.4556C13.6292 12.1731 13.5604 11.7842 13.2779 11.5851L10.625 9.70312V6.25Z"
        className="fill-current"
      />
    </svg>
  );
};

export default ClockIcon;
