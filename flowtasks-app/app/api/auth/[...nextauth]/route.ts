import NextAuth from "next-auth";
import type { User, Account, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { socialAuthService } from "@/app/services/socialAuthService";
import { userService } from "@/app/services/userService";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Configurações de confiança para o ambiente do Render
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

        // Retornamos o objeto que agora bate com a sua interface User estendida no .d.ts
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
    async signIn({ user, account }: { user: User; account?: Account | null }) {
      // O 'account?' resolve o erro de 'undefined' que o TS apontou
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
          return false; // Aqui o NextAuth redireciona para Access Denied
        }
      }
      return true;
    },

    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        // Mapeamento direto e seguro graças ao seu next-auth.d.ts
        token.userId = user.id;
        token.role = user.role ?? "";
        token.email = user.email;
        token.name = user.name ?? "";
        token.provider = user.provider;
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        // O TS agora sabe que esses campos existem no session.user
        session.user.id = token.userId;
        session.user.role = token.role;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.provider = token.provider;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export const { GET, POST } = handlers;