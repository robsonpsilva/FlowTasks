"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface UserToEdit {
  id: string;
  name: string;
  email: string;
  role_id?: string | number;
  role_name?: string;
}

export default function CreateAccountFlow({ onBack, userToEdit }: { onBack: () => void; userToEdit?: UserToEdit | null }) {
  const isEdit = !!userToEdit;
  const router = useRouter();

  const resolveRoleId = (user: UserToEdit | null | undefined): string => {
    if (!user) return "1"; // Default: MEMBER
    if (user.role_id) return String(user.role_id);
    return user.role_name?.toUpperCase() === "ADMIN" ? "2" : "1";
  };

  const [formData, setFormData] = useState({ 
    name: userToEdit?.name || "", 
    email: userToEdit?.email || "", 
    password: "", 
    role_id: resolveRoleId(userToEdit) // O valor padrão "1" já entra aqui
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorFields, setErrorFields] = useState<Record<string, boolean>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errorFields[name]) setErrorFields(prev => ({ ...prev, [name]: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: Record<string, boolean> = {
      name: !formData.name.trim(),
      email: !formData.email.trim(),
      password: !isEdit && !formData.password.trim()
    };

    if (Object.values(errors).some(v => v)) {
      setErrorFields(errors);
      return;
    }

    setIsLoading(true);
    try {
      const url = isEdit ? `/api/users/${userToEdit.id}` : "/api/users";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          provider_id: 2,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      onBack();
    } catch (err) {
      alert("Error saving user data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <h2 className="text-2xl font-bold text-white text-center mb-4">
        {isEdit ? "Edit Profile" : "Create New User"}
      </h2>
      
      <div className="space-y-1.5">
        <label className="text-sm font-bold text-white">Full Name</label>
        <input name="name" value={formData.name} onChange={handleChange} className={`w-full p-4 rounded-xl bg-white text-black border-2 ${errorFields.name ? 'border-red-500' : 'border-transparent'}`} />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-bold text-white">Email Address</label>
        <input name="email" type="email" value={formData.email} onChange={handleChange} className={`w-full p-4 rounded-xl bg-white text-black border-2 ${errorFields.email ? 'border-red-500' : 'border-transparent'}`} />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-bold text-white">
          {isEdit ? "New Password (optional)" : "Password"}
        </label>
        <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder={isEdit ? "••••••••" : "Min. 6 characters"} className={`w-full p-4 rounded-xl bg-white text-black border-2 ${errorFields.password ? 'border-red-500' : 'border-transparent'}`} />
      </div>

      {/* A seção de Account Role foi removida visualmente, mas o valor permanece no formData */}

      <div className="flex gap-3 pt-4">
        <button type="button" onClick={() => router.push("/")} className="flex-1 py-4 bg-gray-600 text-white rounded-xl font-bold">Cancel</button>
        <button type="submit" disabled={isLoading} className="flex-[2] py-4 bg-[#FF6B35] text-white font-bold rounded-xl transition-transform active:scale-95">
          {isLoading ? "Saving..." : isEdit ? "Update User" : "Create User"}
        </button>
      </div>
    </form>
  );
}