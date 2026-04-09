import { cn } from "@/libs/utils";
import { IconProps } from "@/types/iconProps";

const MinusIcon: React.FC<IconProps> = ({ className }) => {
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
        d="M4.16666 10C4.16666 9.65483 4.44649 9.375 4.79166 9.375H15.2083C15.5535 9.375 15.8333 9.65483 15.8333 10C15.8333 10.3452 15.5535 10.625 15.2083 10.625H4.79166C4.44649 10.625 4.16666 10.3452 4.16666 10Z"
        className="fill-current"
      />
    </svg>
  );
};

export default MinusIcon;
