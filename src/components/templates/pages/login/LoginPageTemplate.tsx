import LoginOrganism from "@/components/organisms/login/Login";

interface LoginPageTemplateProps {
  clientId: string;
}

const LoginPageTemplate: React.FC<LoginPageTemplateProps> = ({ clientId }) => {
  return <LoginOrganism clientId={clientId} />;
};

export default LoginPageTemplate;
