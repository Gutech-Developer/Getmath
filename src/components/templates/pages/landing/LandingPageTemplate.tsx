import HeroSection from "@/components/organisms/landing/HeroSection";
import AboutSection from "@/components/organisms/landing/AboutSection";
import FeaturesSection from "@/components/organisms/landing/FeaturesSection";
import RolesSection from "@/components/organisms/landing/RolesSection";
import HowItWorksSection from "@/components/organisms/landing/HowItWorksSection";
import TestimonialSection from "@/components/organisms/landing/TestimonialSection";
import CtaSection from "@/components/organisms/landing/CtaSection";
import LandingLayout from "@/components/templates/layouts/LandingLayout";

export default function LandingPageTemplate() {
  return (
    <LandingLayout>
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <RolesSection />
      <HowItWorksSection />
      <TestimonialSection />
      <CtaSection />
    </LandingLayout>
  );
}
