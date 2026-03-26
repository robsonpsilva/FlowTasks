import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { socialAuthService } from "@/app/services/socialAuthService";
import { userService } from "@/app/services/userService";
import bcrypt from "bcryptjs";

const authOptions = {
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

        const user = await userService.findProfilebyEmail(credentials.email as string);
        console.log("🔍 [Auth] Login attempt for:", credentials.email);

        if (!user) throw new Error("User not found.");

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!isPasswordCorrect) throw new Error("Invalid password.");

        if (String(user.roleid) !== String(credentials.roleId)) {
          throw new Error("Selected role does not match your account profile.");
        }

        console.log("✅ [Auth] Authorization successful for:", user.email);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role_name,
          provider: "credentials",
          picture: user.image || undefined, // login local não tem foto
        };
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account }: any) {
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
          user.provider = "google";
          user.picture = user.image; // foto fornecida pelo Google
          return true;
        } catch (error) {
          console.error("❌ [SignIn] Social Sync Error:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }: any) {
      if (user) {
        token.userId = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
        token.provider = user.provider;
        token.picture = user.picture;
      }
      return token;
    },

    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.userId;
        session.user.role = token.role;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.provider = token.provider;
        session.user.picture = token.picture;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const { handlers } = NextAuth(authOptions);

export const GET = handlers.GET;
export const POST = handlers.POST;

console.log("🚀 NextAuth v5 initialized successfully");
