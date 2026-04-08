import { cn } from "@/libs/utils";
import { IconProps } from "@/types/iconProps";

const StarIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      className={cn("w-4 h-4", className)}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 1.66666L12.575 6.88332L18.3333 7.72499L14.1667 11.7833L15.15 17.5167L10 14.8083L4.85 17.5167L5.83333 11.7833L1.66667 7.72499L7.425 6.88332L10 1.66666Z"
        className="fill-current"
      />
    </svg>
  );
};

export default StarIcon;
