"use client";

import { useRef, useState } from "react";

type UserProfile = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  googlePhoto: string | null;
  localPhoto: string | null;
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile>({
    username: "sweep",
    firstName: "Gabriela",
    lastName: "Rivera",
    email: "gabriela@email.com",
    googlePhoto: null,
    localPhoto: null,
  });

  const [originalUser, setOriginalUser] = useState<UserProfile>({
    username: "sweep",
    firstName: "Gabriela",
    lastName: "Rivera",
    email: "gabriela@email.com",
    googlePhoto: null,
    localPhoto: null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const displayedPhoto = user.localPhoto || user.googlePhoto || null;

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #374151",
    backgroundColor: "#0f172a",
    color: "white",
    boxSizing: "border-box" as const,
    opacity: isEditing ? 1 : 0.75,
  };

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontWeight: "bold",
  };

  const handleChange = (field: keyof UserProfile, value: string) => {
    setUser((prev) => {
      const updated = { ...prev, [field]: value };
      setHasChanges(true);
      return updated;
    });
  };

  const handlePhotoClick = () => {
    if (!isEditing) return;
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setUser((prev) => ({
      ...prev,
      localPhoto: imageUrl,
    }));
    setHasChanges(true);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // backend

    setOriginalUser(user);
    setHasChanges(false);
    setIsEditing(false);

    console.log("Perfil guardado:", user);
  };

  const handleCancel = () => {
    setUser(originalUser);
    setHasChanges(false);
    setIsEditing(false);
  };

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
            margin: "0 0 24px 0",
            fontSize: "32px",
            textAlign: "center",
          }}
        >
          PROFILE
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
            onClick={handlePhotoClick}
            style={{
              width: "140px",
              height: "140px",
              borderRadius: "16px",
              border: "1px solid #374151",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#0f172a",
              color: "#9ca3af",
              fontSize: "16px",
              overflow: "hidden",
              cursor: isEditing ? "pointer" : "default",
              position: "relative",
            }}
          >
            {displayedPhoto ? (
              <img
                src={displayedPhoto}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <span>{isEditing ? "Upload photo" : "No photo"}</span>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            style={{ display: "none" }}
          />

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
              <label style={labelStyle}>User Name</label>
              <input
                type="text"
                value={user.username}
                disabled={!isEditing}
                onChange={(e) => handleChange("username", e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Name</label>
              <input
                type="text"
                value={user.firstName}
                disabled={!isEditing}
                onChange={(e) => handleChange("firstName", e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Last Name</label>
              <input
                type="text"
                value={user.lastName}
                disabled={!isEditing}
                onChange={(e) => handleChange("lastName", e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={user.email}
                disabled={!isEditing}
                onChange={(e) => handleChange("email", e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "12px",
            }}
          >
            {!isEditing && (
              <button
                onClick={handleEdit}
                style={{
                  padding: "12px 20px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#ff6b35",
                  color: "white",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Edit Profile
              </button>
            )}

            {isEditing && hasChanges && (
              <>
                <button
                  onClick={handleSave}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: "#ff6b35",
                    color: "white",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Save Changes
                </button>

                <button
                  onClick={handleCancel}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "10px",
                    border: "1px solid #374151",
                    backgroundColor: "transparent",
                    color: "white",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}