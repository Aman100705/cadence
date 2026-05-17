import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "EMPLOYEE" | "MANAGER" | "ADMIN";
      department?: string;
    } & DefaultSession["user"];
  }
  interface User {
    role: "EMPLOYEE" | "MANAGER" | "ADMIN";
    department?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "EMPLOYEE" | "MANAGER" | "ADMIN";
    department?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: String(credentials.email).toLowerCase() },
        });
        if (!user) return null;

        const ok = await bcrypt.compare(
          String(credentials.password),
          user.passwordHash
        );
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.department = user.department;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.department = token.department;
      }
      return session;
    },
  },
  trustHost: true,
});
