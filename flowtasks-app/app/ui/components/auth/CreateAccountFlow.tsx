import { useState, useEffect } from "react";

export default function CreateAccountFlow({ onBack }: { onBack: () => void }) {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validação de UI
    const newErrors = {
      name: !formData.name.trim(),
      email: !formData.email.trim(),
      password: !formData.password.trim(),
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error)) {
      setBanner({ show: true, msg: "Please fill in all required fields.", type: "error" });
      return;
    }

    setIsLoading(true);
    
    try {
      // ETAPA 1: Criar o Usuário (Endpoint: POST /api/users)
      const userResponse = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          provider_id: 2, // Login via credentials conforme seu Swagger
        }),
      });

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        throw new Error(userData.details || "Failed to create user.");
      }

      // ETAPA 2: Atribuir Role 'MEMBER' (Endpoint: POST /api/users/roles)
      // Assumindo que roleId '2' é MEMBER no seu banco
      const roleResponse = await fetch("/api/users/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: String(userData.id), 
          roleId: "2"
        }),
      });

      if (!roleResponse.ok) {
        console.warn("User created, but role assignment failed.");
        setBanner({ 
          show: true, 
          msg: "Account created! But there was an issue setting up permissions. Contact support.", 
          type: "error" 
        });
      } else {
        // SUCESSO TOTAL
        setBanner({ show: true, msg: "Registration successful! Welcome aboard.", type: "success" });
        setFormData({ name: "", email: "", password: "" });
        setTimeout(() => onBack(), 3000);
      }

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
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md p-4 rounded-xl shadow-2xl border-2 animate-in slide-in-from-top duration-500 ${
          banner.type === "success" 
            ? "bg-green-50 border-green-500 text-green-800" 
            : "bg-red-50 border-red-500 text-red-800"
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-xl">{banner.type === "success" ? "✅" : "⚠️"}</span>
            <p className="font-bold text-sm">{banner.msg}</p>
            <button onClick={() => setBanner(prev => ({ ...prev, show: false }))} className="ml-auto opacity-50 hover:opacity-100">×</button>
          </div>
        </div>
      )}

      <form onSubmit={handleSignUp} className="w-full space-y-5 animate-in slide-in-from-left duration-300" noValidate>
        <h2 className="text-2xl font-bold text-white">New Account</h2>
        
        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-sm font-bold text-white">Full Name <span className="text-red-500">*</span></label>
          <input 
            type="text" name="name" placeholder="Enter your full name" spellCheck="false"
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
          <label className="text-sm font-bold text-white">Password <span className="text-red-500">*</span></label>
          <input 
            type="password" name="password" placeholder="Min. 8 characters"
            className={`w-full p-4 rounded-xl border-2 outline-none transition-all bg-white text-black ${errors.password ? "border-red-500 bg-red-50" : "border-[#F7C59F] focus:border-[#FF6B35]"}`}
            value={formData.password} onChange={handleChange}
          />
        </div>
        
        <button 
          type="submit" disabled={isLoading}
          className={`w-full py-4 bg-[#FF6B35] text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 mt-4 ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#e85a24]"}`}
        >
          {isLoading ? "Saving to Database..." : "Finish Registration"}
        </button>

        <button onClick={onBack} type="button" className="text-sm text-[#004E89] underline block mx-auto hover:text-[#1A659E]">
          Back to Welcome
        </button>
      </form>
    </>
  );
}