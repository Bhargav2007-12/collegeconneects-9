import { useEffect } from "react";
import AdvisorsSection from "../../sections/AdvisorsSection";
import CTASection from "../../sections/CTASection";
import HeroSection from "../../sections/HeroSection";
import HowItWorksSection from "../../sections/HowItWorksSection";
import TestimonialsSection from "../../sections/TestimonialsSection";
import WhySection from "../../sections/WhySection";

export default function HomePage() {
  useEffect(() => {
    document.title = "CollegeConnect — Find Your College Advisor";
  }, []);

  return (
    <main>
      <HeroSection />
      <HowItWorksSection />
      <AdvisorsSection />
      <WhySection />
      <TestimonialsSection />
      <CTASection />
    </main>
  );
}