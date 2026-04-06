import NextAuth from "next-auth";
import type { User, Account, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { socialAuthService } from "@/app/services/socialAuthService";
import { userService } from "@/app/services/userService";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true, 
  secret: process.env.AUTH_SECRET,
  
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
        if (!user) throw new Error("User not found.");

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!isPasswordCorrect) throw new Error("Invalid password.");

        if (String(user.roleid) !== String(credentials.roleId)) {
          throw new Error("Selected role does not match your account profile.");
        }

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role_name,
          provider: "credentials",
          image: user.image || undefined,
        } as User;
      }
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isApiRoute = nextUrl.pathname.startsWith("/api");
      const isPublicPage = nextUrl.pathname === "/" || nextUrl.pathname === "/login";

      const isStaticFile = 
      nextUrl.pathname.startsWith("/icon.png") || 
      nextUrl.pathname.startsWith("/favicon.ico") ||
      nextUrl.pathname.startsWith("/images/");

    if (isApiRoute || isPublicPage || isStaticFile) return true;

      return isLoggedIn;
    },

    async signIn({ user, account }: { user: User; account?: Account | null }) {
      if (account?.provider === "google") {
        try {
          console.log("🔵 [SignIn] Syncing Google user...");
          const dbUser = await socialAuthService.findOrCreateUser({
            name: user.name ?? "Google User",
            email: user.email as string,
            provider_id: 1,
            external_uid: account.providerAccountId,
          });
          
          user.id = String(dbUser.id);
          return true;
        } catch (error) {
          console.error("❌ [SignIn] Social Sync Error:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session }: { token: JWT; user?: any; trigger?: string; session?: any }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role ?? "";
        token.provider = user.provider;
        token.picture = user.image ?? undefined; 
      }

      if (trigger === "update" && session?.user?.image) {
        token.picture = session.user.image;
      }

      return token;
    },

    async session({ session, token }: { session: any; token: JWT }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as string;
        session.user.provider = token.provider as string;
        session.user.image = token.picture;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});


export const { GET, POST } = handlers;