"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/libs/utils";

export interface IEmotionSegment {
  label: string;
  value: number;
  color: string;
}

interface ILADDonutChartProps {
  segments: IEmotionSegment[];
  className?: string;
}

export default function LADDonutChart({
  segments,
  className,
}: ILADDonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={segments}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={72}
            paddingAngle={2}
            strokeWidth={0}
          >
            {segments.map((seg, i) => (
              <Cell key={i} fill={seg.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => {
              const num = typeof value === "number" ? value : 0;
              return [`${total > 0 ? Math.round((num / total) * 100) : 0}%`];
            }}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #E2E8F0",
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="space-y-2">
        {segments.map((seg) => {
          const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
          return (
            <div
              key={seg.label}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-[#475569]">{seg.label}</span>
              </div>
              <span className="font-semibold text-[#0F172A]">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
