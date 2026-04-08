import { cn } from "@/libs/utils";
import { IconProps } from "@/types/iconProps";

const HeartIcon: React.FC<IconProps> = ({ className }) => {
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
        d="M10 16.9106C9.65 16.9106 9.31667 16.8023 9.04167 16.5939C7.375 15.3273 4.29167 12.844 3.04167 10.7773C1.94167 8.96065 2.29167 6.544 3.83333 5.144C5.275 3.83567 7.50833 3.77733 9.00833 5.02733L10 5.844L10.9917 5.02733C12.4917 3.77733 14.725 3.83567 16.1667 5.144C17.7083 6.544 18.0583 8.96065 16.9583 10.7773C15.7083 12.844 12.625 15.3273 10.9583 16.5939C10.6833 16.8023 10.35 16.9106 10 16.9106Z"
        className="fill-current"
      />
    </svg>
  );
};

export default HeartIcon;
