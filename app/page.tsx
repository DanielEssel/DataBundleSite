import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import StepsSection from "@/components/StepsSection";
import AvailableNetworks from "@/components/AvailableNetworks";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Fast & Reliable <span className="text-blue-600">Data Bundle</span> Delivery
          </h1>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Buy MTN, Vodafone, or AirtelTigo data instantly — no delays, no stress.
          </p>
          <Button
            asChild
            className="bg-blue-600 text-white px-8 py-4 rounded-full font-medium hover:bg-blue-700 transition shadow"
          >
            <a href="/dashboard/user">Get Started</a>
          </Button>
        </div>
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
