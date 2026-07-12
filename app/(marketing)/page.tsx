import { HeroSection } from "@/components/marketing/hero-section";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { ModesSection } from "@/components/marketing/modes-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { PhilosophySection } from "@/components/marketing/philosophy-section";
import { TechStackSection } from "@/components/marketing/tech-stack-section";
import { SelfHostSection } from "@/components/marketing/self-host-section";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <ModesSection />
      <FeaturesSection />
      <PhilosophySection />
      <TechStackSection />
      <SelfHostSection />
    </>
  );
}
