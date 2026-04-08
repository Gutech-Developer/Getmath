import { cn } from "@/libs/utils";
import { IconProps } from "@/types/iconProps";

const VideoIcon: React.FC<IconProps> = ({ className }) => {
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
        d="M2.08331 6.66667C2.08331 5.01981 3.41979 3.68334 5.06665 3.68334H10.9333C12.5802 3.68334 13.9166 5.01981 13.9166 6.66667V7.00898L16.0975 5.55376C16.7888 5.09256 17.7083 5.58584 17.7083 6.42276V13.5772C17.7083 14.4142 16.7888 14.9075 16.0975 14.4462L13.9166 12.991V13.3333C13.9166 14.9802 12.5802 16.3167 10.9333 16.3167H5.06665C3.41979 16.3167 2.08331 14.9802 2.08331 13.3333V6.66667Z"
        className="fill-current"
      />
    </svg>
  );
};

export default VideoIcon;
