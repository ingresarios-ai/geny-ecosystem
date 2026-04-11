import { useState } from "react";
import { Eye, EyeOff, Wand2, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";

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
    </div>
  );
};

const SleekInput = ({ label, ...p }: any) => (
  <div className="w-full relative group mt-4">
    <input 
      {...p}
      className={`w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 pt-6 text-white placeholder-transparent focus:outline-none focus:border-cyan-400 focus:bg-white/[0.05] transition-all peer font-sans text-sm ${p.className}`}
      placeholder={label}
    />
    <label className="absolute left-4 top-2 text-[10px] uppercase font-bold tracking-widest text-white/40 peer-focus:text-cyan-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest transition-all pointer-events-none">
      {label}
    </label>
  </div>
);

const PasswordInput = ({ label, value, onChange, onGenerate }: any) => {
  const [show, setShow] = useState(false);
  return (
    <div className="w-full relative group mt-4">
      <input 
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 pt-6 text-white placeholder-transparent focus:outline-none focus:border-cyan-400 focus:bg-white/[0.05] transition-all peer font-sans text-sm"
        placeholder={label}
      />
      <label className="absolute left-4 top-2 text-[10px] uppercase font-bold tracking-widest text-white/40 peer-focus:text-cyan-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest transition-all pointer-events-none">
        {label}
      </label>
      <div className="absolute right-3 top-4 flex items-center gap-1 z-20">
        {onGenerate && (
          <button type="button" onClick={onGenerate} className="text-white/40 hover:text-cyan-400 transition-colors p-1.5" title="Generar Contraseña Segura">
             <Wand2 size={16} />
          </button>
        )}
        <button type="button" onClick={() => setShow(!show)} className="text-white/40 hover:text-white transition-colors p-1.5">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
};

export default function MigrationWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [profession, setProfession] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [legacyCount, setLegacyCount] = useState(0);
  const [lookingUp, setLookingUp] = useState(false);
  
  const handleNext = async () => {
    if (!email.trim()) { setError("Por favor ingresa tu correo."); return; }
    setError(""); setLookingUp(true);
    try {
      // Secure RPC lookup - only returns count + first name/profession for this email
      const { data: legacyData } = await supabase
        .rpc('lookup_legacy_count', { p_email: email.trim().toLowerCase() });

      if (legacyData && legacyData.length > 0 && legacyData[0].entry_count > 0) {
        setLegacyCount(legacyData[0].entry_count);
        if (!name) setName(legacyData[0].first_name || "");
        if (!profession) setProfession(legacyData[0].first_profession || "");
      } else {
        setLegacyCount(0);
      }
      setStep(2);
    } catch {
      setStep(2); // Proceed anyway
    }
    setLookingUp(false);
  };

  const handleMigrate = async () => {
    if (!password.trim() || !name.trim() || !profession.trim()) {
      setError("Por favor completa todos los campos.");
      return;
    }
    setLoading(true); setError("");
    try {
      // 1. Sign up user in new ecosystem (this acts as password creation for them)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: name.trim(),
            profession: profession.trim(),
            is_migrated: true
          }
        }
      });
      
      if (signUpError) {
        if (signUpError.message.includes("User already registered") || signUpError.message.includes("already registered")) {
           throw new Error("Este correo ya completó la actualización. Por favor inicia sesión normalmente.");
        }
        throw signUpError;
      }
      
      if (!data.user) throw new Error("Error creando tu nueva bóveda.");

      // Success - show completion state before redirecting
      setStep(3);
      
      // We will let the user click to proceed, or auto redirect
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  const generateSecurePassword = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
      let p = "";
      for(let i = 0; i < 16; i++) p += chars.charAt(Math.floor(Math.random() * chars.length));
      setPassword(p);
  };

  const quotes = [
    { text: "El riesgo es el precio que pagas por la oportunidad.", author: "Ingresarios" },
    { text: "Protege tu capital primero, las ganancias vendrán después.", author: "Regla #1" }
  ];

  return (
    <div className="flex min-h-screen w-full relative z-10 font-sans bg-black">
      
      {/* Left Panel - Wizard */}
      <div className="w-full md:w-[50%] lg:w-[45%] xl:w-[40%] flex flex-col px-8 md:px-12 lg:px-16 bg-[#050505] border-r border-white/5 shadow-2xl relative shrink-0">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-transparent" />
          
          <div className="mt-12 lg:hidden mb-8 w-full flex justify-center">
            <BrandLogo align="center" />
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-[400px] mx-auto w-full py-12">
            
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest mb-6">
                    <ShieldCheck size={14} /> Actualización de Seguridad
                  </div>
                  <h1 className="text-3xl lg:text-5xl font-black tracking-tighter text-white mb-4 leading-tight">
                    ¡Nos actualizamos!
                  </h1>
                  <p className="text-white/60 text-base mb-2 leading-relaxed">
                    Tu plataforma Geny-B ahora es parte del nuevo <span className="text-cyan-400 font-bold whitespace-nowrap">GENY Ecosystem</span>.
                  </p>
                  <p className="text-white/60 text-base mb-6 leading-relaxed">
                    Ingresa tu correo electrónico para verificar tu cuenta y recuperar tu historial de operaciones. <span className="text-emerald-400 font-semibold">Todos tus datos están a salvo.</span>
                  </p>

                  <SleekInput label="Tu correo electrónico" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} />
                  
                  {error && <div className="p-3 mb-4 mt-4 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-sm font-medium">{error}</div>}
                  
                  <button onClick={handleNext} disabled={lookingUp} className="w-full mt-8 py-4 rounded-lg font-bold text-base tracking-wide bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    {lookingUp ? "Buscando tu cuenta..." : <>Comenzar Actualización <ArrowRight size={18} /></>}
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-widest mb-6">
                    Paso Final
                  </div>
                  <h1 className="text-3xl lg:text-5xl font-black tracking-tighter text-white mb-2 leading-tight">
                    Crea tu nueva llave.
                  </h1>
                  <p className="text-white/40 text-base mb-4">
                    Actualizando cuenta para: <span className="font-mono text-cyan-400">{email}</span>
                  </p>
                  {legacyCount > 0 && (
                    <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold mb-6 flex items-center gap-2">
                      <CheckCircle2 size={16} />
                      Se encontraron <span className="text-white font-black">{legacyCount}</span> operaciones históricas. Se migrarán automáticamente a tu nueva cuenta.
                    </div>
                  )}

                  <div className="space-y-4">
                    <PasswordInput label="Crea tu nueva Contraseña" value={password} onChange={(e: any) => setPassword(e.target.value)} onGenerate={generateSecurePassword} />
                    <SleekInput label="Tu Nombre Completo" type="text" value={name} onChange={(e: any) => setName(e.target.value)} />
                    <SleekInput label="Tu Profesión" type="text" value={profession} onChange={(e: any) => setProfession(e.target.value)} />
                  </div>

                  {error && <div className="p-3 mt-6 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-sm font-medium leading-snug break-words">
                    {error}
                  </div>}

                  <button onClick={handleMigrate} disabled={loading} className="w-full mt-8 py-4 rounded-lg font-bold text-base tracking-wide bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2">
                    {loading ? "Asegurando bóveda..." : "Completar Actualización"}
                  </button>

                  <button onClick={() => setStep(1)} className="w-full mt-4 py-3 text-sm uppercase tracking-widest text-white/30 hover:text-white transition-colors font-bold">
                    Volver
                  </button>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center py-10"
                >
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={40} className="text-emerald-400" />
                  </div>
                  <h2 className="text-3xl font-black text-white mb-4">¡Todo listo!</h2>
                  <p className="text-white/60 mb-8 max-w-sm">
                    Tu bóveda ha sido asegurada con éxito y tu historial está migrando. Ahora accederás al GENY Ecosystem.
                  </p>
                  <button onClick={() => navigate("/geny")} className="w-full py-4 rounded-lg font-bold text-sm bg-white text-black hover:bg-gray-200 transition-colors">
                    Entrar al Ecosistema
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Direct Login Switcher */}
            {step !== 3 && (
              <div className="mt-12 pt-8 border-t border-white/5">
                <p className="text-sm text-white/40 text-center">
                  ¿Ya actualizaste tu cuenta o acabas de llegar?
                </p>
                <div onClick={() => navigate("/geny")} className="mt-4 px-6 py-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] flex items-center justify-between cursor-pointer transition-all group">
                  <div className="font-bold text-sm text-white">
                    Ir al Login Normal
                    <div className="text-[10px] text-white/40 font-mono tracking-widest mt-1 uppercase">Entrar a genyapp.ingresarios.ai</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            )}
          </div>
      </div>

      {/* Right Panel - Branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center relative overflow-hidden bg-gradient-to-br from-[#0a0510] to-black border-l border-white/5 z-0">
         <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[150px] pointer-events-none" />
         <div className="absolute -bottom-1/4 -left-1/4 w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[150px] pointer-events-none" />
         
         <div className="relative z-10 scale-[1.5] xl:scale-[1.8] pointer-events-none select-none">
            <BrandLogo align="center" />
         </div>
         
         <div className="absolute bottom-20 left-12 right-12 z-10">
            <div className="glass-panel p-6 border-white/10 rounded-2xl max-w-lg">
              <p className="text-lg font-medium text-white mb-4 italic">
                "{quotes[0].text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500" />
                <div>
                  <div className="font-bold text-white text-sm">{quotes[0].author}</div>
                  <div className="text-[10px] text-white/50 uppercase tracking-widest font-mono">Plataforma de Alto Rendimiento</div>
                </div>
              </div>
            </div>
         </div>
      </div>

    </div>
  );
}
