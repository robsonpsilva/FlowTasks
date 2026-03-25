"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
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
          maxWidth: "520px",
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
            margin: 0,
            marginBottom: "10px",
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 800,
            textAlign: "center",
            color: "white",
          }}
        >
          Create Account
        </h1>

        <p
          style={{
            textAlign: "center",
            marginBottom: "28px",
            color: "var(--tertiary-color)",
            fontSize: "16px",
          }}
        >
          Complete your information to create your FlowTask account.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div>
            <label style={labelStyle}>First Name</label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              style={inputStyle}
              placeholder="Enter your first name"
            />
          </div>

          <div>
            <label style={labelStyle}>Last Name</label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              style={inputStyle}
              placeholder="Enter your last name"
            />
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              style={inputStyle}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              style={inputStyle}
              placeholder="Create a password"
            />
          </div>

          <div>
            <label style={labelStyle}>Confirm Password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              style={inputStyle}
              placeholder="Confirm your password"
            />
          </div>

          <button style={buttonStyle}>
            Create account
          </button>

          <p
            style={{
              textAlign: "center",
              marginTop: "8px",
              color: "white",
            }}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              style={{
                color: "var(--secondary-color)",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontWeight: 700,
  color: "white",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.15)",
  backgroundColor: "rgba(0,0,0,0.35)",
  color: "white",
  boxSizing: "border-box" as const,
  outline: "none",
};

const buttonStyle = {
  width: "100%",
  padding: "14px 18px",
  borderRadius: "14px",
  border: "none",
  backgroundColor: "var(--secondary-color)",
  color: "white",
  fontWeight: 700,
  fontSize: "16px",
  cursor: "pointer",
  marginTop: "8px",
  boxShadow: "0 10px 20px rgba(255,107,53,0.25)",
};