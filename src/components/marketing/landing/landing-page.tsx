import { SiteFooter } from "@/components/layout/site-footer";
import { MainContainer } from "@/components/layout/main-container";
import { LandingBenefitsSection } from "@/components/marketing/landing/benefits-section";
import { LandingCategoriesSection } from "@/components/marketing/landing/categories-section";
import { LandingFeaturesSection } from "@/components/marketing/landing/features-section";
import { LandingFinalCtaSection } from "@/components/marketing/landing/final-cta-section";
import { LandingHeroSection } from "@/components/marketing/landing/hero-section";
import { LandingNewsRingSection } from "@/components/marketing/landing/news-ring-section";
import { LandingHowItWorksSection } from "@/components/marketing/landing/how-it-works-section";
import { LandingWhatIsSection } from "@/components/marketing/landing/what-is-section";
import type { LandingPhotoRingItem } from "@/features/news/services/get-landing-photo-ring";

/**
 * Official Veraz marketing landing — dark editorial layout.
 */
export function LandingPage({ ringItems }: { ringItems: LandingPhotoRingItem[] }) {
  return (
    <div className="landing-page flex min-h-dvh flex-col bg-bg text-ink">
      <MainContainer className="flex-1">
        <LandingHeroSection />
        <LandingNewsRingSection items={ringItems} />
        <LandingWhatIsSection />
        <LandingHowItWorksSection />
        <LandingFeaturesSection />
        <LandingCategoriesSection />
        <LandingBenefitsSection />
        <LandingFinalCtaSection />
      </MainContainer>
      <SiteFooter />
    </div>
  );
}
