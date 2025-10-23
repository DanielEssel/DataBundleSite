// app/payment/success/page.tsx
"use client";

import { Suspense } from "react";
import SuccessPageContent from "@/components/SuccessPageContent";

export default function SuccessPage() {
  // ✅ Wrap the component that calls useSearchParams in Suspense
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading payment details...
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
