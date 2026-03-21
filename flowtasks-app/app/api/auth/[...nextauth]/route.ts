import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { socialAuthService } from "@/app/services/socialAuthService";
import { userService } from "@/app/services/userService";
import bcrypt from "bcryptjs";

const authOptions = {
  // Session Configuration (Required for Credentials Provider)
  session: {
    strategy: "jwt" as const,
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        roleId: { label: "Role ID", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // 1. SINGLE DATABASE CALL: Fetch profile, password, and role at once
        const user = await userService.findProfilebyEmail(credentials.email as string);
        
        console.log("🔍 [Auth] Login attempt for:", credentials.email);

        if (!user) {
          console.error("❌ [Auth] User not found in database.");
          throw new Error("User not found.");
        }

        // 2. PASSWORD VERIFICATION
        // Ensure your findProfilebyEmail SQL query includes the 'password' column
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password as string, 
          user.password
        );

        if (!isPasswordCorrect) {
          console.error("❌ [Auth] Invalid password provided.");
          throw new Error("Invalid password.");
        }

        // 3. ROLE VALIDATION
        // Compare the Role ID selected in the UI with the one stored in the DB
        if (String(user.roleid) !== String(credentials.roleId)) {
          console.error(`❌ [Auth] Role mismatch. Expected: ${user.roleId}, Got: ${credentials.roleId}`);
          throw new Error("Selected role does not match your account profile.");
        }

        console.log("✅ [Auth] Authorization successful for:", user.email);

        // Return the object to be encoded in the JWT
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role_name // Role name from the DB JOIN
        };
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      // Social Provider Logic (Google)
      if (account?.provider === "google") {
        try {
          console.log("🔵 [SignIn] Syncing Google user...");
          const dbUser = await socialAuthService.findOrCreateUser({
            name: user.name ?? "Google User",
            email: user.email,
            provider_id: 1, 
            external_uid: account.providerAccountId,
          });
          user.id = dbUser.id;
          return true;
        } catch (error) {
          console.error("❌ [SignIn] Social Sync Error:", error);
          return false;
        }
      }
      // For Credentials, 'authorize' has already validated the user
      return true;
    },

    async jwt({ token, user }: any) {
      // 'user' is only available on the first call (login)
      if (user) {
        token.userId = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.userId;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // Custom login page
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// NextAuth v5 Route Handler Initialization
const { handlers } = NextAuth(authOptions);

export const GET = handlers.GET;
export const POST = handlers.POST;

console.log("🚀 NextAuth v5 initialized successfully");