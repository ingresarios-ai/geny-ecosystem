import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { User, Shield, Activity, RefreshCw, Edit3, Trash2, Globe2, Eye, EyeOff, LogOut, ArrowLeft } from "lucide-react";
import AdminAuth from "./AdminAuth";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [posData, setPosData] = useState<any[]>([]);
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Edit User State
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPass, setEditPass] = useState("");
  const [editRole, setEditRole] = useState("user");
  const [showPass, setShowPass] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  const loadData = async () => {
    setLoading(true);
    // 1. Verify admin
    try {
      const u = localStorage.getItem("cobro-user");
      if (!u) {
        setIsAdminAuth(false);
        setLoading(false);
        return;
      }
      const parsed = JSON.parse(u);
      
      const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', parsed.id).single();
      if (!myProfile || myProfile.role !== 'admin') {
         setIsAdminAuth(false); 
         setLoading(false);
         return;
      }
      
      setIsAdminAuth(true);

      // Fetch all required data
      const { data: allP } = await supabase.from('profiles').select('*');
      const { data: allE } = await supabase.from('entries').select('*');
      const { data: allPos } = await supabase.from('posicionamiento_data').select('*');

      if (allP) setUsers(allP);
      if (allE) setEntries(allE);
      if (allPos) setPosData(allPos);

    } catch(e) {
      console.error(e);
      navigate("/geny");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [navigate]);

  const handleSelectUser = (u: any) => {
    setSelectedUser(u);
    setEditMode(false);
    setConfirmReset(false);
    setActionMsg("");
  };

  const handleEditSetup = () => {
    setEditName(selectedUser.full_name || "");
    setEditEmail(selectedUser.email || "");
    setEditRole(selectedUser.role || "user");
    setEditPass(""); // Always blank, only send if trying to change it
    setEditMode(true);
  };

  const saveUserEdits = async () => {
    setActionMsg("Guardando cambios...");
    try {
      const u = localStorage.getItem("cobro-user");
      let token = "";
      if (u) {
        const { data: sessionData } = await supabase.auth.getSession();
        token = sessionData.session?.access_token || "";
      }

      const payload: any = {
        email: editEmail.trim(),
        user_metadata: { full_name: editName.trim() }
      };

      if (editPass.trim() !== "") {
         payload.password = editPass.trim();
      }

      const url = import.meta.env.VITE_SUPABASE_URL || 'https://sozizuskspotnixujipj.supabase.co';
      const res = await fetch(`${url}/functions/v1/admin-users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          action: "update_user",
          targetUserId: selectedUser.id,
          payload
        })
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to update");

      // Also update role if changed (since Edge function doesn't update role, we do it directly)
      if (editRole !== selectedUser.role) {
         await supabase.from("profiles").update({ role: editRole }).eq("id", selectedUser.id);
      }

      setActionMsg("✅ Cambios guardados exitosamente.");
      loadData(); // reload
      
      setSelectedUser({ ...selectedUser, full_name: editName, email: editEmail, role: editRole });
      
    } catch(err: any) {
      setActionMsg(`❌ Error: ${err.message}`);
    }
  };

  const handleResetApps = async () => {
    try {
      setActionMsg("Reseteando data...");
      await supabase.from("entries").delete().eq("user_id", selectedUser.id);
      await supabase.from("posicionamiento_data").delete().eq("user_id", selectedUser.id);
      setActionMsg("✅ Data reseteada exitosamente.");
      setConfirmReset(false);
      loadData();
    } catch(e: any) {
      setActionMsg(`❌ Error: ${e.message}`);
    }
  };

  const fmt = (v: number) => `$${v.toLocaleString('en-US', {minimumFractionDigits:0, maximumFractionDigits:2})}`;

  if (loading) return <div className="min-h-screen bg-[#0a0202] flex items-center justify-center font-mono tracking-widest text-red-500">CARGANDO ADMIN PANEL...</div>;

  if (!isAdminAuth) {
    return <AdminAuth onLogin={(u) => { localStorage.setItem("cobro-user", JSON.stringify(u)); loadData(); }} />
  }

  return (
    <div className="min-h-screen bg-[#0a0202] relative overflow-x-hidden font-sans text-white">
      {/* Background for admin portal */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/10 via-black to-black pointer-events-none" />
      <div className="relative z-10 pt-16 pb-24 max-w-7xl mx-auto w-full px-4 lg:px-8 font-sans">
        
        {/* Navigation Bar inside Admin */}
        <div className="flex items-center justify-between mb-12 glass-panel p-4 rounded-2xl border-white/5">
           <button onClick={() => navigate("/geny")} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">
              <ArrowLeft size={16}/> Volver al Hub
           </button>
           <button onClick={() => { localStorage.removeItem("cobro-user"); setIsAdminAuth(false); }} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors">
              <LogOut size={16}/> Cerrar Sesión Segura
           </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center gap-3">
             <Shield className="text-cyan-400"/> PANEL DE ADMINISTRACIÓN
          </h1>
          <p className="text-white/50 text-xs font-mono tracking-widest uppercase mt-1">Gestión del ecosistema GENY</p>
        </div>
        <button onClick={loadData} className="px-4 py-2 border border-white/10 rounded-lg text-white/50 hover:bg-white/5 hover:text-white transition-all flex items-center gap-2 text-xs uppercase tracking-widest">
           <RefreshCw size={14}/> Refrescar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LISTA DE USUARIOS */}
        <div className="lg:col-span-4 flex flex-col gap-4">
           <div className="glass-panel p-5 rounded-2xl border border-white/5 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <h2 className="text-xs font-black uppercase tracking-widest text-white/50 mb-4 flex items-center gap-2">
                 <User size={14} className="text-purple-400"/> COMPRADORES ({users.length})
              </h2>
              <div className="space-y-2">
                 {users.map(u => (
                   <div 
                     key={u.id} 
                     onClick={() => handleSelectUser(u)}
                     className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedUser?.id === u.id ? 'bg-purple-500/10 border-purple-500/30' : 'bg-black/30 border-white/5 hover:bg-white/5'}`}
                   >
                     <div className="flex justify-between items-start">
                       <div>
                         <div className="font-bold text-sm text-white">{u.full_name || "Sin nombre"}</div>
                         <div className="text-[10px] text-white/40 font-mono mt-0.5 truncate max-w-[180px]">{u.email}</div>
                       </div>
                       {u.role === 'admin' && <div className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[9px] font-black uppercase rounded-md">Admin</div>}
                     </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* DETALLES DEL USUARIO Y REPORTES */}
        <div className="lg:col-span-8">
           {!selectedUser ? (
             <div className="glass-panel h-full flex flex-col items-center justify-center p-10 text-center rounded-2xl border border-white/5 opacity-50">
                <Globe2 size={48} className="text-white/20 mb-4"/>
                <div className="font-bold tracking-widest text-sm uppercase">Selecciona un usuario</div>
                <div className="text-[10px] text-white/50 mt-2">Para ver detalles y configurar su cuenta</div>
             </div>
           ) : (
             <div className="space-y-6">
                
                {/* HEAD DETAILS */}
                <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4">
                      {!editMode && (
                        <button onClick={handleEditSetup} className="flex items-center gap-2 text-xs uppercase tracking-widest font-black text-cyan-400 hover:text-cyan-300 transition-colors">
                           <Edit3 size={14}/> Editar Entorno
                        </button>
                      )}
                   </div>
                   
                   <h2 className="text-2xl font-black text-white">{selectedUser.full_name || "Sin Nombre"}</h2>
                   <p className="text-white/50 font-mono text-sm">{selectedUser.email}</p>
                   <div className="text-[10px] mt-2 uppercase tracking-widest text-purple-400 font-bold border border-purple-500/30 bg-purple-500/10 inline-block px-2 py-1 rounded">
                     {selectedUser.id}
                   </div>
                   {actionMsg && <div className="mt-4 p-3 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-cyan-400">{actionMsg}</div>}
                </div>

                {/* EDIT MODE */}
                {editMode && (
                  <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 bg-cyan-500/5">
                     <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-4">Editar Credenciales y Rol</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-white/40 block mb-1">Nombre Completo</label>
                          <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"/>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-white/40 block mb-1">Correo (Login)</label>
                          <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"/>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-white/40 block mb-1">Nueva Contraseña (Opcional)</label>
                          <div className="relative">
                            <input type={showPass?"text":"password"} value={editPass} onChange={(e) => setEditPass(e.target.value)} placeholder="Dejar en blanco para mantener" className="w-full bg-black/50 border border-white/10 rounded-lg pl-3 pr-10 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"/>
                            <button onClick={()=>setShowPass(!showPass)} className="absolute right-3 top-2.5 text-white/40">{showPass?<EyeOff size={14}/>:<Eye size={14}/>}</button>
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-white/40 block mb-1">Rol del Ecosistema</label>
                          <select value={editRole} onChange={(e) => setEditRole(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 appearance-none">
                             <option value="user">USER (Comprador Normal)</option>
                             <option value="admin">ADMIN (Privilegios Ecosistema)</option>
                          </select>
                        </div>
                     </div>
                     <div className="flex gap-2">
                       <button onClick={saveUserEdits} className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest text-xs rounded-lg transition-colors">Guardar</button>
                       <button onClick={() => {setEditMode(false); setActionMsg("");}} className="px-6 py-2 bg-transparent border border-white/20 text-white hover:bg-white/10 font-bold uppercase tracking-widest text-xs rounded-lg transition-colors">Cancelar</button>
                     </div>
                  </div>
                )}

                {/* APP DATA PREVIEW */}
                {!editMode && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     
                     {/* GENY B */}
                     <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20">
                        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-emerald-400 mb-4">
                           <Activity size={16}/> Geny-B Tracker
                        </div>
                        
                        {(() => {
                           const userE = entries.filter(e => e.user_id === selectedUser.id);
                           const wins = userE.filter(e => e.amount > 0).reduce((s, e) => s + e.amount, 0);
                           const losses = userE.filter(e => e.amount < 0).reduce((s, e) => s + Math.abs(e.amount), 0);
                           const global = userE.reduce((s, e) => s + e.amount, 0);

                           return (
                             <div className="space-y-3">
                               <div className="flex justify-between items-center bg-black/30 p-2 rounded-lg">
                                 <span className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Total Ganado</span>
                                 <span className="font-mono text-sm text-emerald-400">{fmt(wins)}</span>
                               </div>
                               <div className="flex justify-between items-center bg-black/30 p-2 rounded-lg">
                                 <span className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Total Perdido</span>
                                 <span className="font-mono text-sm text-red-400">{fmt(losses)}</span>
                               </div>
                               <div className="flex justify-between items-center bg-black/30 p-2 rounded-lg border border-emerald-500/20">
                                 <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">Saldo Global Neta</span>
                                 <span className={`font-mono text-base font-black ${global >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmt(global)}</span>
                               </div>
                               <div className="text-right text-[9px] text-white/30 uppercase pt-2">
                                 {userE.length} Registros Activos
                               </div>
                             </div>
                           );
                        })()}
                     </div>

                     {/* POSICIONAMIENTO */}
                     <div className="glass-panel p-5 rounded-2xl border border-orange-500/20">
                        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-orange-400 mb-4">
                           <Activity size={16}/> Posicionamiento Dinamico
                        </div>
                        
                        {(() => {
                           const userPos = posData.filter(e => e.user_id === selectedUser.id).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                           
                           if (userPos.length === 0) {
                              return <div className="h-24 flex items-center justify-center text-[10px] uppercase tracking-widest font-mono text-white/20">Sin simulaciones guardadas</div>
                           }

                           const last = userPos[0];
                           return (
                             <div className="space-y-3">
                               <div className="text-[10px] text-white/40 uppercase tracking-widest text-center mb-1">Última Simulación ({new Date(last.created_at).toLocaleDateString()})</div>
                               <div className="flex justify-between items-center bg-black/30 p-2 rounded-lg">
                                 <span className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Escenario</span>
                                 <span className="font-mono text-xs text-orange-300 uppercase">{last.scenario_type}</span>
                               </div>
                               <div className="flex justify-between items-center bg-black/30 p-2 rounded-lg">
                                 <span className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Riesgo / Trade</span>
                                 <span className="font-mono text-xs text-white">{fmt(last.risk_per_trade || 0)}</span>
                               </div>
                               <div className="flex justify-between items-center bg-black/30 p-2 rounded-lg border border-orange-500/20">
                                 <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">Resultado</span>
                                 <span className={`font-mono text-xs font-black ${last.success ? "text-emerald-400" : last.failure ? "text-red-400" : "text-white"}`}>
                                    {last.success ? "META ✅" : last.failure ? "STOPPED ❌" : "PENDIENTE"}
                                 </span>
                               </div>
                               <div className="text-right text-[9px] text-white/30 uppercase pt-2">
                                 {userPos.length} Simulaciones Totales
                               </div>
                             </div>
                           );
                        })()}
                     </div>
                  </div>
                )}

                {/* DANGER ZONE */}
                {!editMode && (
                  <div className="mt-8 border border-red-500/30 bg-red-500/5 p-5 rounded-2xl">
                     <h3 className="text-xs font-black tracking-widest uppercase text-red-500 mb-2 flex items-center gap-2">
                       <Trash2 size={14}/> Danger Zone
                     </h3>
                     <p className="text-[10px] text-white/50 mb-4">Resetear las Apps elimina el historial operativo de Geny-B y Posicionamiento, el cliente perderá sus promedios históricos pero mantendrá su acceso al ecosistema.</p>
                     
                     {!confirmReset ? (
                       <button onClick={() => setConfirmReset(true)} className="px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest rounded flex justify-center items-center gap-2">
                          Resetear Datos del Usuario
                       </button>
                     ) : (
                       <div className="flex items-center gap-2">
                         <button onClick={handleResetApps} className="px-4 py-2 bg-red-500 text-white font-black uppercase tracking-widest text-xs rounded transition-colors flex flex-1 justify-center items-center">
                            Confirmar Reseteo Permanente
                         </button>
                         <button onClick={() => setConfirmReset(false)} className="px-4 py-2 border border-white/20 text-white/70 hover:bg-white/10 font-bold uppercase tracking-widest text-xs rounded transition-colors">
                            Cancelar
                         </button>
                       </div>
                     )}
                  </div>
                )}
             </div>
           )}
        </div>

      </div>
    </div>
    </div>
  );
}
