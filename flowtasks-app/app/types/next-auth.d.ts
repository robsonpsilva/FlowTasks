import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Estende o objeto 'user' dentro da 'session'
   */
  interface Session {
    user: {
      id: string;
      role: string;
      email: string;
      name: string;
      provider?: string;
      picture?: string;
    } & DefaultSession["user"];
  }

  /**
   * Estende o objeto 'user' retornado no callback 'jwt' e 'signIn'
   */
  interface User {
    id: string;
    role?: string;
    email: string;
    name: string;
    provider?: string;
    picture?: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Estende o token JWT para incluir nossos campos do Postgres
   */
  interface JWT {
    userId: string;
    role: string;
    email: string;
    name: string;
    provider?: string;
    picture?: string;
  }
}
