import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          await dbConnect();
          console.log("Auth attempt for:", credentials.email);
          
          const user = await User.findOne({ email: credentials.email });
          if (!user) {
            console.log("User not found in database");
            return null;
          }

          console.log("User found, comparing passwords...");
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password as string,
            user.hashedPassword
          );

          if (!isPasswordCorrect) {
            console.log("Password mismatch for:", credentials.email);
            return null;
          }

          console.log("Auth successful for:", user.name, "Role:", user.role);
          
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            gymId: user.gymId.toString(),
          };
        } catch (error) {
          console.error("CRITICAL AUTH EXCEPTION:", error);
          return null;
        }
      },
    }),
  ],
});

