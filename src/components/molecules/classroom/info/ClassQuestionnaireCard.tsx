import ClipboardIcon from "@/components/atoms/icons/ClipboardIcon";
import DocumentIcon from "@/components/atoms/icons/DocumentIcon";
import LinkIcon from "@/components/atoms/icons/LinkIcon";

interface IClassQuestionnaireCardProps {
  url?: string;
}

const DEFAULT_QUESTIONNAIRE_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSe26os1aklIBoXw89m3LYrixJx3HjXH_NP0puYR0ejYPAaNJg/viewform?usp=sharing&ouid=105865115273377729120";

export default function ClassQuestionnaireCard({
  url = DEFAULT_QUESTIONNAIRE_URL,
}: IClassQuestionnaireCardProps) {
  return (
    <section className="rounded-3xl border border-lottie-mist bg-white p-6 shadow-xs sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-lottie-teal/20 bg-lottie-teal/10 text-lottie-teal">
            <DocumentIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-normal text-lottie-midnight">
              Angket Siswa
            </h2>
            <p className="text-xs text-lottie-zinc-400">
              Evaluasi dan masukan untuk pengembangan pembelajaran kelas
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-5 rounded-2xl border border-lottie-mist bg-gradient-to-br from-[#F8FAFC] to-white p-5 transition-all hover:border-lottie-teal/30 hover:shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-lottie-teal/20 bg-lottie-teal/10 text-lottie-teal shadow-xs">
            <ClipboardIcon className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-lottie-midnight">
                Formulir Angket Evaluasi Siswa
              </h3>
             
            </div>
            <p className="text-sm leading-relaxed text-lottie-zinc-400">
              Silakan isi angket evaluasi pembelajaran kelas melalui tautan di bawah ini untuk membantu kami meningkatkan kualitas kelas.
            </p>
          </div>
        </div>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-lottie-teal px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-lottie-teal/90 focus:outline-hidden focus:ring-2 focus:ring-lottie-teal/20 active:scale-[0.98]"
        >
          <span>Isi Angket Sekarang</span>
          <LinkIcon className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}
