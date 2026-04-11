import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Shield, Eye, EyeOff } from "lucide-react";

const BrandLogo = ({ align = "center" }: { align?: "left" | "right" | "center" }) => {
  const al = align === "center" ? "items-center text-center" : align === "right" ? "items-end text-right" : "items-start text-left";
  const m = align === "center" ? "" : align === "right" ? "mr-1" : "ml-1";
  return (
    <div className={`flex flex-col select-none ${al}`}>
      <div className={`text-5xl lg:text-6xl font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]`}>
        GENY
      </div>
      <div className={`font-bold text-cyan-400 text-[11px] lg:text-[13px] tracking-[0.4em] uppercase mt-1 ${m}`}>
        Ecosystem
      </div>
      <div className={`flex items-center gap-2 mt-4 opacity-80 ${m}`}>
        <span className="text-[9px] font-mono tracking-[0.2em] text-white/50">BY</span>
        <img src="/logo.png" alt="Ingresarios" className="h-4 lg:h-5 object-contain" />
      </div>
    </div>
  );
};

export default function AdminAuth({ onLogin }: { onLogin: (user: any) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Ingresa credenciales.");
      return;
    }
    setLoading(true); setError("");
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });
      if (authError) throw authError;
      if (!data.user) throw new Error("Fallo de sesión.");
      
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      if (profile?.role !== 'admin') {
         // Log out immediately if they are not admin
         await supabase.auth.signOut();
         throw new Error("Acceso denegado. No tienes nivel de Administrador.");
      }

      const u = { id: data.user.id, name: profile?.full_name || email, email: data.user.email };
      onLogin(u);
    } catch (err: any) {
      setError(err.message || "Credenciales inválidas.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0202] relative overflow-hidden font-sans w-full">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/30 via-black to-black pointer-events-none" />
      
      <div className="glass-panel p-8 md:p-10 rounded-3xl border border-red-500/20 max-w-sm w-full mx-4 z-10 shadow-[0_0_80px_rgba(220,38,38,0.1)] bg-black/60 backdrop-blur-xl">
        <div className="flex justify-center mb-8">
          <BrandLogo align="center" />
        </div>

        <h1 className="text-2xl font-black text-white text-center mb-1 tracking-tight">RESTRICTED ACCESS</h1>
        <p className="text-red-400/60 text-[9px] text-center uppercase tracking-[0.2em] mb-8 font-mono">Admin Control Systems</p>

        <div className="space-y-4">
           <div>
             <label className="text-[10px] uppercase font-bold text-white/50 block mb-1">Email Authority</label>
             <input 
               type="email" 
               value={email} 
               onChange={e=>setEmail(e.target.value)} 
               className="w-full bg-black/50 border border-white/10 focus:border-red-500 rounded-lg px-4 py-3 text-sm text-white focus:outline-none transition-colors" 
               placeholder="admin@ecosistema.com"
             />
           </div>
           <div>
             <label className="text-[10px] uppercase font-bold text-white/50 block mb-1">Passcode</label>
             <div className="relative">
               <input 
                 type={show?"text":"password"} 
                 value={password} 
                 onChange={e=>setPassword(e.target.value)} 
                 onKeyDown={e=>e.key==="Enter"&&handleLogin()} 
                 className="w-full bg-black/50 border border-white/10 focus:border-red-500 rounded-lg pl-4 pr-10 py-3 text-sm text-white focus:outline-none transition-colors" 
                 placeholder="••••••••"
               />
               <button onClick={()=>setShow(!show)} className="absolute right-3 top-3.5 text-white/40 hover:text-white transition-colors">
                 {show ? <EyeOff size={16} /> : <Eye size={16} />}
               </button>
             </div>
           </div>

           {error && (
             <div className="text-red-400 text-[11px] text-center py-2 px-3 mt-4 border border-red-500/20 bg-red-500/10 rounded font-mono">
               {error}
             </div>
           )}

           <button 
             onClick={handleLogin} 
             disabled={loading} 
             className="w-full mt-6 py-4 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black uppercase tracking-widest text-[11px] rounded-lg transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] disabled:opacity-50"
           >
             {loading ? "Authenticating..." : "System Login"}
           </button>
        </div>
      </div>
      
      <div className="absolute bottom-6 w-full text-center text-red-500/30 font-mono text-[9px] uppercase tracking-[0.3em]">
        © GENY Ecosystem — Internal Use Only
      </div>
    </div>
  );
}
