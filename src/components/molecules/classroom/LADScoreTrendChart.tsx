"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export interface IScoreTrendDataPoint {
  date: string;
  nilai: number;
}

interface ILADScoreTrendChartProps {
  data: IScoreTrendDataPoint[];
}

export default function LADScoreTrendChart({ data }: ILADScoreTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart
        data={data}
        margin={{ top: 10, right: 16, left: -20, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#94A3B8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[50, 100]}
          tick={{ fontSize: 11, fill: "#94A3B8" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 10,
            border: "1px solid #E2E8F0",
            fontSize: 12,
            color: "#0F172A",
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, color: "#64748B" }}
          formatter={() => "Nilai Tes Diagnostik"}
        />
        <Line
          type="monotone"
          dataKey="nilai"
          stroke="#EF4444"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#EF4444", strokeWidth: 0 }}
          activeDot={{ r: 6 }}
          name="Nilai Tes Diagnostik"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
