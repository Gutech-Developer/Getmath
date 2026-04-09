import { cn } from "@/libs/utils";
import { IconProps } from "@/types/iconProps";

const PlusIcon: React.FC<IconProps> = ({ className }) => {
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
        d="M10 3.33334C10.3452 3.33334 10.625 3.61317 10.625 3.95834V9.375H16.0417C16.3868 9.375 16.6667 9.65483 16.6667 10C16.6667 10.3452 16.3868 10.625 16.0417 10.625H10.625V16.0417C10.625 16.3869 10.3452 16.6667 10 16.6667C9.65483 16.6667 9.375 16.3869 9.375 16.0417V10.625H3.95834C3.61317 10.625 3.33334 10.3452 3.33334 10C3.33334 9.65483 3.61317 9.375 3.95834 9.375H9.375V3.95834C9.375 3.61317 9.65483 3.33334 10 3.33334Z"
        className="fill-current"
      />
    </svg>
  );
};

export default PlusIcon;
