import { cn } from "@/libs/utils";
import { IconProps } from "@/types/iconProps";

const BellIcon: React.FC<IconProps> = ({ className }) => {
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
        d="M10 1.66667C6.77834 1.66667 4.16667 4.27834 4.16667 7.5V8.82149C4.16667 9.40509 3.97638 9.97268 3.625 10.4417L2.75483 11.6017C1.75867 12.9295 2.49628 14.8404 4.10393 15.2316C4.69702 15.376 5.29529 15.4975 5.89771 15.5961C6.33751 16.8834 7.56185 17.9167 10 17.9167C12.4382 17.9167 13.6625 16.8834 14.1023 15.5961C14.7047 15.4975 15.303 15.376 15.8961 15.2316C17.5037 14.8404 18.2413 12.9295 17.2452 11.6017L16.375 10.4417C16.0236 9.97268 15.8333 9.40509 15.8333 8.82149V7.5C15.8333 4.27834 13.2217 1.66667 10 1.66667Z"
        className="fill-current"
      />
    </svg>
  );
};

export default BellIcon;
