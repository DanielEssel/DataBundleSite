import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import StepsSection from "@/components/StepsSection";
import AvailableNetworks from "@/components/AvailableNetworks";
import HeroSection from "@/components/Hero";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 bg-gradient-to-b from-white to-gray-50">
       <HeroSection/>
      </section>

      {/* Steps Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <StepsSection />
        </div>
      </section>

      {/* Available Networks */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <AvailableNetworks />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
