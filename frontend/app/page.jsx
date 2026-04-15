import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorks from '@/components/landing/HowItWorks';
import PricingSection from '@/components/landing/PricingSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';

/**
 * Public SaaS marketing landing page.
 */
export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorks />
        <PricingSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
