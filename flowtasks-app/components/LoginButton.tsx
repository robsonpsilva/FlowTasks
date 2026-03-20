'use client';

import { signIn } from "next-auth/react";

export default function LoginButton() {
  return (
    <button 
      onClick={() => signIn("google", { callbackUrl: "/" })}
      className="bg-blue-600 text-white px-4 py-2 rounded shadow"
    >
      Entrar com Google
    </button>
  );
}