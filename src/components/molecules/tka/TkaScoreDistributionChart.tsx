"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TKAScoreBucket } from "@/types/tka";

const COLORS = ["#F97316", "#EAB308", "#22C55E", "#3B82F6"];

export default function TkaScoreDistributionChart({
  data,
}: {
  data: TKAScoreBucket[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 10, right: 16, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#94A3B8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94A3B8" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          formatter={(value, _name, item) => [
            `${value} siswa (${item?.payload?.percentage ?? 0}%)`,
            "Jumlah",
          ]}
          contentStyle={{
            borderRadius: 10,
            border: "1px solid #E2E8F0",
            fontSize: 12,
          }}
        />
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={entry.label} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
