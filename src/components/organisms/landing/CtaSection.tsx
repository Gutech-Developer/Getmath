import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="bg-[#111827] py-20 text-center md:py-28">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#60A5FA]">
          Mulai Sekarang
        </p>
        <h2 className="mb-6 text-4xl font-extrabold text-white sm:text-5xl leading-tight">
          Siap Bergabung dengan<br />GetSmart?
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-[#9CA3AF]">
          Bergabunglah dengan ribuan siswa, guru, dan orang tua yang telah merasakan manfaat belajar bersama GetSmart.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className="flex h-12 w-full items-center justify-center rounded-xl bg-[#2563EB] px-8 font-semibold text-white transition hover:bg-[#1D4ED8] sm:w-auto"
          >
            Mulai Belajar Sekarang
          </Link>
          <Link
            href="/login"
            className="flex h-12 w-full items-center justify-center rounded-xl border border-[#374151] bg-transparent px-8 font-semibold text-white transition hover:bg-[#1F2937] sm:w-auto"
          >
            Sudah Punya Akun? Masuk
          </Link>
        </div>
      </div>
    </section>
  );
}
