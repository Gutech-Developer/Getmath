import { Heading3, Heading5 } from "@/components/atoms/Typography";
import { StatsCard } from "@/components/molecules/cards/StatsCard";
import ThreeUserGroupIcon from "@/components/atoms/icons/ThreeUserGroupIcon";
import NotebookIcon from "@/components/atoms/icons/NotebookIcon";
import DocumentIcon from "@/components/atoms/icons/DocumentIcon";
import Link from "next/link";

export default function CounselorDashboardPage() {
  return (
    <div className="">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <Heading3 className="text-neutral-02 text-xl sm:text-2xl lg:text-3xl">
          Selamat datang, Counselor!
        </Heading3>
        <p className="text-grey mt-2 text-xs sm:text-sm">
          Berikut adalah jadwal sesi terapi Anda hari ini.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatsCard
          title="Total Orangtua"
          value="0"
          subtitle="Aktif"
          icon={<ThreeUserGroupIcon className="w-6 h-6" />}
        />
        <StatsCard
          title="Sesi Terapi"
          value="0"
          subtitle="Total sesi"
          icon={<NotebookIcon className="w-6 h-6" />}
        />
        <StatsCard
          title="Total Anak"
          value="0"
          subtitle="Sedang dalam terapi"
          icon={<DocumentIcon className="w-6 h-6" />}
        />
      </div>

      {/* User Guide Section */}
      <div className="bg-jade-light/10 border border-grey-stroke rounded-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-jade rounded-xl flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <Heading5 className="text-neutral-02 mb-2 text-base sm:text-lg">
              Panduan Penggunaan Sistem Terapi
            </Heading5>
            <p className="text-grey text-xs sm:text-sm">
              Ikuti langkah-langkah berikut untuk mengelola sesi terapi dengan
              lengkap dan terstruktur
            </p>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {/* Step 1 */}
          <div className="bg-white rounded-lg p-4 sm:p-5 border border-grey-stroke hover:border-moss-stone transition-colors">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-moss-stone text-white rounded-full flex items-center justify-center shrink-0 font-semibold text-xs sm:text-sm">
                1
              </div>
              <div className="flex-1 min-w-0">
                <h6 className="font-semibold text-neutral-02 mb-2 text-xs sm:text-sm">
                  Lihat data orangtua & anak
                </h6>
                <p className="text-grey text-xs sm:text-sm mb-3 leading-relaxed">
                  Mulai dengan melihat anak yang akan mengikuti terapi. Jika
                  belum ada, perintahkan orangtua tambahkan data anak melalui
                  dashboard orangtua.
                </p>
                <Link
                  href="/counselor/children"
                  className="inline-flex items-center text-moss-stone hover:text-moss-stone-dark font-medium text-xs sm:text-sm"
                >
                  Lihat Daftar Orang Tua & Anak
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-lg p-4 sm:p-5 border border-grey-stroke hover:border-moss-stone transition-colors">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-moss-stone text-white rounded-full flex items-center justify-center shrink-0 font-semibold text-xs sm:text-sm">
                2
              </div>
              <div className="flex-1 min-w-0">
                <h6 className="font-semibold text-neutral-02 mb-2 text-xs sm:text-sm">
                  Buat Sesi Terapi Baru
                </h6>
                <p className="text-grey text-xs sm:text-sm mb-3 leading-relaxed">
                  Setelah memilih anak, buat sesi terapi baru. Ini akan menjadi
                  wadah untuk semua asesmen yang akan dilakukan.
                </p>
                <Link
                  href="/counselor/therapy"
                  className="inline-flex items-center text-moss-stone hover:text-moss-stone-dark font-medium text-xs sm:text-sm"
                >
                  Buat Sesi Terapi
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-lg p-4 sm:p-5 border border-grey-stroke hover:border-moss-stone transition-colors">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-moss-stone text-white rounded-full flex items-center justify-center shrink-0 font-semibold text-xs sm:text-sm">
                3
              </div>
              <div className="flex-1 min-w-0">
                <h6 className="font-semibold text-neutral-02 mb-2 text-xs sm:text-sm">
                  Lakukan Screening (CSTQ)
                </h6>
                <p className="text-grey text-xs sm:text-sm mb-3 leading-relaxed">
                  Mulai dengan screening menggunakan Child Screening Trauma
                  Questionnaire (CSTQ) untuk mengukur tingkat trauma anak.
                </p>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-lg p-4 sm:p-5 border border-grey-stroke hover:border-moss-stone transition-colors">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-moss-stone text-white rounded-full flex items-center justify-center shrink-0 font-semibold text-xs sm:text-sm">
                4
              </div>
              <div className="flex-1 min-w-0">
                <h6 className="font-semibold text-neutral-02 mb-2 text-xs sm:text-sm">
                  Lakukan Pretest (SDQ)
                </h6>
                <p className="text-grey text-xs sm:text-sm mb-3 leading-relaxed">
                  Lanjutkan dengan pretest menggunakan SDQ (Strengths and
                  Difficulties Questionnaire) untuk baseline assessment.
                </p>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-white rounded-lg p-4 sm:p-5 border border-grey-stroke hover:border-moss-stone transition-colors">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-moss-stone text-white rounded-full flex items-center justify-center shrink-0 font-semibold text-xs sm:text-sm">
                5
              </div>
              <div className="flex-1 min-w-0">
                <h6 className="font-semibold text-neutral-02 mb-2 text-xs sm:text-sm">
                  Catat Observasi Terapi
                </h6>
                <p className="text-grey text-xs sm:text-sm mb-3 leading-relaxed">
                  Dokumentasikan observasi selama sesi terapi berlangsung, catat
                  perkembangan dan perilaku anak.
                </p>
              </div>
            </div>
          </div>

          {/* Step 6 */}
          <div className="bg-white rounded-lg p-4 sm:p-5 border border-grey-stroke hover:border-moss-stone transition-colors">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-moss-stone text-white rounded-full flex items-center justify-center shrink-0 font-semibold text-xs sm:text-sm">
                6
              </div>
              <div className="flex-1 min-w-0">
                <h6 className="font-semibold text-neutral-02 mb-2 text-xs sm:text-sm">
                  Lakukan Posttest (SDQ)
                </h6>
                <p className="text-grey text-xs sm:text-sm mb-3 leading-relaxed">
                  Setelah terapi selesai, lakukan posttest menggunakan SDQ untuk
                  mengukur perubahan dan efektivitas terapi.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Box */}
        <div className="mt-4 sm:mt-6 bg-white/50 border border-moss-stone/30 rounded-lg p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-moss-stone shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-moss-stone text-xs sm:text-sm mb-2">
                Tips Penting:
              </p>
              <ul className="text-grey text-xs sm:text-sm space-y-1 list-disc list-inside">
                <li>Pastikan semua asesmen dilakukan secara berurutan</li>
                <li>Dokumentasikan setiap sesi dengan detail</li>
                <li>Gunakan interpretasi yang sudah disediakan sistem</li>
                <li>Review hasil secara berkala untuk monitoring progress</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white border border-grey-stroke rounded-xl p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <div>
            <Heading5 className="text-neutral-02 mb-1 text-base sm:text-lg">
              Aktifitas Terkini
            </Heading5>
            <p className="text-grey text-xs sm:text-sm">
              Sesi terapi dan penilaian terbaru Anda
            </p>
          </div>
          <Link
            href="/counselor/therapy"
            className="w-full sm:w-auto text-center px-4 py-2 border border-moss-stone text-moss-stone rounded-lg text-xs sm:text-sm font-medium hover:bg-moss-stone hover:text-neutral-01 transition-colors"
          >
            Lihat Semua
          </Link>
        </div>

        {/* Empty state */}
        <div className="text-center py-8 sm:py-12">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-grey-stroke rounded-full flex items-center justify-center mx-auto mb-4">
            <DocumentIcon className="w-6 h-6 sm:w-8 sm:h-8 text-grey" />
          </div>
          <p className="text-grey mb-4 text-xs sm:text-sm">
            Belum ada aktivitas terkini
          </p>
          <Link
            href="/counselor/therapy"
            className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-moss-stone text-white rounded-lg hover:bg-moss-stone-dark transition-colors text-xs sm:text-sm font-medium"
          >
            Buat Sesi Terapi Pertama
          </Link>
        </div>
      </div>
    </div>
  );
}
