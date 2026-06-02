"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Wifi, Zap, ShieldCheck, Clock } from "lucide-react";

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial:     { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0  },
  transition:  { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
  viewport:    { once: true },
});

const fadeIn = (delay = 0) => ({
  initial:     { opacity: 0 },
  whileInView: { opacity: 1  },
  transition:  { duration: 0.6, delay },
  viewport:    { once: true },
});

// ─── Trust pills ──────────────────────────────────────────────────────────────

const TRUST_ITEMS = [
  { icon: Zap,         label: "Instant delivery" },
  { icon: ShieldCheck, label: "Secure payments"  },
  { icon: Clock,       label: "10–20 min max"    },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">

      {/* ── Background ───────────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 -left-20 w-96 h-96 rounded-full bg-blue-200/25 blur-[80px]" />
      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(circle, #2563eb 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 md:px-12 pt-20 pb-16 md:pt-28 md:pb-24 flex flex-col md:flex-row items-center gap-14 md:gap-8">

        {/* ── Left: copy ──────────────────────────────────────────────────── */}
        <div className="flex-1 text-center md:text-left max-w-xl">

          {/* Eyebrow */}
          <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Wifi className="w-3.5 h-3.5" />
            MTN · Vodafone · AirtelTigo · Telecel
          </motion.div>

          {/* Headline */}
          <motion.h1
            {...fadeUp(0.08)}
            className="text-[2.6rem] sm:text-5xl md:text-[3.25rem] font-extrabold leading-[1.1] tracking-tight text-gray-950 mb-5"
          >
            Fast &amp; Reliable{" "}
            <span className="relative inline-block text-blue-600">
              Data Bundles
              {/* Squiggle underline */}
              <svg
                viewBox="0 0 220 10"
                className="absolute -bottom-2 left-0 w-full"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 7 Q55 1 110 6 Q165 11 218 4"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <br />
            at Your Fingertips
          </motion.h1>

          {/* Subheading */}
          <motion.p
            {...fadeUp(0.16)}
            className="text-gray-500 text-base sm:text-lg leading-relaxed mb-8 max-w-md mx-auto md:mx-0"
          >
            Buy data for any network in seconds — instant delivery, secure payments,
            and zero stress. Top up yourself or someone else from anywhere.
          </motion.p>

          {/* CTAs */}
          <motion.div
            {...fadeUp(0.22)}
            className="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start mb-10"
          >
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white px-8 py-3 h-auto rounded-2xl font-semibold text-base shadow-lg shadow-blue-200 transition-all"
            >
              <a href="/bundles">Buy Data Now</a>
            </Button>
            <a
              href="/dashboard/user"
              className="text-sm font-medium text-gray-500 hover:text-blue-600 underline underline-offset-4 decoration-gray-200 hover:decoration-blue-400 transition-colors"
            >
              View my orders →
            </a>
          </motion.div>

          {/* Trust pills */}
          <motion.div
            {...fadeIn(0.32)}
            className="flex flex-wrap items-center gap-3 justify-center md:justify-start"
          >
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full"
              >
                <Icon className="w-3.5 h-3.5 text-blue-500" />
                {label}
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Right: image ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.96 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="flex-1 flex items-center justify-center"
        >
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-[440px] md:h-[440px]">
            <div className="absolute inset-0 rounded-full bg-blue-400/15 blur-3xl scale-110" />
            <div className="absolute inset-4 rounded-full border-2 border-blue-100/60" />
            <Image
              src="/image/heroimg.png"
              alt="Data bundle illustration"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
        </motion.div>
      </div>

      {/* ── Bottom wave ───────────────────────────────────────────────────── */}
      <div className="relative h-10 overflow-hidden">
        <svg
          viewBox="0 0 1440 40"
          className="absolute bottom-0 w-full"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 40 Q360 0 720 20 Q1080 40 1440 10 L1440 40 Z" fill="#f9fafb" />
        </svg>
      </div>
    </section>
  );
}