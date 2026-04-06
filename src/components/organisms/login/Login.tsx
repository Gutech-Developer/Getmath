"use client";
import LoginForm from "@/components/molecules/login/LoginForm";

const LoginOrganism: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-5">
      <div className="w-full md:w-[450px]">
        <div className="bg-white rounded-2xl shadow-lg border border-grey-stroke/50 p-6 lg:p-8">
          <div className="mb-6 text-center">
            <h2 className="text-2xl lg:text-3xl font-medium text-charcoal-green-dark mb-2">
              Masuk
            </h2>
            <p className="text-sm text-grey">Gajah Puteh Art Therapy</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginOrganism;
