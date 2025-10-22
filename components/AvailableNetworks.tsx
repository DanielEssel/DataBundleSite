"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const networks = [
  {
    id: 1,
    name: "MTN",
    logo: "/logos/mtn.png",
    color: "from-yellow-50 to-yellow-100",
    textColor: "text-yellow-600",
    description:
      "Get instant MTN data bundles delivered directly to your number within seconds.",
  },
  {
    id: 2,
    name: "Telecel",
    logo: "/logos/tel.png",
    color: "from-red-50 to-red-100",
    textColor: "text-red-600",
    description:
      "Enjoy affordable Vodafone bundles and reliable connectivity anytime, anywhere.",
  },
  {
    id: 3,
    name: "AirtelTigo",
    logo: "/logos/at.png",
    color: "from-blue-50 to-blue-100",
    textColor: "text-blue-600",
    description:
      "Top up your AirtelTigo bundles instantly and stay connected with friends and family.",
  },
];

export default function AvailableNetworks() {
  return (
    <section id="available-networks" className="py-20 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-6xl mx-auto px-6 text-center">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-4"
        >
          Available <span className="text-blue-600">Networks</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-gray-600 mb-14 max-w-2xl mx-auto"
        >
          We currently support the major telecom networks in Ghana — more coming soon!
        </motion.p>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {networks.map((net, index) => (
            <motion.div
              key={net.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.15 }}
              viewport={{ once: true }}
              className={`bg-gradient-to-b ${net.color} rounded-2xl p-8 shadow-md hover:shadow-lg transition transform hover:-translate-y-1`}
            >
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24 mb-4 drop-shadow-sm">
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
                <p className="text-gray-700 text-sm leading-relaxed">
                  {net.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
