import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role: string;
      gymId: string;
      id: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    gymId: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    gymId: string;
    id: string;
  }
}
