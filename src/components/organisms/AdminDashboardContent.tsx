"use client";

import { ReactNode } from "react";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { AdminStatCard } from "@/components/molecules/cards/AdminStatCard";
import TrendUpIcon from "@/components/atoms/icons/TrendUpIcon";
import ActivityIcon from "@/components/atoms/icons/ActivityIcon";
import UsersIcon from "@/components/atoms/icons/UsersIcon";
import BookIcon from "@/components/atoms/icons/BookIcon";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ============ TYPES ============

export interface AdminStat {
  icon: ReactNode;
  iconColor?: string;
  value: string | number;
  label: string;
  delta?: number;
}

export interface AdminChartLine {
  label: string;
  color: string;
  data: number[];
}

interface AdminDashboardContentProps {
  stats: AdminStat[];
  chartLabels: string[];
  chartLines: AdminChartLine[];
  chartTitle?: string;
}

export const AdminDashboardContent: React.FC<AdminDashboardContentProps> = ({
  stats,
  chartLabels,
  chartLines,
  chartTitle = "Tren Pertumbuhan Platform",
}) => {
  const chartData = chartLabels.map((label, index) => {
    const dataPoint: any = { name: label };
    chartLines.forEach((line) => {
      dataPoint[line.label] = line.data[index] || 0;
    });
    return dataPoint;
  });
  return (
    <div className="w-full flex flex-col gap-6 md:gap-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <AdminStatCard
            key={index}
            icon={stat.icon}
            iconColor={stat.iconColor}
            value={stat.value}
            label={stat.label}
            delta={stat.delta}
          />
        ))}
      </div>

      {/* Platform Growth Chart */}
      <div className="bg-white border border-grey-stroke rounded-2xl p-5 md:p-6 flex flex-col gap-4">
        <SectionHeader title={chartTitle} />
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                {chartLines.map((line) => (
                  <linearGradient key={line.label} id={`color${line.label.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={line.color} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={line.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} dx={-10} />
              <Tooltip
                contentStyle={{ borderRadius: "16px", border: "1px solid #E2E8F0", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", backgroundColor: "#ffffff", padding: "12px" }}
                itemStyle={{ color: "#334155", fontSize: "13px" }}
                labelStyle={{ color: "#1E293B", fontWeight: "bold", fontSize: "14px", marginBottom: "4px" }}
              />
              {chartLines.map((line) => (
                <Area
                  key={line.label}
                  type="monotone"
                  dataKey={line.label}
                  stroke={line.color}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#color${line.label.replace(/\s/g, "")})`}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Aksi Cepat */}
      <div className="bg-white border border-grey-stroke rounded-2xl p-5 md:p-6 flex flex-col gap-4">
        <SectionHeader title="Aksi Cepat" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Link href="/admin/dashboard/manage-users/student" className="flex items-center gap-3 p-4 rounded-xl border border-grey-stroke hover:border-[#3b82f6] hover:bg-blue-50 transition-colors">
            <div className="bg-blue-100 text-[#3b82f6] p-2 rounded-lg">
              <UsersIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-[#0F172A]">Kelola Pengguna</span>
              <span className="text-xs text-[#64748B]">Tambah siswa/guru baru</span>
            </div>
          </Link>
          <Link href="/admin/dashboard/class-list" className="flex items-center gap-3 p-4 rounded-xl border border-grey-stroke hover:border-[#10b981] hover:bg-emerald-50 transition-colors">
            <div className="bg-emerald-100 text-[#10b981] p-2 rounded-lg">
              <BookIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-[#0F172A]">Daftar Kelas</span>
              <span className="text-xs text-[#64748B]">Manajemen kelas & guru</span>
            </div>
          </Link>
          <Link href="/admin/dashboard/learning-analytics" className="flex items-center gap-3 p-4 rounded-xl border border-grey-stroke hover:border-[#f59e0b] hover:bg-amber-50 transition-colors">
            <div className="bg-amber-100 text-[#f59e0b] p-2 rounded-lg">
              <ActivityIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-[#0F172A]">Analitik Belajar</span>
              <span className="text-xs text-[#64748B]">Pantau progres siswa</span>
            </div>
          </Link>
          <Link href="/admin/dashboard/manage-diagnostics" className="flex items-center gap-3 p-4 rounded-xl border border-grey-stroke hover:border-[#8b5cf6] hover:bg-purple-50 transition-colors">
            <div className="bg-purple-100 text-[#8b5cf6] p-2 rounded-lg">
              <TrendUpIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-[#0F172A]">Evaluasi & Tes</span>
              <span className="text-xs text-[#64748B]">Kelola tes diagnostik</span>
            </div>
          </Link>
          {/* <Link href="/admin/dashboard/announcements" className="flex items-center gap-3 p-4 rounded-xl border border-grey-stroke hover:border-[#ec4899] hover:bg-pink-50 transition-colors">
            <div className="bg-pink-100 text-[#ec4899] p-2 rounded-lg">
              <ActivityIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-[#0F172A]">Pusat Informasi</span>
              <span className="text-xs text-[#64748B]">Kirim pengumuman</span>
            </div>
          </Link>
          <Link href="/admin/dashboard/settings" className="flex items-center gap-3 p-4 rounded-xl border border-grey-stroke hover:border-[#64748b] hover:bg-slate-50 transition-colors">
            <div className="bg-slate-100 text-[#64748b] p-2 rounded-lg">
              <UsersIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-[#0F172A]">Pengaturan</span>
              <span className="text-xs text-[#64748B]">Konfigurasi sistem</span>
            </div>
          </Link> */}
        </div>
      </div>
    </div>
  );
};
