"use client";

import { useState } from "react";
import Sidebar from "../ui/components/Sidebar";

export default function ProfilePage() {
  const [user, setUser] = useState({
    username: "sweep",
    firstName: "Gabriela",
    lastName: "Rivera",
    email: "gabriela@email.com",
  });

  return (
    <main
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#0a0a0a",
        color: "white",
      }}
    >
      <Sidebar />

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
            <div
              style={{
                width: "130px",
                height: "130px",
                borderRadius: "12px",
                border: "1px solid #374151",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#0f172a",
                color: "#9ca3af",
                fontSize: "18px",
              }}
            >
              Photo
            </div>

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
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "bold",
                  }}
                >
                  User Name
                </label>
                <input
                  type="text"
                  value={user.username}
                  onChange={(e) =>
                    setUser({ ...user, username: e.target.value })
                  }
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
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "bold",
                  }}
                >
                  Name
                </label>
                <input
                  type="text"
                  value={user.firstName}
                  onChange={(e) =>
                    setUser({ ...user, firstName: e.target.value })
                  }
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
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "bold",
                  }}
                >
                  Last Name
                </label>
                <input
                  type="text"
                  value={user.lastName}
                  onChange={(e) =>
                    setUser({ ...user, lastName: e.target.value })
                  }
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
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "bold",
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  onChange={(e) =>
                    setUser({ ...user, email: e.target.value })
                  }
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
    </main>
  );
}