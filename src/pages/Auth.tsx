import { useState, useEffect } from "react";
import { Eye, EyeOff, Wand2, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "motion/react";

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

const PasswordInput = ({ label, value, onChange, onKeyDown, onGenerate }: any) => {
  const [show, setShow] = useState(false);
  return (
    <div className="w-full relative group mt-4 flex items-center">
      <input 
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 pt-6 text-white placeholder-transparent focus:outline-none focus:border-cyan-400 focus:bg-white/[0.05] transition-all peer font-sans text-sm pr-20"
        placeholder={label}
      />
      <label className="absolute left-4 top-2 text-[10px] uppercase font-bold tracking-widest text-white/40 peer-focus:text-cyan-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest transition-all pointer-events-none">
        {label}
      </label>
      <div className="absolute right-3 flex items-center gap-1 z-20">
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

const Btn = ({ children, onClick, className, disabled, variant = "primary", ...p }: any) => {
  const base = "w-full py-4 rounded-lg font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center relative overflow-hidden";
  const styles = {
    primary: "bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]",
    secondary: "bg-transparent border border-white/20 text-white hover:bg-white/10",
    gradient: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]",
    emerald: "bg-gradient-to-r from-emerald-500 to-emerald-700 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${base} ${(styles as any)[variant]} ${disabled ? 'opacity-50 cursor-not-allowed scale-100' : 'hover:scale-[1.02] active:scale-95'} ${className}`}
      {...p}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
};

const BrandLogo = ({ align = "left" }: { align?: "left" | "right" | "center" }) => {
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

const quotes = [
  { t: "El que se expone, se exponencia.", s: "La consistencia convierte la intención en resultados medibles." },
  { t: "Tu sistema paga lo que tu disciplina ejecuta.", s: "Sin prisa, sin pausa… pero con método." },
  { t: "La visualización es backtesting emocional.", s: "Entrena tu mente antes de entrenar tu capital." },
  { t: "No operes el mercado, opera tu criterio.", s: "La verdadera ventaja competitiva eres tú." },
  { t: "PEDEM hoy, libertad mañana.", s: "Planear, Ejecutar, Documentar, Evaluar y Mejorar… repetir hasta dominar." },
  { t: "La abundancia favorece al trader preparado.", s: "Tu S.A.R.A. detecta lo que tu enfoque prioriza." },
  { t: "Sin bitácora no hay evolución.", s: "Lo que no se mide, no se optimiza." },
  { t: "No sigas señales, construye criterio.", s: "Un ingresario piensa en probabilidades, no en promesas." },
  { t: "El mercado premia la estructura, no la emoción.", s: "La disciplina reduce el ruido mental y mejora la ejecución." },
  { t: "Prosperar haciendo prosperar.", s: "La tribu acelera lo que el individuo inicia." }
];

export default function Auth({ onLogin }: { onLogin: (user: any) => void }) {
  const [loginMode, setLoginMode] = useState<"login" | "register" | "recovery">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regProf, setRegProf] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIdx(prev => (prev + 1) % quotes.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
       setError("Ingresa email y contraseña.");
       return;
    }
    setLoading(true); setError("");
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword
      });
      if (authError) throw authError;
      if (!data.user) throw new Error("Error obteniendo sesión.");

      const { data: contact } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();

      const u = { 
        id: data.user.id, 
        name: contact?.full_name || contact?.email || data.user.email, 
        email: data.user.email, 
        profession: contact?.profession || "",
        is_migrated: data.user.user_metadata?.is_migrated || false
      };
      onLogin(u);
    } catch (err: any) { setError(`Credenciales inválidas o error de red.`); console.error(err); }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim() || !regProf.trim()) {
       setError("Por favor completa todos los campos.");
       return;
    }
    setLoading(true); setError("");
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: regEmail.trim(),
        password: regPassword,
        options: {
           data: {
             full_name: regName.trim(),
             profession: regProf.trim()
           }
        }
      });
      
      if (signUpError) throw signUpError;
      if (!data.user) throw new Error("Error creando usuario.");

      const u = { id: data.user.id, name: regName.trim(), email: regEmail.trim(), profession: regProf.trim() };
      onLogin(u);
    } catch (err: any) { setError(`Error: ${err.message}`) }
    setLoading(false);
  };

  const generateSecurePassword = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
      let p = "";
      for(let i = 0; i < 16; i++) p += chars.charAt(Math.floor(Math.random() * chars.length));
      setRegPassword(p);
  };

  const handleRecovery = async () => {
    if (!recoveryEmail.trim()) {
      setError("Ingresa tu correo electrónico.");
      return;
    }
    setLoading(true); setError("");
    try {
      const siteUrl = window.location.origin;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        recoveryEmail.trim(),
        { redirectTo: `${siteUrl}/geny/reset-password` }
      );
      if (resetError) throw resetError;
      setRecoverySuccess(true);
    } catch (err: any) {
      setError(err.message || "Error al enviar el enlace de recuperación.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen w-full relative z-10 font-sans">
      
      {/* Left Panel - Login Form */}
      <div className="w-full md:w-[50%] lg:w-[45%] xl:w-[40%] flex flex-col px-8 sm:px-12 lg:px-16 bg-[#050505] border-r border-white/5 shadow-2xl relative shrink-0">
          
          {/* Decoration line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-transparent" />
          
          <div className="mt-12 lg:hidden mb-8 w-full flex justify-center">
            <BrandLogo align="center" />
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-[380px] mx-auto w-full">
            <div className="mb-10">
              <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-white mb-3 leading-none">
                {loginMode === 'login' ? 'Bienvenido.' : loginMode === 'register' ? 'Únete.' : 'Recuperar.'}
              </h1>
              <p className="text-white/40 text-sm font-medium">
                {loginMode === 'recovery' ? 'Recupera el acceso a tu cuenta.' : 'El ecosistema de herramientas para traders.'}
              </p>
            </div>

            {/* Highly Noticeable Segmented Control (Pill Toggle) — hidden during recovery */}
            {loginMode !== 'recovery' && (
            <div className="flex p-1.5 mb-8 bg-white/[0.05] rounded-2xl border border-white/10 relative w-full overflow-hidden shadow-inner">
              
              {/* Sliding Pill Background Indicator */}
              <div className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] z-0 pointer-events-none">
                 <motion.div 
                    initial={false}
                    animate={{ x: loginMode === 'login' ? '0%' : '100%' }}
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-[0_4px_20px_rgba(34,211,238,0.4)]"
                 />
              </div>

              <button 
                onClick={() => {setLoginMode("login"); setError("");}}
                className={`flex-1 py-3 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all relative z-10 flex justify-center items-center ${loginMode === 'login' ? 'text-white drop-shadow-md' : 'text-white/40 hover:text-white/80'}`}
              >
                Identificarse
              </button>
              
              <button 
                onClick={() => {setLoginMode("register"); setError("");}}
                className={`flex-1 py-3 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all relative z-10 flex justify-center items-center ${loginMode === 'register' ? 'text-white drop-shadow-md' : 'text-white/40 hover:text-white/80'}`}
              >
                Crear Cuenta
              </button>
            </div>
            )}

            <div className="relative min-h-[300px]">
              <AnimatePresence mode="wait">
                {loginMode === "login" ? (
                  <motion.div 
                    key="login"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-4"
                  >
                    <SleekInput label="Correo Electrónico" type="email" value={loginEmail} onChange={(e: any) => setLoginEmail(e.target.value)} />
                    <PasswordInput label="Contraseña" value={loginPassword} onChange={(e: any) => setLoginPassword(e.target.value)} onKeyDown={(e: any) => e.key === "Enter" && handleLogin()} />
                    
                    {error && <div className="p-3 mt-2 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-medium">{error}</div>}
                    
                    <div className="mt-8">
                      <Btn onClick={handleLogin} disabled={loading} variant="primary">
                        {loading ? "Verificando..." : "Acceder al Ecosistema"}
                      </Btn>
                    </div>

                    {/* Forgot Password Link */}
                    <button
                      type="button"
                      onClick={() => { setLoginMode("recovery"); setError(""); setRecoverySuccess(false); setRecoveryEmail(loginEmail); }}
                      className="text-white/40 hover:text-cyan-400 text-xs font-medium transition-colors mt-2 text-center"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </motion.div>
                ) : loginMode === "register" ? (
                  <motion.div 
                    key="register"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-2"
                  >
                    <SleekInput label="Nombre Completo" value={regName} onChange={(e: any) => setRegName(e.target.value)} />
                    <SleekInput label="Correo Electrónico" type="email" value={regEmail} onChange={(e: any) => setRegEmail(e.target.value)} />
                    <PasswordInput label="Contraseña" value={regPassword} onChange={(e: any) => setRegPassword(e.target.value)} onGenerate={generateSecurePassword} />
                    <SleekInput label="Ocupación (Ej: Trader)" value={regProf} onChange={(e: any) => setRegProf(e.target.value)} onKeyDown={(e: any) => e.key === "Enter" && handleRegister()} />
                    
                    {error && <div className="p-3 mt-4 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-medium">{error}</div>}
                    
                    <div className="mt-8">
                      <Btn onClick={handleRegister} disabled={loading} variant="primary">
                        {loading ? "Creando..." : "Comenzar"}
                      </Btn>
                    </div>
                  </motion.div>
                ) : (
                  /* Recovery Mode */
                  <motion.div 
                    key="recovery"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-4"
                  >
                    {/* Back button */}
                    <button
                      type="button"
                      onClick={() => { setLoginMode("login"); setError(""); setRecoverySuccess(false); }}
                      className="flex items-center gap-2 text-white/40 hover:text-white text-xs font-medium transition-colors mb-2 self-start"
                    >
                      <ArrowLeft size={14} />
                      Volver al inicio de sesión
                    </button>

                    <AnimatePresence mode="wait">
                      {recoverySuccess ? (
                        <motion.div
                          key="recovery-success"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center text-center py-4"
                        >
                          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
                            <CheckCircle size={32} className="text-emerald-400" />
                          </div>
                          <h3 className="text-xl font-black text-white mb-3">¡Correo Enviado!</h3>
                          <p className="text-white/50 text-sm leading-relaxed mb-2">
                            Hemos enviado un enlace de recuperación a:
                          </p>
                          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 mb-4">
                            <Mail size={14} className="text-cyan-400" />
                            <span className="text-cyan-400 font-mono text-sm font-bold">{recoveryEmail}</span>
                          </div>
                          <p className="text-white/30 text-xs leading-relaxed">
                            Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña. Si no lo ves, revisa la carpeta de spam.
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="recovery-form"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col gap-4"
                        >
                          <div className="flex items-center justify-center mb-2">
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                              <Mail size={22} className="text-cyan-400" />
                            </div>
                          </div>
                          <p className="text-white/50 text-sm text-center leading-relaxed">
                            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                          </p>
                          <SleekInput 
                            label="Correo Electrónico" 
                            type="email" 
                            value={recoveryEmail} 
                            onChange={(e: any) => setRecoveryEmail(e.target.value)} 
                            onKeyDown={(e: any) => e.key === "Enter" && handleRecovery()}
                          />

                          {error && <div className="p-3 mt-2 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-medium">{error}</div>}

                          <div className="mt-6">
                            <Btn onClick={handleRecovery} disabled={loading} variant="gradient">
                              {loading ? "Enviando..." : "Enviar Enlace de Recuperación"}
                            </Btn>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <div className="mt-auto pb-6 pt-4 flex flex-col items-center justify-center opacity-60 hover:opacity-100 transition-opacity duration-300 gap-3">
             <div className="flex items-center gap-3 text-[9px] font-mono tracking-widest uppercase text-white/50">
               <a href="https://site.ingresarios.net/terminos-de-uso-de-informacion" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Términos de Uso</a>
               <span>•</span>
               <a href="https://site.ingresarios.net/politicas-privacidad" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Privacidad</a>
             </div>
             <div className="text-[9px] font-mono tracking-[0.2em] text-white/30">
               &copy; {new Date().getFullYear()} INGRESARIOS
             </div>
          </div>
      </div>

      {/* Right Panel - Branding (Immersive display) */}
      <div className="hidden md:flex flex-col justify-between p-16 flex-1 relative overflow-hidden bg-transparent">
         {/* Top Branding aligned nicely */}
         <div className="relative z-10 flex items-start justify-between w-full">
            <div className="w-16 h-1 mt-4 bg-white/10 rounded-full" />
            <BrandLogo align="right" />
         </div>
         
         {/* Center/Bottom Statement properly centered */}
         <div className="relative z-10 flex-1 flex flex-col justify-center items-start lg:pl-16 xl:pl-32">
            <h2 className="text-5xl lg:text-7xl xl:text-[80px] font-black tracking-tighter leading-[0.95] text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/30 max-w-3xl">
               Herramientas de precisión para mentes disciplinadas.
            </h2>
            <p className="text-lg xl:text-xl text-white/50 mt-8 max-w-xl font-light leading-relaxed">
              Registra tu progreso, optimiza tus posiciones, domina tus emociones y evoluciona tu forma de operar en los mercados.
            </p>
            <div className="flex gap-4 mt-12 flex-wrap">
               {['Hub Ecosistema', 'Geny-B Tracker', 'Posicionamiento Dinámico', 'Diario Emocional'].map((n) => (
                  <div key={n} className="px-5 py-2.5 rounded-full border border-white/20 bg-white/5 text-[11px] uppercase tracking-widest text-white/80 backdrop-blur-md">
                    {n}
                  </div>
               ))}
            </div>
         </div>
         
         <div className="relative z-10 flex items-end justify-between w-full mt-auto">
            {/* Left aligned Version */}
            <div className="flex flex-col">
              <span className="text-white/20 font-mono uppercase tracking-[0.3em] text-[10px]">VERSIÓN 2.5.0</span>
            </div>
            
            {/* Right aligned Rotating Quote Widget */}
            <div className="flex flex-col text-right min-w-[400px] relative h-[90px] justify-end pointer-events-none">
               <AnimatePresence mode="wait">
                 <motion.div
                   key={quoteIdx}
                   initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                   animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                   exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                   transition={{ duration: 0.8, ease: "easeInOut" }}
                   className="absolute bottom-0 right-0 w-full"
                 >
                   <p className="text-[13px] md:text-[15px] font-bold text-white/80 leading-snug">"{quotes[quoteIdx].t}"</p>
                   <p className="text-[11px] md:text-[12px] text-white/40 mt-1.5 font-light tracking-wide">{quotes[quoteIdx].s}</p>
                 </motion.div>
               </AnimatePresence>
            </div>
         </div>
      </div>
    </div>
  );
}
