import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [], // Added in auth.ts
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
        token.gymId = (user as { gymId: string }).gymId;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string;
        session.user.gymId = token.gymId as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login/owner",
    error: "/login/owner",
  },
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig;
