"use client";

import Link from "next/link";

export default function AuthButtons() {
  return (
    <>
      <Link href="/login?mode=email_login" style={{ textDecoration: "none", width: "100%" }}>
        <button
          style={{
            width: "100%",
            padding: "14px 20px",
            backgroundColor: "#F7C59F",
            color: "black",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: 600,
            boxShadow: "0 8px 20px rgba(239, 162, 9, 0.25)",
          }}
        >
          SIGN IN
        </button>
      </Link>

      <Link href="/login?mode=signup" style={{ textDecoration: "none", width: "100%" }}>
        <button
          style={{
            width: "100%",
            padding: "14px 20px",
            backgroundColor: "#EFEFD0",
            color: "black",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: 600,
            boxShadow: "0 8px 20px rgba(223, 175, 91, 0.25)",
          }}
        >
          REGISTER
        </button>
      </Link>
    </>
  );
}