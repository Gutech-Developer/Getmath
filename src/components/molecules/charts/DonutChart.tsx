"use client";

import { cn } from "@/libs/utils";

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  segments,
  size = 160,
  strokeWidth = 24,
  className,
}) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  let cumulativePercent = 0;

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
        />
        {segments.map((seg, i) => {
          const percent = total > 0 ? seg.value / total : 0;
          const dashArray = percent * circumference;
          const dashOffset = -(cumulativePercent * circumference);
          cumulativePercent += percent;

          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashArray} ${circumference}`}
              strokeDashoffset={dashOffset + circumference / 4}
              strokeLinecap="butt"
            />
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-xs text-grey">{seg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
