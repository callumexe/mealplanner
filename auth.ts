// auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email:      { label: "Email", type: "email" },
        password:   { label: "Password", type: "password" },
        loginToken: { label: "Login Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        await connectDB();
        const user = await User.findOne({ email: credentials.email }) as any;
        if (!user) return null;
        if (!user.verified) return null;

        if (credentials.loginToken) {
          if (user.loginToken !== credentials.loginToken) return null;
          if (!user.loginTokenExpiry || new Date() > user.loginTokenExpiry) return null;

          await User.updateOne(
            { email: credentials.email },
            { $unset: { loginToken: "", loginTokenExpiry: "" } }
          );

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        }

        // Normal password login
        if (!credentials.password) return null;
        const valid = await bcrypt.compare(credentials.password as string, user.password);
        if (!valid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) session.user.id = token.id as string;
      if (token?.role) (session.user as any).role = token.role;
      return session;
    },
  },
  pages: { signIn: "/auth" },
  session: { strategy: "jwt" },
});