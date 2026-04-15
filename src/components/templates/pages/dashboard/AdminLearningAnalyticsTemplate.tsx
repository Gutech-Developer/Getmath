import AdminLearningAnalyticsContent, {
  IClassAnalytics,
  IEmotionSegment,
  IScoreBucket,
  ISummaryStat,
} from "@/components/organisms/AdminLearningAnalyticsContent";

const SUMMARY_STATS: ISummaryStat[] = [
  { label: "Total Siswa", value: 104, color: "#2563EB" },
  { label: "Rata-rata Nilai", value: 79, color: "#059669" },
  { label: "Total Lulus", value: 85, color: "#059669" },
  { label: "Total Remedial", value: 19, color: "#DC2626" },
];

const SCORE_BUCKETS: IScoreBucket[] = [
  { label: "0-50", value: 8, color: "#EF4444" },
  { label: "50-64", value: 15, color: "#F59E0B" },
  { label: "65-74", value: 22, color: "#F59E0B" },
  { label: "75-84", value: 37, color: "#10B981" },
  { label: "85-100", value: 30, color: "#2563EB" },
];

const EMOTION_SEGMENTS: IEmotionSegment[] = [
  { label: "Senang", value: 28, color: "#10B981" },
  { label: "Bingung", value: 20, color: "#F59E0B" },
  { label: "Tegang", value: 10, color: "#EF4444" },
  { label: "Fokus", value: 42, color: "#2563EB" },
];

const CLASS_ANALYTICS: IClassAnalytics[] = [
  {
    id: "matematika-wajib-kelas-x",
    className: "Matematika Wajib Kelas X",
    teacherName: "Ibu Rahma",
    studentCount: 32,
    averageScore: 80,
    passedCount: 26,
    remedialCount: 6,
    progress: 72,
  },
  {
    id: "matematika-peminatan-xi-ipa",
    className: "Matematika Peminatan XI IPA",
    teacherName: "Bpk. Budi Santoso",
    studentCount: 28,
    averageScore: 77,
    passedCount: 22,
    remedialCount: 6,
    progress: 55,
  },
  {
    id: "statistika-probabilitas",
    className: "Statistika & Probabilitas",
    teacherName: "Ibu Sari Dewi",
    studentCount: 24,
    averageScore: 85,
    passedCount: 22,
    remedialCount: 2,
    progress: 90,
  },
  {
    id: "geometri-trigonometri",
    className: "Geometri & Trigonometri",
    teacherName: "Bpk. Dani Wirawan",
    studentCount: 20,
    averageScore: 74,
    passedCount: 15,
    remedialCount: 5,
    progress: 40,
  },
];

export default function AdminLearningAnalyticsTemplate() {
  return (
    <AdminLearningAnalyticsContent
      summaryStats={SUMMARY_STATS}
      scoreBuckets={SCORE_BUCKETS}
      emotionSegments={EMOTION_SEGMENTS}
      classAnalytics={CLASS_ANALYTICS}
    />
  );
}
