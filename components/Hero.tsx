"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Wifi } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-24 bg-gradient-to-b from-white via-blue-50 to-blue-100 overflow-hidden">
      {/* Decorative Backgrounds */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-300 rounded-full blur-[120px] opacity-40" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-200 rounded-full blur-[100px] opacity-30" />

      {/* Left Content */}
      <div className="relative z-10 flex-1 text-center md:text-left">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 text-gray-900"
        >
          Fast & Reliable{" "}
          <span className="inline-flex items-center text-blue-600">
            <Wifi className="w-10 h-10 md:w-12 md:h-12 mr-2 text-blue-500" /> Bundles
          </span>{" "}
          at Your Fingertips
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 text-lg md:text-xl mb-8 max-w-2xl mx-auto md:mx-0"
        >
          Buy MTN, Vodafone, or AirtelTigo data in seconds — instant delivery,
          secure payments, and zero stress.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            asChild
            className="bg-blue-600 text-white px-10 py-4 rounded-full font-medium text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
          >
            <a href="/bundles">Buy Data</a>
          </Button>
        </motion.div>
      </div>

      {/* Hero Image (Blended Style) */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
        className="relative mt-12 md:mt-0 flex-1 flex justify-center"
      >
        <div className="relative w-72 h-72 md:w-[420px] md:h-[420px]">
          {/* Glow Behind Image */}
          <div className="absolute inset-0 bg-blue-400/20 blur-3xl rounded-full scale-125" />
          <Image
            src="/image/heroimg.png"
            alt="AcDataHub data illustration"
            fill
            className="object-contain mix-blend-multiply md:mix-blend-normal drop-shadow-2xl"
            priority
          />
        </div>
      </motion.div>
    </section>
  );
}
