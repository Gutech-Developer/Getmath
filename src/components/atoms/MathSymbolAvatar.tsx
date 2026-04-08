import { cn } from "@/libs/utils";
import { ReactNode } from "react";

type AvatarSize = "sm" | "md" | "lg";

interface MathSymbolAvatarProps {
  symbol: ReactNode;
  color?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-lg",
  lg: "w-12 h-12 text-xl",
};

export const MathSymbolAvatar: React.FC<MathSymbolAvatarProps> = ({
  symbol,
  color = "bg-indigo-100 text-indigo-600",
  size = "md",
  className,
}) => {
  return (
    <div
      className={cn(
        "rounded-xl flex items-center justify-center font-bold shrink-0",
        sizeStyles[size],
        color,
        className,
      )}
    >
      {symbol}
    </div>
  );
};
