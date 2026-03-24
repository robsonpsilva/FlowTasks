"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import LoginOptions from "@/app/ui/components/auth/LoginOptions";
import CreateAccountFlow from "@/app/ui/components/auth/CreateAccountFlow";
import LoginForm from "@/app/ui/components/auth/LoginForm";

export default function WelcomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Lê o parâmetro "mode" da URL (?mode=email ou ?mode=signup)
  const mode = searchParams.get("mode");

  const [view, setView] = useState<"login_options" | "email_login" | "signup">(
    mode === "email" ? "email_login" : mode === "signup" ? "signup" : "login_options"
  );

  return (
    <main style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "radial-gradient(circle at top, #004e89 0%, #1A659E 45%, #F7C59F 100%)", color: "white", padding: "24px" }}>
      <section style={{ width: "100%", maxWidth: "720px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "24px", padding: "40px 24px", borderRadius: "24px", backgroundColor: "rgba(17, 24, 39, 0.55)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 50px rgba(0,0,0,0.35)", backdropFilter: "blur(6px)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", width: "100%", maxWidth: "360px" }}>
          {view === "login_options" && (
            <LoginOptions
              onBack={() => router.push("/")}
              onEmailClick={() => setView("email_login")}
            />
          )}

          {view === "email_login" && (
            <LoginForm
              onBack={() => setView("login_options")}
              onSuccess={() => (window.location.href = "/dashboard/home")}
            />
          )}

          {view === "signup" && (
            <CreateAccountFlow onBack={() => setView("login_options")} />
          )}
        </div>
      </section>
    </main>
  );
}
