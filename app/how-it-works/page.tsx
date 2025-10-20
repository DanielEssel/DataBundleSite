"use client";

import { Button } from "@/components/ui/button";
import { Smartphone, CreditCard, CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

export default function HowItWorksPage() {
  const steps = [
    {
      id: 1,
      title: "Select Your Network & Bundle",
      icon: <Smartphone className="w-10 h-10 text-blue-600" />,
      description:
        "Choose from MTN, Vodafone, or AirtelTigo bundles. Our plans are affordable and available 24/7 to keep you connected.",
    },
    {
      id: 2,
      title: "Enter Your Phone Number",
      icon: <CreditCard className="w-10 h-10 text-blue-600" />,
      description:
        "Provide the phone number that should receive the data. Double-check to ensure instant and correct delivery.",
    },
    {
      id: 3,
      title: "Make Payment Securely",
      icon: <Zap className="w-10 h-10 text-blue-600" />,
      description:
        "Pay quickly using Mobile Money or debit card through our trusted Paystack gateway. Your details are always safe.",
    },
    {
      id: 4,
      title: "Receive Data Instantly",
      icon: <CheckCircle2 className="w-10 h-10 text-blue-600" />,
      description:
        "Once payment is successful, your data bundle is automatically credited within seconds — no manual steps needed.",
    },
  ];

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="text-center py-24 bg-white border-b">
        <div className="max-w-4xl mx-auto px-6">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold mb-4"
          >
            How It <span className="text-blue-600">Works</span>
          </motion.h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Follow these simple steps to purchase data bundles instantly on our
            platform — fast, reliable, and automated.
          </p>
        </div>
      </section>

      {/* Timeline Steps Section */}
      <section className="flex-1 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 relative">
          {/* Horizontal Line for desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-blue-100 transform -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative flex flex-col items-center text-center bg-white rounded-2xl shadow-sm hover:shadow-md transition p-8 border"
              >
                {/* Connector dot */}
                <div className="absolute -top-5 md:top-auto md:-bottom-10 w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-md md:static md:mb-4" />

                <div className="mb-4">{step.icon}</div>
                <h3 className="font-semibold text-lg mb-2 text-gray-800">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm">{step.description}</p>

                {/* Connector line (mobile vertical) */}
                {index !== steps.length - 1 && (
                  <div className="md:hidden absolute bottom-0 left-1/2 w-[2px] h-10 bg-blue-100 transform translate-y-full -translate-x-1/2" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            Why Choose DataServe?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            We combine speed, reliability, and automation to ensure you get your
            data bundles whenever you need them — instantly.
          </p>

          <div className="grid md:grid-cols-3 gap-8 text-gray-700">
            <div className="p-6 bg-white rounded-xl shadow-sm border hover:shadow-md transition">
              <h4 className="font-semibold text-lg mb-2">Instant Delivery</h4>
              <p className="text-sm">
                Our system automatically credits your number immediately after
                payment — no waiting.
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm border hover:shadow-md transition">
              <h4 className="font-semibold text-lg mb-2">Affordable Pricing</h4>
              <p className="text-sm">
                Get data bundles at competitive rates. We keep costs low so you
                can save more every time.
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm border hover:shadow-md transition">
              <h4 className="font-semibold text-lg mb-2">Secure Payments</h4>
              <p className="text-sm">
                Pay safely through Mobile Money or cards using Paystack’s secure
                and verified gateway.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-gray-600 mb-8 max-w-xl mx-auto">
          Join thousands of users who already enjoy instant and reliable data
          bundle top-ups every day.
        </p>
        <Button
          asChild
          className="bg-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-700 transition"
        >
          <Link href="/dashboard/user">Buy Data Now</Link>
        </Button>
      </section>

      <Footer />
    </main>
  );
}
