import LoginPageTemplate from "@/components/templates/pages/login/LoginPageTemplate";

const Login: React.FC = () => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  return <LoginPageTemplate clientId={clientId} />;
};

export default Login;
