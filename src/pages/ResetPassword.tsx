import { useState, useEffect } from "react";
import { Eye, EyeOff, CheckCircle, AlertCircle, Lock } from "lucide-react";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase automatically handles the recovery token from the URL hash
    // when the user arrives from the email link. We listen for the PASSWORD_RECOVERY event.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        setSessionReady(true);
        setCheckingSession(false);
      }
    });

    // Also check if we already have a session (in case the event fired before we subscribed)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSessionReady(true);
      }
      setCheckingSession(false);
    };

    // Small delay to let Supabase process the URL hash
    setTimeout(checkSession, 1500);

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async () => {
    setError("");

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError("Por favor completa ambos campos.");
      return;
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/geny");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Error al actualizar la contraseña.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_110%)]" />
        <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-900/30 blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-emerald-900/20 blur-[150px] mix-blend-screen" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 sm:p-10 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.5)] relative overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-transparent" />

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center">
              <Lock size={28} className="text-cyan-400" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {checkingSession ? (
              <motion.div
                key="checking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto mb-4" />
                <p className="text-white/50 text-sm">Verificando enlace de recuperación...</p>
              </motion.div>
            ) : success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle size={32} className="text-emerald-400" />
                </div>
                <h2 className="text-2xl font-black text-white mb-3">¡Contraseña Actualizada!</h2>
                <p className="text-white/50 text-sm mb-6">
                  Tu contraseña ha sido cambiada exitosamente. Serás redirigido al ecosistema en unos segundos...
                </p>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3 }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
                  />
                </div>
              </motion.div>
            ) : !sessionReady ? (
              <motion.div
                key="no-session"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
                  <AlertCircle size={32} className="text-red-400" />
                </div>
                <h2 className="text-2xl font-black text-white mb-3">Enlace Inválido</h2>
                <p className="text-white/50 text-sm mb-6">
                  Este enlace de recuperación ha expirado o no es válido. Por favor solicita uno nuevo desde la pantalla de inicio de sesión.
                </p>
                <button
                  onClick={() => navigate("/geny")}
                  className="w-full py-4 rounded-xl font-bold text-sm tracking-wide bg-white text-black hover:bg-gray-200 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                >
                  Volver al Inicio
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 text-center tracking-tight">
                  Nueva Contraseña
                </h2>
                <p className="text-white/40 text-sm text-center mb-8">
                  Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta.
                </p>

                {/* New Password */}
                <div className="w-full relative mb-4">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 pt-6 text-white placeholder-transparent focus:outline-none focus:border-cyan-400 focus:bg-white/[0.05] transition-all peer font-sans text-sm pr-12"
                    placeholder="Nueva Contraseña"
                  />
                  <label className="absolute left-4 top-2 text-[10px] uppercase font-bold tracking-widest text-white/40 peer-focus:text-cyan-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest transition-all pointer-events-none">
                    Nueva Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-1.5 z-20"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="w-full relative mb-4">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleReset()}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 pt-6 text-white placeholder-transparent focus:outline-none focus:border-cyan-400 focus:bg-white/[0.05] transition-all peer font-sans text-sm pr-12"
                    placeholder="Confirmar Contraseña"
                  />
                  <label className="absolute left-4 top-2 text-[10px] uppercase font-bold tracking-widest text-white/40 peer-focus:text-cyan-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest transition-all pointer-events-none">
                    Confirmar Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-1.5 z-20"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password strength indicator */}
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        newPassword.length >= level * 3
                          ? level <= 1
                            ? "bg-red-400"
                            : level <= 2
                            ? "bg-yellow-400"
                            : level <= 3
                            ? "bg-cyan-400"
                            : "bg-emerald-400"
                          : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-white/30 mb-6">
                  Mínimo 6 caracteres. Incluye mayúsculas, números y símbolos para mayor seguridad.
                </p>

                {error && (
                  <div className="p-3 mb-4 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-medium">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleReset}
                  disabled={loading}
                  className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] ${
                    loading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-[1.02] active:scale-95"
                  }`}
                >
                  <span className="relative z-10">
                    {loading ? "Actualizando..." : "Establecer Nueva Contraseña"}
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center mt-8 opacity-60">
          <img src="/logo.png" alt="Ingresarios" className="h-4 object-contain mb-3" />
          <div className="text-[9px] font-mono tracking-[0.2em] text-white/30">
            &copy; {new Date().getFullYear()} INGRESARIOS
          </div>
        </div>
      </motion.div>
    </div>
  );
}
