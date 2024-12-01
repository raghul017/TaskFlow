import Hero from "@/components/layout/Hero";
import Features from "@/components/features/Features";
import PricingCards from "@/components/features/PricingCards";
import Testimonials from "@/components/features/Testimonials";
import IntegrationGrid from "@/components/features/IntegrationGrid";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <IntegrationGrid />
      <PricingCards />
      <Testimonials />
    </>
  );
}
