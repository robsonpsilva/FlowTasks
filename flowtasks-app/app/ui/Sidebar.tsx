"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { signOut, useSession } from "next-auth/react";

export default function Sidebar() {
  const { data: session } = useSession();
  const [hovered, setHovered] = useState<string | null>(null);

  const isAdmin = session?.user?.role?.toUpperCase() === "ADMIN";

  const itemStyle = (name: string, active = false) => ({
    width: "100%",
    padding: "14px 16px",
    borderRadius: "16px",
    color: active || hovered === name ? "#fafafa" : "var(--tertiary-color)",
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
    fontSize: "16px",
    fontWeight: active ? 700 : 500,
    transition: "all 0.25s ease",
    transform: hovered === name ? "translateY(-1px)" : "translateY(0)",
    boxSizing: "border-box" as const,
    textAlign: "left" as const,
    overflow: "hidden",
    whiteSpace: "nowrap" as const,
    textOverflow: "ellipsis",
  });

  return (
    <aside
      className="h-screen w-full px-2 py-6 md:px-4"
      style={{
        background:
          "linear-gradient(180deg, rgba(53, 108, 190, 0.5) 0%, rgba(76, 108, 133, 0.22) 100%)",
        borderRight: "1px solid rgba(3, 3, 3, 0.08)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px",
        boxSizing: "border-box",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div
        className="flex w-full justify-center md:justify-center"
        style={{
          marginTop: "6px",
          marginBottom: "8px",
        }}
      >
        <Logo />
      </div>

      <nav
        className="w-full flex flex-col gap-3"
      >
        <Link href="/dashboard/home" style={{ textDecoration: "none" }}>
          <div
            style={itemStyle("home")}
            className="flex items-center justify-center md:justify-start"
            onMouseEnter={() => setHovered("home")}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="hidden md:inline">Home</span>
            <span className="md:hidden">H</span>
          </div>
        </Link>

        <Link href="/dashboard/tasks" style={{ textDecoration: "none" }}>
          <div
            style={itemStyle("tasks")}
            className="flex items-center justify-center md:justify-start"
            onMouseEnter={() => setHovered("tasks")}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="hidden md:inline">Tasks</span>
            <span className="md:hidden">T</span>
          </div>
        </Link>

        <Link href="/dashboard/profile" style={{ textDecoration: "none" }}>
          <div
            style={itemStyle("profile")}
            className="flex items-center justify-center md:justify-start"
            onMouseEnter={() => setHovered("profile")}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="hidden md:inline">Profile</span>
            <span className="md:hidden">P</span>
          </div>
        </Link>

        {isAdmin && (
          <Link href="/dashboard/users" style={{ textDecoration: "none" }}>
            <div
              style={itemStyle("users")}
              className="flex items-center justify-center md:justify-start"
              onMouseEnter={() => setHovered("users")}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="hidden md:inline">User Management</span>
              <span className="md:hidden">U</span>
            </div>
          </Link>
        )}

        <div
          style={itemStyle("auth")}
          className="flex items-center justify-center md:justify-start cursor-pointer"
          onMouseEnter={() => setHovered("auth")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <span className="hidden md:inline">Sign Out</span>
          <span className="md:hidden">S</span>
        </div>
      </nav>
    </aside>
  );
}