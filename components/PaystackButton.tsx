"use client";

import { PaystackButton } from "react-paystack";

interface PayButtonProps {
  email: string;
  amount: number; // GHS
  phone: string;
  network: string;
  plan: string;
}

export default function PayButton({
  email,
  amount,
  phone,
  network,
  plan,
}: PayButtonProps) {
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";

  const componentProps = {
    email,
    amount: amount * 100, // convert GHS → pesewas
    publicKey,
    text: `Pay ₵${amount}`,
    metadata: {
      custom_fields: [
        {
          display_name: "Phone Number",
          variable_name: "phone_number",
          value: phone,
        },
        {
          display_name: "Network",
          variable_name: "network",
          value: network,
        },
        {
          display_name: "Data Plan",
          variable_name: "plan",
          value: plan,
        },
      ],
    },
    onSuccess: (reference: any) => {
      console.log("✅ Payment successful:", reference);
      alert("Payment successful! Reference: " + reference.reference);
      // Optionally: call backend API to verify payment
    },
    onClose: () => {
      console.log("❌ Payment window closed");
    },
  };

  return (
    <div>
      <PaystackButton
        {...componentProps}
        className="bg-blue-600 text-white w-full py-2.5 rounded-lg hover:bg-blue-700 transition font-medium"
      />
    </div>
  );
}
