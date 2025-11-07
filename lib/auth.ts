import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Example using credentials provider. You can swap with Google, GitHub, etc.
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Here you validate credentials
        if (!credentials) return null;

        // Example: replace with your DB lookup
        if (
          credentials.email === "test@example.com" &&
          credentials.password === "password123"
        ) {
          return {
            id: "1",
            name: "Test User",
            email: "test@example.com",
            image: "", // optional
          };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin", // Optional: custom login page
  },
};
