"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "radial-gradient(circle at top, #004e89 0%, #1A659E 45%, #F7C59F 100%)",
        color: "white",
        padding: "24px",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "480px",
          padding: "36px 28px",
          borderRadius: "24px",
          backgroundColor: "rgba(213, 221, 238, 0.20)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 20px 50px rgba(21, 17, 17, 0.35)",
          backdropFilter: "blur(8px)",
        }}
      >
        <h1
          style={{
            marginBottom: "20px",
            textAlign: "center",
            fontWeight: 800,
          }}
        >
          Sign in
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              style={inputStyle}
            />
          </div>

          <button style={buttonStyle}>Sign in</button>

          <p style={{ textAlign: "center" }}>
            Don’t have an account?{" "}
            <Link href="/register" style={{ color: "#FF6B35" }}>
              Create one
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.2)",
  backgroundColor: "rgba(0,0,0,0.3)",
  color: "white",
};

const buttonStyle = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "none",
  backgroundColor: "#FF6B35",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};