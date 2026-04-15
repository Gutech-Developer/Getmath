"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";

export interface IStudyTimeDataPoint {
  subject: string;
  hours: number;
  color?: string;
}

interface ILADBarChartProps {
  data: IStudyTimeDataPoint[];
  barColor?: string;
}

export default function LADBarChart({
  data,
  barColor = "#F59E0B",
}: ILADBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 16, left: -20, bottom: 0 }}
        barSize={40}
      >
        <CartesianGrid
          strokeDasharray="4 4"
          stroke="#F1F5F9"
          vertical={false}
        />
        <XAxis
          dataKey="subject"
          tick={{ fontSize: 11, fill: "#94A3B8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94A3B8" }}
          axisLine={false}
          tickLine={false}
          unit="j"
        />
        <Tooltip
          formatter={(value) => [`${value}j`, "Waktu belajar"]}
          contentStyle={{
            borderRadius: 10,
            border: "1px solid #E2E8F0",
            fontSize: 12,
          }}
        />
        <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color ?? barColor} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
