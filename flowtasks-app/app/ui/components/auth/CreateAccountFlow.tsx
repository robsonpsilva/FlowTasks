import Link from "next/link";
import { useState, useEffect } from "react";

interface UserToEdit {
  id: string;
  name: string;
  email: string;
  role_id?: string;
}

export default function CreateAccountFlow({ 
  onBack, 
  userToEdit 
}: { 
  onBack: () => void; 
  userToEdit?: UserToEdit | null 
}) {
  const isEdit = !!userToEdit;

  const [formData, setFormData] = useState({ 
    name: userToEdit?.name || "", 
    email: userToEdit?.email || "", 
    password: "" 
  });

  const [errors, setErrors] = useState({ name: false, email: false, password: false });
  const [isLoading, setIsLoading] = useState(false);
  
  const [banner, setBanner] = useState<{ show: boolean; msg: string; type: "success" | "error" }>({
    show: false,
    msg: "",
    type: "success",
  });

  useEffect(() => {
    if (banner.show) {
      const timer = setTimeout(() => {
        setBanner((prev) => ({ ...prev, show: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [banner.show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validação de UI (Senha opcional na edição se não quiser mudar)
    const newErrors = {
      name: !formData.name.trim(),
      email: !formData.email.trim(),
      password: !isEdit && !formData.password.trim(), // Obrigatória apenas na criação
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error)) {
      setBanner({ show: true, msg: "Please fill in all required fields.", type: "error" });
      return;
    }

    setIsLoading(true);
    
    try {
      const url = isEdit ? `/api/users/${userToEdit.id}` : "/api/users";
      const method = isEdit ? "PUT" : "POST";

      // ETAPA 1: Salvar/Atualizar Usuário
      const userResponse = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          ...(formData.password && { password: formData.password }), // Só envia senha se preenchida
          provider_id: 2,
        }),
      });

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        throw new Error(userData.details || `Failed to ${isEdit ? 'update' : 'create'} user.`);
      }

      // ETAPA 2: Role Assignment (apenas se for criação, ou se quiser mudar na edição)
      if (!isEdit) {
        await fetch("/api/users/roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: String(userData.id), 
            roleId: "2" // Default: MEMBER
          }),
        });
      }

      setBanner({ 
        show: true, 
        msg: isEdit ? "User updated successfully!" : "Registration successful!", 
        type: "success" 
      });

      if (!isEdit) setFormData({ name: "", email: "", password: "" });
      
      setTimeout(() => onBack(), 2000);

    } catch (error) {
      const message = error instanceof Error ? error.message : "Network error occurred";
      setBanner({ show: true, msg: message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (value.trim() !== "") {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  return (
    <>
      {banner.show && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[60] w-11/12 max-w-md p-4 rounded-xl shadow-2xl border-2 animate-in slide-in-from-top duration-500 ${
          banner.type === "success" 
            ? "bg-green-50 border-green-500 text-green-800" 
            : "bg-red-50 border-red-500 text-red-800"
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-xl">{banner.type === "success" ? "✅" : "⚠️"}</span>
            <p className="font-bold text-sm">{banner.msg}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full space-y-5" noValidate>
        <h2 className="text-2xl font-bold text-white">
          {isEdit ? "Edit User Profile" : "Create New Account"}
        </h2>
        
        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-sm font-bold text-white">Full Name <span className="text-red-500">*</span></label>
          <input 
            type="text" name="name" placeholder="Full name" 
            className={`w-full p-4 rounded-xl border-2 outline-none transition-all bg-white text-black ${errors.name ? "border-red-500 bg-red-50" : "border-[#F7C59F] focus:border-[#FF6B35]"}`}
            value={formData.name} onChange={handleChange}
          />
        </div>

        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-sm font-bold text-white">Email Address <span className="text-red-500">*</span></label>
          <input 
            type="email" name="email" placeholder="example@mail.com"
            className={`w-full p-4 rounded-xl border-2 outline-none transition-all bg-white text-black ${errors.email ? "border-red-500 bg-red-50" : "border-[#F7C59F] focus:border-[#FF6B35]"}`}
            value={formData.email} onChange={handleChange}
          />
        </div>

        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-sm font-bold text-white">
            {isEdit ? "New Password (Leave blank to keep current)" : "Password *"}
          </label>
          <input 
            type="password" name="password" placeholder="••••••••"
            className={`w-full p-4 rounded-xl border-2 outline-none transition-all bg-white text-black ${errors.password ? "border-red-500 bg-red-50" : "border-[#F7C59F] focus:border-[#FF6B35]"}`}
            value={formData.password} onChange={handleChange}
          />
        </div>
        
        <div className="flex gap-3">
            <button 
                type="button" onClick={onBack}
                className="flex-1 py-4 bg-gray-600 text-white font-bold rounded-xl hover:bg-gray-700 transition-all"
            >
                Cancel
            </button>
            <button 
                type="submit" disabled={isLoading}
                className={`flex-[2] py-4 bg-[#FF6B35] text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#e85a24]"}`}
            >
                {isLoading ? "Saving..." : isEdit ? "Update User" : "Finish Registration"}
            </button>
        </div>
      </form>
    </>
  );
}