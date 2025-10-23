// utils/verifyPayment.ts
export async function verifyPayment(reference: string, token: string) {
  try {
    if (!reference) throw new Error("Payment reference is required.");
    if (!token) throw new Error("Authorization token is missing.");

    const API_URL = process.env.NEXT_PUBLIC_API_URL; // Make sure this is set correctly

    const res = await fetch(`${API_URL}/api/payments/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      // Catch HTTP errors (404, 401, etc)
      const text = await res.text();
      throw new Error(`Server error: ${res.status} - ${text}`);
    }

    const data = await res.json();

    if (!data.success) {
      // Catch API-level errors
      throw new Error(`Verification failed: ${data.message || "Unknown error"}`);
    }

    return data.data; // Return the payment info object
  } catch (error: any) {
    console.error("❌ Verification error:", error);
    throw error;
  }
}
