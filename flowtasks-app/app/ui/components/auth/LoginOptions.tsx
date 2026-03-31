import { signIn } from "next-auth/react";

interface LoginOptionsProps {
  onBack: () => void;
  onEmailClick: () => void;
}

export default function LoginOptions({ onBack, onEmailClick }: LoginOptionsProps) {
  return (
    <div className="w-full space-y-6 animate-in slide-in-from-right duration-300">
      <h2 className="text-2xl font-bold text-white">Choose how to sign in</h2>
      
      <div className="space-y-3">
        {/* External: Google OAuth */}
        <button 
          onClick={() => signIn("google", { callbackUrl: "/dashboard/home" })}
          className="flex items-center justify-center gap-3 w-full bg-white border-2 border-slate-200 py-3 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
        >
          <img src="https://authjs.dev/img/providers/google.svg" className="w-5 h-5" alt="Google" />
          <span className="font-semibold text-slate-700">Continue with Google</span>
        </button>

        {/* Separator */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-300"></span>
          </div>
          <span className="relative bg-yellow-400 px-3 py-1 text-base text-black font-semibold uppercase rounded-md shadow-sm">
            Or use your local account
          </span>
        </div>


        {/* Internal: Database Auth */}
        <button 
          onClick={onEmailClick}
          className="w-full py-4 bg-[#1A659E] text-white font-bold rounded-xl hover:bg-[#004E89] transition-all active:scale-95 shadow-md"
        >
          Email and Password
        </button>
      </div>

      <button 
        onClick={onBack} 
        className="text-sm text-white underline block mx-auto hover:text-yellow-300 transition-colors"
      >
        Go Back
      </button>
    </div>
  );
}