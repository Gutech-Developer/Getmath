import LoginPageTemplate from "@/components/templates/pages/login/LoginPageTemplate";

// Paksa render dinamis di runtime. Tanpa ini, Next.js mem-prerender halaman ini
// secara STATIS saat `next build` (di CI, tanpa env) → clientId ter-bake jadi "".
// Dengan force-dynamic, GOOGLE_CLIENT_ID dibaca dari env container per-request,
// sehingga satu image GHCR bisa dipakai staging & prod dengan client id berbeda.
export const dynamic = "force-dynamic";

const Login: React.FC = () => {
  const clientId =
    process.env.GOOGLE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "";
  return <LoginPageTemplate clientId={clientId} />;
};

export default Login;
