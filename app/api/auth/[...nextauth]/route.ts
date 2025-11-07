import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        // Example: simple auth check
        if (credentials?.email === "daniel@example.com" && credentials.password === "1234") {
          return { id: "1", name: "Daniel Kojo Essel", email: "daniel@example.com" };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt", // ✅ now typed correctly
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
