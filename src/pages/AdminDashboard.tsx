import { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { User, Shield, Activity, RefreshCw, Edit3, Trash2, Globe2, Eye, EyeOff, LogOut, ArrowLeft, UserPlus, TrendingUp, TrendingDown, BarChart3, PieChart, Users, Crown } from "lucide-react";
import AdminAuth from "./AdminAuth";

const BrandLogo = ({ align = "left" }: { align?: "left" | "right" | "center" }) => {
  const al = align === "center" ? "items-center text-center" : align === "right" ? "items-end text-right" : "items-start text-left";
  const m = align === "center" ? "" : align === "right" ? "mr-1" : "ml-1";
  return (
    <div className={`flex flex-col select-none ${al}`}>
      <div className={`text-4xl lg:text-5xl font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]`}>
        GENY
      </div>
      <div className={`font-bold text-cyan-400 text-[9px] lg:text-[11px] tracking-[0.4em] uppercase mt-1 ${m}`}>
        Ecosystem
      </div>
    </div>
  );
};

// ─── Mini Bar Chart Component (Pure CSS) ───
const MiniBarChart = ({ data, maxVal, color }: { data: { label: string; value: number }[]; maxVal: number; color: string }) => (
  <div className="flex items-end gap-1 h-32 w-full">
    {data.map((d, i) => {
      const h = maxVal > 0 ? Math.max((d.value / maxVal) * 100, 2) : 2;
      return (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[8px] px-1.5 py-0.5 rounded whitespace-nowrap font-mono z-10">
            ${d.value.toLocaleString()}
          </div>
          <div
            className={`w-full rounded-t-sm transition-all duration-500 ${color}`}
            style={{ height: `${h}%`, minHeight: '2px' }}
          />
          <span className="text-[7px] text-white/30 font-mono truncate w-full text-center">{d.label}</span>
        </div>
      );
    })}
  </div>
);

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
  const [activeTab, setActiveTab] = useState<'analytics' | 'students' | 'admins'>('analytics');

  // Edit User State
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPass, setEditPass] = useState("");
  const [editRole, setEditRole] = useState("user");
  const [showPass, setShowPass] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  // Add Admin State
  const [addAdminEmail, setAddAdminEmail] = useState("");
  const [addAdminMsg, setAddAdminMsg] = useState("");
  const [addAdminLoading, setAddAdminLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
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

  // ─── Derived data ───
  const adminUsers = useMemo(() => users.filter(u => u.role === 'admin'), [users]);
  const studentUsers = useMemo(() => users.filter(u => u.role !== 'admin'), [users]);

  const globalAnalytics = useMemo(() => {
    const totalWins = entries.filter(e => e.amount > 0).reduce((s, e) => s + Number(e.amount), 0);
    const totalLosses = entries.filter(e => e.amount < 0).reduce((s, e) => s + Math.abs(Number(e.amount)), 0);
    const netResult = entries.reduce((s, e) => s + Number(e.amount), 0);
    const totalTrades = entries.length;
    const winCount = entries.filter(e => e.amount > 0).length;
    const lossCount = entries.filter(e => e.amount < 0).length;
    const winRate = totalTrades > 0 ? ((winCount / totalTrades) * 100).toFixed(1) : "0";
    const avgWin = winCount > 0 ? totalWins / winCount : 0;
    const avgLoss = lossCount > 0 ? totalLosses / lossCount : 0;

    return { totalWins, totalLosses, netResult, totalTrades, winCount, lossCount, winRate, avgWin, avgLoss };
  }, [entries]);

  // Per-student performance for chart
  const studentPerformance = useMemo(() => {
    return studentUsers.map(u => {
      const userE = entries.filter(e => e.user_id === u.id);
      const wins = userE.filter(e => e.amount > 0).reduce((s, e) => s + Number(e.amount), 0);
      const losses = userE.filter(e => e.amount < 0).reduce((s, e) => s + Math.abs(Number(e.amount)), 0);
      const net = userE.reduce((s, e) => s + Number(e.amount), 0);
      return { id: u.id, name: u.full_name || u.email?.split('@')[0] || 'N/A', wins, losses, net, trades: userE.length };
    }).filter(s => s.trades > 0).sort((a, b) => b.net - a.net);
  }, [studentUsers, entries]);

  // Monthly data for chart
  const monthlyData = useMemo(() => {
    const months: Record<string, { wins: number; losses: number }> = {};
    entries.forEach(e => {
      const d = new Date(e.date || e.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!months[key]) months[key] = { wins: 0, losses: 0 };
      if (e.amount > 0) months[key].wins += Number(e.amount);
      else months[key].losses += Math.abs(Number(e.amount));
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([k, v]) => ({ label: k.slice(5), ...v }));
  }, [entries]);

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
    setEditPass("");
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

      if (editRole !== selectedUser.role) {
         await supabase.from("profiles").update({ role: editRole }).eq("id", selectedUser.id);
      }

      setActionMsg("✅ Cambios guardados exitosamente.");
      loadData();
      
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

  const handleAddAdmin = async () => {
    if (!addAdminEmail.trim()) return;
    setAddAdminLoading(true);
    setAddAdminMsg("");
    try {
      const target = users.find(u => u.email === addAdminEmail.trim());
      if (!target) {
        setAddAdminMsg("❌ Ese correo no existe en el ecosistema. El usuario debe registrarse primero.");
        setAddAdminLoading(false);
        return;
      }
      if (target.role === 'admin') {
        setAddAdminMsg("⚠️ Este usuario ya es administrador.");
        setAddAdminLoading(false);
        return;
      }
      await supabase.from("profiles").update({ role: "admin" }).eq("id", target.id);
      setAddAdminMsg(`✅ ${target.full_name || target.email} ahora es Administrador.`);
      setAddAdminEmail("");
      loadData();
    } catch (err: any) {
      setAddAdminMsg(`❌ Error: ${err.message}`);
    }
    setAddAdminLoading(false);
  };

  const handleRemoveAdmin = async (userId: string) => {
    const me = JSON.parse(localStorage.getItem("cobro-user") || "{}");
    if (userId === me.id) {
      setAddAdminMsg("⚠️ No puedes quitarte el rol de admin a ti mismo.");
      return;
    }
    try {
      await supabase.from("profiles").update({ role: "user" }).eq("id", userId);
      setAddAdminMsg("✅ Permisos de admin revocados.");
      loadData();
    } catch (err: any) {
      setAddAdminMsg(`❌ Error: ${err.message}`);
    }
  };

  const fmt = (v: number) => `$${v.toLocaleString('en-US', {minimumFractionDigits:0, maximumFractionDigits:2})}`;

  if (loading) return <div className="min-h-screen bg-[#0a0202] flex items-center justify-center font-mono tracking-widest text-red-500">CARGANDO ADMIN PANEL...</div>;

  if (!isAdminAuth) {
    return <AdminAuth onLogin={(u) => { localStorage.setItem("cobro-user", JSON.stringify(u)); loadData(); }} />
  }

  return (
    <div className="min-h-screen bg-[#0a0202] relative overflow-x-hidden font-sans text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/10 via-black to-black pointer-events-none" />
      <div className="relative z-10 pt-16 pb-24 max-w-7xl mx-auto w-full px-4 lg:px-8 font-sans">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-8 glass-panel p-4 rounded-2xl border-white/5">
           <button onClick={() => navigate("/geny")} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">
              <ArrowLeft size={16}/> Volver al Hub
           </button>
           <button onClick={() => { localStorage.removeItem("cobro-user"); supabase.auth.signOut(); setIsAdminAuth(false); }} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors">
              <LogOut size={16}/> Cerrar Sesión Segura
           </button>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-6">
            <BrandLogo align="left" />
            <div className="h-10 w-px bg-white/10 hidden md:block" />
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-purple-500">
                 PANEL ADMIN
              </h1>
              <p className="text-white/50 text-xs font-mono tracking-widest uppercase mt-1">Gestión del ecosistema</p>
            </div>
          </div>
          <button onClick={loadData} className="px-4 py-2 border border-white/10 rounded-lg text-white/50 hover:bg-white/5 hover:text-white transition-all flex items-center gap-2 text-xs uppercase tracking-widest">
             <RefreshCw size={14}/> Refrescar
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto hide-scrollbar">
          {[
            { key: 'analytics' as const, label: 'Análisis General', icon: <BarChart3 size={14}/> },
            { key: 'students' as const, label: `Alumnos (${studentUsers.length})`, icon: <Users size={14}/> },
            { key: 'admins' as const, label: `Administradores (${adminUsers.length})`, icon: <Crown size={14}/> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSelectedUser(null); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.key 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                  : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10 hover:text-white/70'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════ */}
        {/* TAB: ANALYTICS */}
        {/* ═══════════════════════════════════════════════════ */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={16} className="text-emerald-400"/>
                  <span className="text-[9px] uppercase tracking-widest font-bold text-white/40">Ganancias Totales</span>
                </div>
                <div className="text-2xl font-black text-emerald-400 font-mono">{fmt(globalAnalytics.totalWins)}</div>
                <div className="text-[9px] text-white/30 mt-1 font-mono">{globalAnalytics.winCount} operaciones ganadoras</div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-red-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown size={16} className="text-red-400"/>
                  <span className="text-[9px] uppercase tracking-widest font-bold text-white/40">Pérdidas Totales</span>
                </div>
                <div className="text-2xl font-black text-red-400 font-mono">{fmt(globalAnalytics.totalLosses)}</div>
                <div className="text-[9px] text-white/30 mt-1 font-mono">{globalAnalytics.lossCount} operaciones perdedoras</div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 size={16} className="text-cyan-400"/>
                  <span className="text-[9px] uppercase tracking-widest font-bold text-white/40">Resultado Neto</span>
                </div>
                <div className={`text-2xl font-black font-mono ${globalAnalytics.netResult >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {fmt(globalAnalytics.netResult)}
                </div>
                <div className="text-[9px] text-white/30 mt-1 font-mono">{globalAnalytics.totalTrades} operaciones totales</div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-purple-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <PieChart size={16} className="text-purple-400"/>
                  <span className="text-[9px] uppercase tracking-widest font-bold text-white/40">Win Rate Global</span>
                </div>
                <div className="text-2xl font-black text-purple-400 font-mono">{globalAnalytics.winRate}%</div>
                <div className="text-[9px] text-white/30 mt-1 font-mono">
                  Avg Win: {fmt(globalAnalytics.avgWin)} / Avg Loss: {fmt(globalAnalytics.avgLoss)}
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Gains vs Losses Donut */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/50 mb-6 flex items-center gap-2">
                  <PieChart size={14} className="text-cyan-400"/> Distribución Global: Ganancias vs Pérdidas
                </h3>
                <div className="flex flex-col items-center gap-6">
                  {/* Donut Chart using SVG */}
                  {(() => {
                    const total = globalAnalytics.totalWins + globalAnalytics.totalLosses;
                    const winPct = total > 0 ? (globalAnalytics.totalWins / total) * 100 : 50;
                    const lossPct = 100 - winPct;
                    const winDash = (winPct / 100) * 251.2;
                    const lossDash = (lossPct / 100) * 251.2;
                    return (
                      <div className="relative w-48 h-48">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                          {/* Losses arc */}
                          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(239,68,68,0.3)" strokeWidth="12"
                            strokeDasharray={`${lossDash} ${251.2 - lossDash}`}
                            strokeDashoffset={`${-winDash}`}
                          />
                          {/* Wins arc */}
                          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(52,211,153,0.8)" strokeWidth="12"
                            strokeDasharray={`${winDash} ${251.2 - winDash}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-xl font-black font-mono ${globalAnalytics.netResult >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {fmt(globalAnalytics.netResult)}
                          </span>
                          <span className="text-[8px] text-white/40 uppercase tracking-widest">neto</span>
                        </div>
                      </div>
                    );
                  })()}
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                      <span className="text-[10px] text-white/60">Ganancias ({((globalAnalytics.totalWins / (globalAnalytics.totalWins + globalAnalytics.totalLosses || 1)) * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400/50" />
                      <span className="text-[10px] text-white/60">Pérdidas ({((globalAnalytics.totalLosses / (globalAnalytics.totalWins + globalAnalytics.totalLosses || 1)) * 100).toFixed(0)}%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Bar Chart */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/50 mb-6 flex items-center gap-2">
                  <BarChart3 size={14} className="text-emerald-400"/> Rendimiento Mensual
                </h3>
                {monthlyData.length > 0 ? (
                  <div className="space-y-6">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold">Ganancias por Mes</span>
                      <MiniBarChart
                        data={monthlyData.map(m => ({ label: m.label, value: m.wins }))}
                        maxVal={Math.max(...monthlyData.map(m => Math.max(m.wins, m.losses)))}
                        color="bg-emerald-500/70"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-red-400 font-bold">Pérdidas por Mes</span>
                      <MiniBarChart
                        data={monthlyData.map(m => ({ label: m.label, value: m.losses }))}
                        maxVal={Math.max(...monthlyData.map(m => Math.max(m.wins, m.losses)))}
                        color="bg-red-500/50"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-white/20 text-xs uppercase tracking-widest font-mono">
                    Sin datos mensuales aún
                  </div>
                )}
              </div>
            </div>

            {/* Student Ranking Table */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <h3 className="text-xs font-black uppercase tracking-widest text-white/50 mb-6 flex items-center gap-2">
                <Users size={14} className="text-purple-400"/> Ranking de Alumnos por Rendimiento Neto
              </h3>
              {studentPerformance.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-white/30 uppercase tracking-widest text-[9px] border-b border-white/5">
                        <th className="text-left py-2 px-2">#</th>
                        <th className="text-left py-2 px-2">Alumno</th>
                        <th className="text-right py-2 px-2">Ganancias</th>
                        <th className="text-right py-2 px-2">Pérdidas</th>
                        <th className="text-right py-2 px-2">Neto</th>
                        <th className="text-right py-2 px-2">Trades</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentPerformance.map((s, i) => (
                        <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-2 text-white/30 font-mono">{i + 1}</td>
                          <td className="py-2.5 px-2 font-bold text-white truncate max-w-[150px]">{s.name}</td>
                          <td className="py-2.5 px-2 text-right font-mono text-emerald-400">{fmt(s.wins)}</td>
                          <td className="py-2.5 px-2 text-right font-mono text-red-400">{fmt(s.losses)}</td>
                          <td className={`py-2.5 px-2 text-right font-mono font-black ${s.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(s.net)}</td>
                          <td className="py-2.5 px-2 text-right font-mono text-white/40">{s.trades}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-white/20 text-xs uppercase tracking-widest font-mono">
                  Los alumnos aún no han registrado operaciones
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════ */}
        {/* TAB: STUDENTS */}
        {/* ═══════════════════════════════════════════════════ */}
        {activeTab === 'students' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* STUDENT LIST */}
            <div className="lg:col-span-4 flex flex-col gap-4">
               <div className="glass-panel p-5 rounded-2xl border border-white/5 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  <h2 className="text-xs font-black uppercase tracking-widest text-white/50 mb-4 flex items-center gap-2">
                     <User size={14} className="text-purple-400"/> ALUMNOS ({studentUsers.length})
                  </h2>
                  <div className="space-y-2">
                     {studentUsers.map(u => (
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
                           <div className="text-[9px] text-white/30 font-mono">
                             {entries.filter(e => e.user_id === u.id).length} ops
                           </div>
                         </div>
                       </div>
                     ))}
                     {studentUsers.length === 0 && (
                       <div className="text-center text-white/20 text-xs py-8 font-mono uppercase tracking-widest">Sin alumnos registrados</div>
                     )}
                  </div>
               </div>
            </div>

            {/* STUDENT DETAIL */}
            <div className="lg:col-span-8">
               {!selectedUser ? (
                 <div className="glass-panel h-full flex flex-col items-center justify-center p-10 text-center rounded-2xl border border-white/5 opacity-50 min-h-[300px]">
                    <Globe2 size={48} className="text-white/20 mb-4"/>
                    <div className="font-bold tracking-widest text-sm uppercase">Selecciona un alumno</div>
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
                               const wins = userE.filter(e => e.amount > 0).reduce((s, e) => s + Number(e.amount), 0);
                               const losses = userE.filter(e => e.amount < 0).reduce((s, e) => s + Math.abs(Number(e.amount)), 0);
                               const global = userE.reduce((s, e) => s + Number(e.amount), 0);

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
        )}

        {/* ═══════════════════════════════════════════════════ */}
        {/* TAB: ADMINS */}
        {/* ═══════════════════════════════════════════════════ */}
        {activeTab === 'admins' && (
          <div className="space-y-6">

            {/* Add Admin Card */}
            <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5">
              <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-4 flex items-center gap-2">
                <UserPlus size={14}/> Agregar Nuevo Administrador
              </h3>
              <p className="text-[10px] text-white/50 mb-4">
                Ingresa el correo de un usuario registrado en el ecosistema para darle privilegios de administrador.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={addAdminEmail}
                  onChange={(e) => setAddAdminEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 placeholder:text-white/20"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAdmin()}
                />
                <button
                  onClick={handleAddAdmin}
                  disabled={addAdminLoading}
                  className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest text-xs rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {addAdminLoading ? "..." : <><UserPlus size={14}/> Agregar</>}
                </button>
              </div>
              {addAdminMsg && (
                <div className="mt-3 p-3 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-cyan-400">
                  {addAdminMsg}
                </div>
              )}
            </div>

            {/* Admin List */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <h3 className="text-xs font-black uppercase tracking-widest text-white/50 mb-6 flex items-center gap-2">
                <Crown size={14} className="text-amber-400"/> Administradores Activos ({adminUsers.length})
              </h3>
              <div className="space-y-3">
                {adminUsers.map(u => {
                  const me = JSON.parse(localStorage.getItem("cobro-user") || "{}");
                  const isMe = u.id === me.id;
                  return (
                    <div key={u.id} className="flex items-center justify-between p-4 rounded-xl bg-black/30 border border-amber-500/10 hover:border-amber-500/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-600/30 flex items-center justify-center border border-amber-500/30">
                          <Crown size={18} className="text-amber-400"/>
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white flex items-center gap-2">
                            {u.full_name || "Sin nombre"}
                            {isMe && <span className="text-[8px] px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded uppercase font-mono">Tú</span>}
                          </div>
                          <div className="text-[10px] text-white/40 font-mono">{u.email}</div>
                        </div>
                      </div>
                      {!isMe && (
                        <button
                          onClick={() => handleRemoveAdmin(u.id)}
                          className="px-3 py-1.5 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition-colors"
                        >
                          Revocar
                        </button>
                      )}
                    </div>
                  );
                })}
                {adminUsers.length === 0 && (
                  <div className="text-center text-white/20 text-xs py-8 font-mono uppercase tracking-widest">No hay administradores</div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
