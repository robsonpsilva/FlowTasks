"use client";
import { useState } from "react";
import Link from "next/link";
import Logo from "../components/Logo";

export default function Sidebar() {
  const [hovered, setHovered] = useState<string | null>(null);

  const getStyle = (name: string) => ({
    width: "100%",
    padding: "14px 16px",
    backgroundColor:
      hovered === name ? "#38bdf8" : "transparent",
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
        <Link href="/home" style={{ textDecoration: "none" }}>
          <div
            style={getStyle("home")}
            onMouseEnter={() => setHovered("home")}
            onMouseLeave={() => setHovered(null)}
          >
            Home
          </div>
        </Link>

        {/* TASKS */}
        <Link href="/tasks" style={{ textDecoration: "none" }}>
          <div
            style={getStyle("tasks")}
            onMouseEnter={() => setHovered("tasks")}
            onMouseLeave={() => setHovered(null)}
          >
            Tasks
          </div>
        </Link>

        {/* PROFILE */}
        <Link href="/profile" style={{ textDecoration: "none" }}>
          <div
            style={getStyle("profile")}
            onMouseEnter={() => setHovered("profile")}
            onMouseLeave={() => setHovered(null)}
          >
            Profile
          </div>
        </Link>

        {/* AUTH */}
        <Link href="/login" style={{ textDecoration: "none" }}>
          <div
            style={getStyle("auth")}
            onMouseEnter={() => setHovered("auth")}
            onMouseLeave={() => setHovered(null)}
          >
            Sign Out
          </div>
        </Link>
      </nav>
    </aside>
  );
}