"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { signOut, useSession } from "next-auth/react"; // Adicionado useSession

export default function Sidebar() {
  const { data: session } = useSession(); // Recupera os dados da sessão
  const [hovered, setHovered] = useState<string | null>(null);

  // Verifica se o usuário tem a role necessária (case-insensitive para evitar erros de banco)
  const isAdmin = session?.user?.role?.toUpperCase() === "ADMIN";

  const itemStyle = (name: string, active = false) => ({
    width: "100%",
    padding: "14px 18px",
    borderRadius: "18px",
    color: active || hovered === name
    ? "#fafafa"
    : "var(--tertiary-color)",
    background:
  hovered === name || active
    ? "rgba(0, 0, 0, 0.85)"
    : "rgba(2, 2, 2, 0.55)",
    border: active
      ? "1px solid rgba(24, 1, 1, 0.99)"
      : "1px solid rgba(255,255,255,0.08)",
    boxShadow: active
      ? "0 12px 24px rgba(238, 70, 9, 0.28)"
      : hovered === name
      ? "0 8px 18px rgba(0,0,0,0.12)"
      : "none",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    fontSize: "18px",
    fontWeight: active ? 700 : 500,
    letterSpacing: "-0.02em",
    textAlign: "center" as const,
    transition: "all 0.25s ease",
    transform: hovered === name ? "translateY(-1px)" : "translateY(0)",
    boxSizing: "border-box" as const,
  });

  return (
    <aside
      style={{
        width: "240px",
        height: "100vh",
        padding: "28px 16px",
        background:
          "linear-gradient(180deg, rgba(53, 108, 190, 0.5) 0%, rgba(76, 108, 133, 0.22) 100%)",
        borderRight: "1px solid rgba(3, 3, 3, 0.08)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "28px",
        boxSizing: "border-box",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          marginTop: "6px",
          marginBottom: "8px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <Logo />
      </div>

      <nav
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <Link href="/dashboard/home" style={{ textDecoration: "none" }}>
          <div
            style={itemStyle("home")}
            onMouseEnter={() => setHovered("home")}
            onMouseLeave={() => setHovered(null)}
          >
            Home
          </div>
        </Link>

        <Link href="/dashboard/tasks" style={{ textDecoration: "none" }}>
          <div
            style={itemStyle("tasks")}
            onMouseEnter={() => setHovered("tasks")}
            onMouseLeave={() => setHovered(null)}
          >
            Tasks
          </div>
        </Link>

        {/* PROFILE */}
        <Link href="/dashboard/profile" style={{ textDecoration: "none" }}>
          <div
            style={itemStyle("profile")}
            onMouseEnter={() => setHovered("profile")}
            onMouseLeave={() => setHovered(null)}
          >
            Profile
          </div>
        </Link>

        {/* USER MANAGEMENT - Visível apenas para ADMIN */}
        {isAdmin && (
          <Link href="/dashboard/users" style={{ textDecoration: "none" }}>
            <div
              style={itemStyle("users")}
              onMouseEnter={() => setHovered("users")}
              onMouseLeave={() => setHovered(null)}
            >
              User Management
            </div>
          </Link>
        )}

        {/* SIGN OUT */}
        <div
          style={itemStyle("auth")}
          onMouseEnter={() => setHovered("auth")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Sign Out
        </div>
      </nav>
    </aside>
  );
}