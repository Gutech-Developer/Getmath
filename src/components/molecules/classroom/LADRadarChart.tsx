"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export interface IRadarDataPoint {
  subject: string;
  value: number;
}

interface ILADRadarChartProps {
  data: IRadarDataPoint[];
}

export default function LADRadarChart({ data }: ILADRadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart
        data={data}
        margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
      >
        <PolarGrid stroke="#E2E8F0" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 11, fill: "#64748B" }}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #E2E8F0",
            fontSize: 12,
          }}
        />
        <Radar
          name="Penguasaan"
          dataKey="value"
          stroke="#F43F5E"
          fill="#F43F5E"
          fillOpacity={0.25}
          strokeWidth={2}
          dot={{ r: 4, fill: "#F43F5E", strokeWidth: 0 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
