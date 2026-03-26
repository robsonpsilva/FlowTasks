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

  const getStyle = (name: string) => ({
    width: "100%",
    padding: "14px 16px",
    backgroundColor: hovered === name ? "#38bdf8" : "transparent",
    color: "white",
    border: "1px solid #374151",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
    textAlign: "left" as const,
    transition: "0.2s",
  });

  return (
    <aside
      style={{
        width: "220px",
        minHeight: "100vh",
        backgroundColor: "#111827",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 16px",
        borderRight: "1px solid #1f2937",
      }}
    >
      <Logo />

      <nav
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {/* HOME */}
        <Link href="/dashboard/home" style={{ textDecoration: "none" }}>
          <div
            style={getStyle("home")}
            onMouseEnter={() => setHovered("home")}
            onMouseLeave={() => setHovered(null)}
          >
            Home
          </div>
        </Link>

        {/* TASKS */}
        <Link href="/dashboard/tasks" style={{ textDecoration: "none" }}>
          <div
            style={getStyle("tasks")}
            onMouseEnter={() => setHovered("tasks")}
            onMouseLeave={() => setHovered(null)}
          >
            Tasks
          </div>
        </Link>

        {/* PROFILE */}
        <Link href="/dashboard/profile" style={{ textDecoration: "none" }}>
          <div
            style={getStyle("profile")}
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
              style={getStyle("users")}
              onMouseEnter={() => setHovered("users")}
              onMouseLeave={() => setHovered(null)}
            >
              User Management
            </div>
          </Link>
        )}

        {/* SIGN OUT */}
        <div
          style={getStyle("auth")}
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