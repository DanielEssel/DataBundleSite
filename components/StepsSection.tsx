"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Smartphone, CreditCard, CheckCircle } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Choose Your Network",
    description:
      "Select your preferred network — MTN, Vodafone, or AirtelTigo — and pick a data bundle that suits you.",
    icon: Smartphone,
    image: "/image/steps/select.png", // add image in public/images/steps/
  },
  {
    id: 2,
    title: "Make Payment",
    description:
      "Pay securely using Mobile Money or card via Paystack. Your transaction is processed instantly.",
    icon: CreditCard,
    image: "/image/steps/pay.png",
  },
  {
    id: 3,
    title: "Receive Data Instantly",
    description:
      "Your data bundle will be delivered to your number within seconds. Fast, reliable, and seamless.",
    icon: CheckCircle,
    image: "/image/steps/success.png",
  },
];

export default function StepsSection() {
  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 text-center">
        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-4"
        >
          How to Buy Data on{" "}
          <span className="text-blue-600">AcDataHub</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 mb-12 max-w-2xl mx-auto"
        >
          Follow these 3 easy steps to purchase your preferred data bundle in seconds.
        </motion.p>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-lg hover:-translate-y-1 transition-transform duration-300"
            >
              {/* Step Image */}
              <div className="relative w-28 h-28 mx-auto mb-4">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  className="object-contain"
                />
              </div>

              {/* Fallback Icon (in case image fails) */}
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mx-auto mb-4 md:hidden">
                <step.icon size={28} />
              </div>

              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
