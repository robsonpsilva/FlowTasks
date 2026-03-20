import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { socialAuthService } from "@/app/services/socialAuthService";
import { userService } from "@/app/services/userService";

// 1. Configurações do NextAuth separadas em uma constante
const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      console.log("🔵 [signIn] Início", { user, account });

      if (!user.email || !account?.providerAccountId) {
        console.error("Login bloqueado: email ou providerAccountId ausente");
        return false;
      }

      try {
        const dbUser = await socialAuthService.findOrCreateUser({
          name: user.name ?? "Google User",
          email: user.email,
          provider_id: 1,
          external_uid: account.providerAccountId,
        });

        console.log("✅ [signIn] Usuário sincronizado no banco", dbUser);

        // Injeta o id do banco no objeto user para ser usado no jwt
        user.id = dbUser.id;

        return true;
      } catch (error) {
        console.error("❌ [signIn] Erro durante social sync:", error);
        return false;
      }
    },

    async jwt({ token, user }: any) {
      // O 'user' só está disponível na primeira chamada (login)
      if (user) {
        console.log("🔵 [jwt] Início (Login)", { token, user });
        try {
          const profile = await userService.findProfilebyEmail(user.email);
          console.log("✅ [jwt] Perfil encontrado", profile);

          token.role = profile?.role_name || "GUEST";
          token.userId = user.id;
        } catch (error) {
          console.error("❌ [jwt] Erro ao buscar perfil:", error);
          token.role = "GUEST";
        }
      }
      return token;
    },

    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.userId;
        session.user.role = token.role;
        console.log("✅ [session] Session atualizada", session.user);
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// 2. Inicializa o NextAuth (Auth.js v5)
// No log você viu que ele retorna { handlers: { GET, POST }, ... }
const result = NextAuth(authOptions);

// 3. Extrai e exporta os handlers de dentro do objeto
// Isso resolve o erro 'Function.prototype.apply'
export const GET = result.handlers.GET;
export const POST = result.handlers.POST;

// --- LOGS DE DEBUG NO TERMINAL DO MAC ---
console.log("✅ NextAuth v5 inicializado corretamente");
console.log("Tipo do objeto retornado:", typeof result);