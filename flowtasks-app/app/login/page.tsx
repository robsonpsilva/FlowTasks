"use client";
import { useState } from "react";
import LoginOptions from "@/components/auth/LoginOptions";
import CreateAccountFlow from "@/components/auth/CreateAccountFlow";
import LoginForm from "@/components/auth/LoginForm"; // Importe o formulário de login

export default function WelcomePage() {
  // Adicionamos "email_login" como uma visão possível
  const [view, setView] = useState<"welcome" | "login_options" | "email_login" | "signup">("welcome");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EFEFD0] p-6 font-sans">
      <div className="w-full max-w-md flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in duration-300 bg-white p-8 rounded-[40px] shadow-2xl">
        
        {/* 1. TELA INICIAL (WELCOME) */}
        {view === "welcome" && (
          <>
            <div className="w-24 h-24 bg-[#004E89] rounded-3xl shadow-2xl flex items-center justify-center transform rotate-3">
              <span className="text-white text-4xl font-black italic">FT</span>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-[#004E89] tracking-tight">
                Welcome to FlowTask
              </h1>
              <p className="text-[#FF6B35] font-semibold text-lg italic">
                Never lost the fun of multitask.
              </p>
            </div>

            <div className="w-full space-y-4 pt-4">
              <button 
                onClick={() => setView("login_options")}
                className="w-full py-4 bg-[#004E89] text-white font-bold rounded-xl shadow-lg hover:bg-[#1A659E] transition-all transform hover:-translate-y-1 active:scale-95"
              >
                Sign In
              </button>
              
              <button 
                onClick={() => setView("signup")}
                className="w-full py-4 bg-transparent border-2 border-[#004E89] text-[#004E89] font-bold rounded-xl hover:bg-[#F7C59F]/30 transition-all active:scale-95"
              >
                Create Account
              </button>
            </div>
          </>
        )}

        {/* 2. ESCOLHA DE LOGIN (GOOGLE OU EMAIL) */}
        {view === "login_options" && (
          <LoginOptions 
            onBack={() => setView("welcome")} 
            onEmailClick={() => setView("email_login")} // <-- Faz a ponte para o formulário
          />
        )}

        {/* 3. FORMULÁRIO DE LOGIN (EMAIL, SENHA E ROLE) */}
        {view === "email_login" && (
          <LoginForm 
            onBack={() => setView("login_options")} 
            onSuccess={() => window.location.href = "/"} 
          />
        )}

        {/* 4. FLUXO DE CADASTRO */}
        {view === "signup" && (
          <CreateAccountFlow onBack={() => setView("welcome")} />
        )}
      </div>
    </div>
  );
}