"use client";

import { cn } from "@/libs/utils";

interface DataLine {
  label: string;
  color: string;
  data: number[];
}

interface ScoreTrendChartProps {
  labels: string[];
  lines: DataLine[];
  className?: string;
}

/**
 * Simple SVG-based line chart for score trends.
 * Lightweight — no external charting library needed.
 */
export const ScoreTrendChart: React.FC<ScoreTrendChartProps> = ({
  labels,
  lines,
  className,
}) => {
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const width = 600;
  const height = 200;
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Calculate min/max across all lines
  const allValues = lines.flatMap((l) => l.data);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const range = maxVal - minVal || 1;

  // Y-axis ticks
  const yTicks = [minVal, minVal + range / 2, maxVal].map(Math.round);

  const getX = (i: number) => padding.left + (i / (labels.length - 1)) * chartW;
  const getY = (val: number) =>
    padding.top + chartH - ((val - minVal) / range) * chartH;

  return (
    <div className={cn("w-full", className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Grid lines */}
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={padding.left}
              y1={getY(tick)}
              x2={width - padding.right}
              y2={getY(tick)}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text
              x={padding.left - 8}
              y={getY(tick) + 4}
              textAnchor="end"
              className="fill-gray-400"
              fontSize="11"
            >
              {tick}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {labels.map((label, i) => (
          <text
            key={label}
            x={getX(i)}
            y={height - 8}
            textAnchor="middle"
            className="fill-gray-400"
            fontSize="11"
          >
            {label}
          </text>
        ))}

        {/* Lines */}
        {lines.map((line) => {
          const points = line.data.map((val, i) => `${getX(i)},${getY(val)}`);
          return (
            <g key={line.label}>
              <polyline
                fill="none"
                stroke={line.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points.join(" ")}
              />
              {line.data.map((val, i) => (
                <circle
                  key={i}
                  cx={getX(i)}
                  cy={getY(val)}
                  r="4"
                  fill="white"
                  stroke={line.color}
                  strokeWidth="2.5"
                />
              ))}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 mt-2">
        {lines.map((line) => (
          <div key={line.label} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: line.color }}
            />
            <span className="text-xs text-grey">{line.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
