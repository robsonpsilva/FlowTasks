import { useState } from "react";
import { signIn } from "next-auth/react"; // 1. Importar o helper oficial

interface LoginFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function LoginForm({ onBack, onSuccess }: LoginFormProps) {
  const [loginData, setLoginData] = useState({ email: "", password: "", roleId: "2" });
  const [isLoading, setIsLoading] = useState(false);
  const [banner, setBanner] = useState<{ show: boolean; msg: string; type: "success" | "error" }>({
    show: false, msg: "", type: "success"
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setBanner({ show: false, msg: "", type: "success" });

    try {
      // 2. USAR O signIn EM VEZ DO fetch
      // Isso envia os dados para o 'authorize' no seu route.ts
      const result = await signIn("credentials", {
        email: loginData.email,
        password: loginData.password,
        roleId: loginData.roleId,
        redirect: false, // Mantemos falso para tratar o erro/sucesso aqui na tela
      });

      if (result?.error) {
        // O NextAuth retorna erros como 'CredentialsSignin' ou a mensagem do throw Error
        setBanner({ 
          show: true, 
          msg: "Invalid credentials or incorrect role. Please check your data.", 
          type: "error" 
        });
      } else {
        setBanner({ show: true, msg: "Login successful! Redirecting...", type: "success" });
        // Pequeno delay para o usuário ler a mensagem de sucesso
        setTimeout(() => onSuccess(), 1500);
      }
    } catch (error) {
      setBanner({ show: true, msg: "A connection error occurred. Try again later.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-500">
      {/* Dynamic Banner */}
      {banner.show && (
        <div className={`p-4 rounded-xl border-2 mb-4 animate-bounce ${
          banner.type === "success" 
            ? "bg-green-50 border-green-500 text-green-800" 
            : "bg-red-50 border-red-500 text-red-800"
        }`}>
          <p className="text-sm font-bold">{banner.msg}</p>
        </div>
      )}

      <h2 className="text-2xl font-bold text-[#004E89]">Sign In to FlowTask</h2>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-sm font-bold text-[#004E89]">Email Address</label>
          <input 
            type="email" 
            required
            placeholder="your@email.com"
            className="w-full p-4 rounded-xl border-2 border-[#F7C59F] outline-none focus:border-[#FF6B35] bg-white text-black transition-all"
            onChange={(e) => setLoginData({...loginData, email: e.target.value})}
          />
        </div>

        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-sm font-bold text-[#004E89]">Password</label>
          <input 
            type="password" 
            required
            placeholder="••••••••"
            className="w-full p-4 rounded-xl border-2 border-[#F7C59F] outline-none focus:border-[#FF6B35] bg-white text-black transition-all"
            onChange={(e) => setLoginData({...loginData, password: e.target.value})}
          />
        </div>

        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-sm font-bold text-[#004E89]">Sign in as</label>
          <select 
            className="w-full p-4 rounded-xl border-2 border-[#F7C59F] outline-none focus:border-[#FF6B35] bg-white text-black cursor-pointer"
            value={loginData.roleId}
            onChange={(e) => setLoginData({...loginData, roleId: e.target.value})}
          >
            <option value="2">Administrator</option>
            <option value="1">Member</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className={`w-full py-4 bg-[#1A659E] text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 ${
            isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#004E89]"
          }`}
        >
          {isLoading ? "Verifying Credentials..." : "Sign In"}
        </button>
      </form>

      <button onClick={onBack} className="text-sm text-[#004E89] underline block mx-auto hover:text-[#FF6B35] transition-colors">
        Back to Options
      </button>
    </div>
  );
}