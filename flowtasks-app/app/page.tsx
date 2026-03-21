import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  /**
   * DIRECT TOKEN CHECK SECTION (Analyst Note: Quick Guarding)
   * ---------------------------------------------------------
   * We access the browser's cookies directly on the server side.
   * NextAuth stores the session in a cookie named "next-auth.session-token"
   * (or "__Secure-next-auth.session-token" if you are using HTTPS/Production).
   * If neither exists, we assume the user is not logged in.
   */
  const cookieStore = await cookies();
  const token = cookieStore.get("next-auth.session-token") || 
                cookieStore.get("__Secure-next-auth.session-token");

  // If no token is found, redirect the user to the login page immediately
  if (!token) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        
        {/* Banner de Confirmação para o Desenvolvedor */}
        <div className="mb-8 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
          <strong>Security Check:</strong> JWT Cookie detected. Access granted.
        </div>

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Welcome to the FlowTask Protected Home.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            The system verified your session token. You are now inside the internal environment.
          </p>
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="/login" 
          >
            Go to Login
          </a>
        </div>
      </main>
    </div>
  );
}