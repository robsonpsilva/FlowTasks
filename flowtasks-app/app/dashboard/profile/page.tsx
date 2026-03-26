"use client";

import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session } = useSession();

  const user = session?.user;

  return (
    <section
      style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "40px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "720px",
          backgroundColor: "#111827",
          border: "1px solid #1f2937",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        }}
      >
        <h1
          style={{
            margin: "0 0 24px 0",
            fontSize: "32px",
            textAlign: "center",
          }}
        >
          Profile
        </h1>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}
        >
          {/* Foto do usuário */}
          <div
            style={{
              width: "130px",
              height: "130px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "2px solid #374151",
              backgroundColor: "#0f172a",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {user?.image ? (
              <img
                src={user.image}
                alt="User photo"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ color: "#9ca3af", fontSize: "18px" }}>No Photo</span>
            )}
          </div>

          {/* Campos do formulário */}
          <div
            style={{
              width: "100%",
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "16px",
              marginTop: "8px",
            }}
          >
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>
                Name
              </label>
              <input
                type="text"
                value={user?.name || ""}
                readOnly
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px solid #374151",
                  backgroundColor: "#0f172a",
                  color: "white",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>
                Email
              </label>
              <input
                type="email"
                value={user?.email || ""}
                readOnly
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px solid #374151",
                  backgroundColor: "#0f172a",
                  color: "white",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
