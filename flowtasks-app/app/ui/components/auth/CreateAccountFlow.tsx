"use client";
import { useState, useEffect } from "react";

interface UserToEdit {
  id: string;
  name: string;
  email: string;
  role_id?: string | number;
  role?: { id: string | number };
  role_name?: string;
}

export default function CreateAccountFlow({ 
  onBack, 
  userToEdit 
}: { 
  onBack: () => void; 
  userToEdit?: UserToEdit | null 
}) {
  const isEdit = !!userToEdit;

  const resolveRoleId = (user: UserToEdit | null | undefined): string => {
    if (!user) return "1"; 
    const id = user.role_id || user.role?.id;
    if (id) return String(id);
    if (user.role_name?.toUpperCase() === "ADMIN") return "2";
    return "1"; 
  };

  const [formData, setFormData] = useState({ 
    name: userToEdit?.name || "", 
    email: userToEdit?.email || "", 
    password: "",
    role_id: resolveRoleId(userToEdit)
  });

  const [isLoading, setIsLoading] = useState(false);
  const [banner, setBanner] = useState({ show: false, msg: "", type: "success" as "success" | "error" });

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        name: userToEdit.name,
        email: userToEdit.email,
        password: "",
        role_id: resolveRoleId(userToEdit)
      });
    }
  }, [userToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const url = isEdit ? `/api/users/${userToEdit.id}` : "/api/users";
      const method = isEdit ? "PUT" : "POST";

      // 1. Atualizar Perfil (Nome/Email)
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          ...(formData.password && { password: formData.password }),
          provider_id: 2,
        }),
      });

      const userData = await res.json();
      if (!res.ok) throw new Error(userData.details || "Failed to save user");

      // 2. ATUALIZAR ROLE NO BANCO (O passo que estava faltando)
      // Usamos o ID do userToEdit ou o ID retornado na criação
      const targetUserId = isEdit ? userToEdit.id : userData.id;

      const roleRes = await fetch("/api/users/roles", {
        method: "POST", // Geralmente POST ou PUT para gerenciar atribuição
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: String(targetUserId),
          roleId: formData.role_id // "1" ou "2" do seu combo
        }),
      });

      if (!roleRes.ok) throw new Error("User saved, but failed to update role");

      setBanner({ show: true, msg: "User and Role updated!", type: "success" });
      setTimeout(onBack, 1500);
    } catch (error) {
      setBanner({ show: true, msg: error instanceof Error ? error.message : "Error", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      <h2 className="text-2xl font-bold text-white text-center">
        {isEdit ? "Edit User Profile" : "Create Account"}
      </h2>
      
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-bold text-white">Full Name</label>
        <input 
          name="name" className="w-full p-4 rounded-xl bg-white text-black"
          value={formData.name} onChange={handleChange}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-bold text-white">Email</label>
        <input 
          name="email" className="w-full p-4 rounded-xl bg-white text-black"
          value={formData.email} onChange={handleChange}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-bold text-white">Account Role</label>
        <select 
          name="role_id"
          className="w-full p-4 rounded-xl bg-white text-black font-medium border-2 border-[#F7C59F]"
          value={formData.role_id} 
          onChange={handleChange}
        >
          <option value="1">MEMBER</option>
          <option value="2">ADMIN</option>
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack} className="flex-1 py-4 bg-gray-600 text-white rounded-xl">Cancel</button>
        <button type="submit" disabled={isLoading} className="flex-[2] py-4 bg-[#FF6B35] text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95">
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}