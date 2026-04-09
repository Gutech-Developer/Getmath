import { cn } from "@/libs/utils";
import { IconProps } from "@/types/iconProps";

const ChatIcon: React.FC<IconProps> = ({ className }) => {
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
        d="M10 2.08334C5.62779 2.08334 2.08331 5.20168 2.08331 9.16668C2.08331 11.0901 2.90813 12.8372 4.27009 14.1338C4.30715 14.1845 4.33837 14.2401 4.36267 14.2999L5.24162 16.4619C5.37139 16.7812 5.72978 16.9385 6.04906 16.8088L8.55403 15.7914C8.66064 15.7481 8.77815 15.7362 8.89141 15.7578C9.25168 15.8263 9.62277 15.8618 10 15.8618C14.3722 15.8618 17.9167 12.7434 17.9167 8.77847C17.9167 5.20168 14.3722 2.08334 10 2.08334Z"
        className="fill-current"
      />
    </svg>
  );
};

export default ChatIcon;
