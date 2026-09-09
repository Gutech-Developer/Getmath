import HeroSection from "@/components/organisms/landing/HeroSection";
import FeaturesSection from "@/components/organisms/landing/FeaturesSection";
import EmotionAiSection from "@/components/organisms/landing/EmotionAiSection";
import DiagnosticTestSection from "@/components/organisms/landing/DiagnosticTestSection";
import RemedialVideoSection from "@/components/organisms/landing/RemedialVideoSection";
import EWorksheetSection from "@/components/organisms/landing/EWorksheetSection";
import RolesSection from "@/components/organisms/landing/RolesSection";
import HowItWorksSection from "@/components/organisms/landing/HowItWorksSection";
import DemoAccountSection from "@/components/organisms/landing/DemoAccountSection";
import CtaSection from "@/components/organisms/landing/CtaSection";
import LandingLayout from "@/components/templates/layouts/LandingLayout";

export default function LandingPageTemplate() {
  return (
    <LandingLayout>
      <HeroSection />
      <FeaturesSection />
      <EmotionAiSection />
      <DiagnosticTestSection />
      <RemedialVideoSection />
      <EWorksheetSection />
      <RolesSection />
      <HowItWorksSection />
      <DemoAccountSection />
      <CtaSection />
    </LandingLayout>
  );
}
