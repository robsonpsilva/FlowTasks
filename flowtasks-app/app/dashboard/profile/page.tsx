"use client";

import { useSession } from "next-auth/react";
import { useState, useRef } from "react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  
  // Estado para o Banner
  const [banner, setBanner] = useState<{ message: string; type: 'success' | 'error' | null }>({
    message: "",
    type: null
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = session?.user;

  // Função para mostrar o banner centralizado e esconder após 3 segundos
  const showBanner = (message: string, type: 'success' | 'error') => {
    setBanner({ message, type });
    setTimeout(() => {
      setBanner({ message: "", type: null });
    }, 3000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", user?.id || ""); 

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        await update({
          ...session,
          user: { ...session?.user, image: data.url },
        });
        showBanner("Foto atualizada com sucesso!", "success");
      } else {
        showBanner("Erro ao atualizar foto no servidor.", "error");
      }
    } catch (err) {
      showBanner("Erro na conexão durante o upload.", "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    }
  };

  return (
    <section style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "40px", position: "relative" }}>
      
      {/* BANNER NOTIFICAÇÃO CENTRALIZADO E AMPLIADO */}
      {banner.type && (
        <div style={{
          position: "fixed",
          top: "40px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "20px 40px",
          borderRadius: "14px",
          backgroundColor: banner.type === 'success' ? "#059669" : "#DC2626",
          color: "white",
          fontWeight: "600",
          fontSize: "18px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
          zIndex: 1000,
          animation: "slideDown 0.4s ease-out",
          textAlign: "center",
          minWidth: "320px"
        }}>
          {banner.message}
        </div>
      )}

      {/* Animação de entrada vinda de cima */}
      <style jsx global>{`
        @keyframes slideDown {
          from { 
            transform: translate(-50%, -100%); 
            opacity: 0; 
          }
          to { 
            transform: translate(-50%, 0); 
            opacity: 1; 
          }
        }
      `}</style>

      <div style={{ width: "100%", maxWidth: "720px", backgroundColor: "#111827", border: "1px solid #1f2937", borderRadius: "16px", padding: "32px", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>
        
        <h1 style={{ margin: "0 0 24px 0", fontSize: "32px", textAlign: "center", color: "white" }}>Profile</h1>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
          
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            style={{
              width: "130px",
              height: "130px",
              borderRadius: "20px",
              overflow: "hidden",
              border: "2px solid #374151",
              backgroundColor: user?.image ? "#0f172a" : "#FF6B35",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "40px",
              fontWeight: "bold",
              color: "white",
              cursor: isUploading ? "wait" : "pointer",
              position: "relative"
            }}
          >
            {user?.image ? (
              <img src={user.image} alt="User photo" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: isUploading ? 0.5 : 1 }} />
            ) : (
              <span>{user?.name ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U"}</span>
            )}
            
            {isUploading && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)", fontSize: "12px" }}>
                Uploading...
              </div>
            )}
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            style={{ display: "none" }} 
          />

          <p style={{ fontSize: "12px", color: "#9ca3af" }}>Click the photo to change it</p>

          <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr", gap: "16px", marginTop: "8px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", color: "white" }}>Name</label>
              <input type="text" value={user?.name || ""} readOnly style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #374151", backgroundColor: "#0f172a", color: "white", boxSizing: "border-box" }} />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", color: "white" }}>Email</label>
              <input type="email" value={user?.email || ""} readOnly style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #374151", backgroundColor: "#0f172a", color: "white", boxSizing: "border-box" }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}