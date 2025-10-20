"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const networks = [
  {
    id: 1,
    name: "MTN",
    logo: "/images/mtn-logo.png", // Make sure to add this image in /public/images/
    color: "bg-yellow-50",
    textColor: "text-yellow-600",
    description:
      "Get instant MTN data bundles delivered directly to your number within seconds.",
  },
  {
    id: 2,
    name: "Vodafone",
    logo: "/images/vodafone-logo.png",
    color: "bg-red-50",
    textColor: "text-red-600",
    description:
      "Enjoy affordable Vodafone bundles and reliable connectivity anytime, anywhere.",
  },
  {
    id: 3,
    name: "AirtelTigo",
    logo: "/images/airteltigo-logo.png",
    color: "bg-blue-50",
    textColor: "text-blue-600",
    description:
      "Top up your AirtelTigo bundles instantly and stay connected with friends and family.",
  },
];

export default function AvailableNetworks() {
  return (
    <section id="available-networks" className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Available <span className="text-blue-600">Networks</span>
        </h2>
        <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
          We currently support the major telecom networks in Ghana. More coming soon!
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {networks.map((net, index) => (
            <motion.div
              key={net.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.2 }}
              viewport={{ once: true }}
              className={`rounded-2xl p-8 shadow-sm border hover:shadow-md transition ${net.color}`}
            >
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24 mb-4">
                  <Image
                    src={net.logo}
                    alt={net.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${net.textColor}`}>
                  {net.name}
                </h3>
                <p className="text-gray-600 text-sm">{net.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
