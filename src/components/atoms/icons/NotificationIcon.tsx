import { cn } from "@/libs/utils";
import { IconProps } from "@/types/iconProps";
import React from "react";

const NotificationIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      className={cn("w-5 h-5", className)}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 18.3333C11.1046 18.3333 12.0208 17.4171 12.0208 16.3125H7.97917C7.97917 17.4171 8.89538 18.3333 10 18.3333Z"
        className="fill-current"
      />
      <path
        d="M16.6667 11.25V9.16667C16.6667 6.06125 14.5938 3.46875 11.7083 2.98958V2.08333C11.7083 1.46354 11.2448 1 10.625 1C10.0052 1 9.54167 1.46354 9.54167 2.08333V2.98958C6.65625 3.46875 4.58333 6.06125 4.58333 9.16667V11.25L3.33333 12.5V13.3333H16.6667V12.5L16.6667 11.25Z"
        className="fill-current"
      />
      <path
        d="M14.1667 11.25H5.83333V9.16667C5.83333 6.88792 7.56208 5.20833 9.79167 5.05625V4.16667C9.79167 3.52937 10.2779 3.04167 10.9167 3.04167C11.5554 3.04167 12.0417 3.52937 12.0417 4.16667V5.05625C14.271 5.20833 16 6.88792 16 9.16667V11.25Z"
        className="fill-current"
      />
    </svg>
  );
};

export default NotificationIcon;
