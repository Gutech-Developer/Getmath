import { cn } from "@/libs/utils";
import { IconProps } from "@/types/iconProps";

const CheckCircleIcon: React.FC<IconProps> = ({ className }) => {
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
        d="M10 18.3333C14.6024 18.3333 18.3334 14.6024 18.3334 10C18.3334 5.39762 14.6024 1.66666 10 1.66666C5.39765 1.66666 1.66669 5.39762 1.66669 10C1.66669 14.6024 5.39765 18.3333 10 18.3333ZM13.9419 8.10854C14.186 7.86437 14.186 7.46868 13.9419 7.22451C13.6977 6.98035 13.302 6.98035 13.0578 7.22451L8.95835 11.324L6.94219 9.30784C6.69802 9.06368 6.30233 9.06368 6.05816 9.30784C5.814 9.55201 5.814 9.9477 6.05816 10.1919L8.51634 12.6501C8.7605 12.8942 9.1562 12.8942 9.40036 12.6501L13.9419 8.10854Z"
        className="fill-current"
      />
    </svg>
  );
};

export default CheckCircleIcon;
