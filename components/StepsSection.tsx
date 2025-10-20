import { Smartphone, CreditCard, CheckCircle } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "1. Choose Your Network",
    description:
      "Select your preferred network — MTN, Vodafone, or AirtelTigo — and pick a data bundle that suits you.",
    icon: Smartphone,
  },
  {
    id: 2,
    title: "2. Make Payment",
    description:
      "Pay securely using Mobile Money or card via Paystack. Your transaction is processed instantly.",
    icon: CreditCard,
  },
  {
    id: 3,
    title: "3. Receive Data Instantly",
    description:
      "Your data bundle will be delivered to your number within seconds. Fast, reliable, and seamless.",
    icon: CheckCircle,
  },
];

export default function StepsSection() {
  return (
    <section id="how-it-works" className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          How to Buy Data on <span className="text-blue-600">DataServe</span>
        </h2>
        <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
          Follow these 3 quick steps to purchase your preferred data bundle in seconds.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div
              key={step.id}
              className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mx-auto mb-4">
                <step.icon size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
