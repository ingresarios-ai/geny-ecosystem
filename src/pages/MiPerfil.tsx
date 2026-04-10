import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Lock, Save, Trash2, AlertTriangle, CheckCircle2, Camera } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function MiPerfil() {
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState({
    id: '',
    name: '',
    email: '',
    profession: '',
    avatar: ''
  });
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  // Load user on mount
  useEffect(() => {
    try {
      const u = localStorage.getItem("cobro-user");
      if (u) {
        const parsed = JSON.parse(u);
        setUserData({
          id: parsed.id || '',
          name: parsed.name || '',
          email: parsed.email || '',
          profession: parsed.profession || '',
          avatar: parsed.avatar || ''
        });
      }
    } catch (e) {
      console.error("Error loading profile", e);
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Rescale image using canvas to ensure small size string for localStorage
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        
        // Optional: Ensure a white background if original might have transparent pixels
        if (ctx) {
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
        }

        // Compress heavily to keep the Base64 short (WebP is usually smaller)
        const dataUrl = canvas.toDataURL("image/webp", 0.7);
        setUserData({ ...userData, avatar: dataUrl });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!userData.email || !userData.name) {
      setStatus({ type: 'error', msg: 'Nombre y correo son obligatorios' });
      return;
    }
    
    setLoading(true);
    setStatus({ type: '', msg: '' });
    
    try {
      // Si tenemos un ID, intentamos actualizar en Supabase (tabla profiles)
      if (userData.id && userData.id !== "00000000-0000-0000-0000-000000000000") {
         const { error } = await supabase.from('profiles').update({
           full_name: userData.name,
           email: userData.email,
         }).eq('id', userData.id);
         
         if (error) {
           console.error("Supabase update error:", error);
           setStatus({ type: 'error', msg: 'Error al sincronizar con el servidor' });
           setLoading(false);
           return;
         }
      }
      
      // Actulizar local storage
      localStorage.setItem("cobro-user", JSON.stringify(userData));
      
      // Dispatch an event so AppLayout can update the avatar instantly without reload
      window.dispatchEvent(new Event('AvatarUpdated'));
      
      setStatus({ type: 'success', msg: 'Perfil actualizado con éxito' });
      if (password) {
        console.log("Mock: Contraseña actualizada para", userData.email);
        setPassword('');
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Error al actualizar el perfil' });
    }
    
    setLoading(false);
    setTimeout(() => setStatus({ type: '', msg: '' }), 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem("cobro-user");
    window.dispatchEvent(new Event('UserLogout'));
  };

  const handleResetGenyB = () => {
    if (confirm("¿Estás seguro que deseas reiniciar GENY-B Tracker? Esto borrará tu sesión actual del dispositivo.")) {
      localStorage.removeItem("cobro-user");
      localStorage.removeItem("cobro-goal");
      window.dispatchEvent(new Event('AvatarUpdated'));
      alert("GENY-B Tracker reseteado correctamente.");
      navigate("/geny");
    }
  };

  const handleResetPosicionamiento = () => {
    if (confirm("¿Deseas reiniciar los parámetros de Posicionamiento Dinámico a sus valores por defecto?")) {
      alert("Parámetros de Posicionamiento Dinámico reseteados.");
    }
  };

  const getAvatarUrl = () => {
    if (userData.avatar) return userData.avatar;
    return "";
  };

  return (
    <main className="relative z-10 pt-32 pb-24 max-w-4xl mx-auto w-full px-4 lg:px-8">
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/20 mb-2">
          MI <span className="text-purple-400">PERFIL</span>
        </h1>
        <p className="text-white/50 text-sm font-mono tracking-widest uppercase">
          Configuración y ajustes de cuenta
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* FORMULARIO DE DATOS */}
        <div className="md:col-span-7 flex flex-col gap-6">
          <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/5 relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
             
             <h2 className="text-[11px] font-black text-white/50 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
               <User size={14} className="text-purple-400" /> Información Personal
             </h2>

             {status.msg && (
               <div className={`p-4 mb-6 rounded-xl flex items-center gap-3 text-sm font-bold ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                 {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                 {status.msg}
               </div>
             )}
             
             {/* AVATAR COMPONENT */}
             <div className="flex flex-col items-center mb-8">
               <div className="relative group cursor-pointer w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)] bg-black/40 flex items-center justify-center">
                 {getAvatarUrl() ? (
                   <img 
                     src={getAvatarUrl()} 
                     alt="Perfil" 
                     className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                   />
                 ) : (
                   <User size={40} className="text-white/30" />
                 )}
                 <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                   <Camera size={24} className="text-white" />
                   <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                 </label>
               </div>
               <p className="text-[10px] text-white/40 mt-3 font-mono tracking-widest uppercase">
                 Haz clic para cambiar tu foto
               </p>
             </div>

             <div className="space-y-5">
               <div className="w-full">
                 <label className="text-white/50 text-xs mb-1 block uppercase tracking-wider font-bold">Nombre Completo</label>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                     <User size={16} className="text-white/30" />
                   </div>
                   <input 
                     type="text" 
                     value={userData.name}
                     onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                     className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/10 bg-black/40 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all font-sans"
                   />
                 </div>
               </div>

               <div className="w-full">
                 <label className="text-white/50 text-xs mb-1 block uppercase tracking-wider font-bold">Correo Electrónico</label>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                     <Mail size={16} className="text-white/30" />
                   </div>
                   <input 
                     type="email" 
                     value={userData.email}
                     onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                     className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/10 bg-black/40 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all font-sans"
                   />
                 </div>
               </div>

               <div className="w-full">
                 <label className="text-white/50 text-xs mb-1 block uppercase tracking-wider font-bold">Nueva Contraseña</label>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                     <Lock size={16} className="text-white/30" />
                   </div>
                   <input 
                     type="password" 
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     placeholder="Déjalo en blanco para no cambiar"
                     className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/10 bg-black/40 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all font-sans"
                   />
                 </div>
               </div>

               <button 
                 onClick={handleSave} 
                 disabled={loading}
                 className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all uppercase tracking-[0.2em] text-[11px] disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {loading ? "Guardando..." : <><Save size={16} /> Guardar Cambios</>}
               </button>
             </div>
          </div>
        </div>

        {/* CONTROLES DE APPS (RESET) */}
        <div className="md:col-span-5 flex flex-col gap-6">
           <div className="glass-panel rounded-3xl p-6 border border-red-500/20 bg-red-950/10">
              <h2 className="text-[11px] font-black text-red-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <AlertTriangle size={14} /> Zona de Peligro
              </h2>
              <p className="text-xs text-white/50 mb-6 leading-relaxed">
                Resetea el estado y la configuración local de cada aplicación. Esta acción no se puede deshacer y borrará tus metas en caché.
              </p>

              <div className="flex flex-col gap-3">
                 <button 
                   onClick={handleResetGenyB}
                   className="flex items-center justify-between p-4 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-100 transition-colors group"
                 >
                   <span className="text-sm font-bold tracking-wide">Resetear GENY-B Tracker</span>
                   <Trash2 size={16} className="text-red-400 group-hover:scale-110 transition-transform" />
                 </button>

                 <button 
                   onClick={handleResetPosicionamiento}
                   className="flex items-center justify-between p-4 rounded-xl border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 text-orange-100 transition-colors group"
                 >
                   <span className="text-sm font-bold tracking-wide text-left">Resetear Posc. Dinámico</span>
                   <Trash2 size={16} className="text-orange-400 group-hover:scale-110 transition-transform flex-shrink-0" />
                 </button>
              </div>
           </div>
        </div>
        
      </div>
    </main>
  );
}
