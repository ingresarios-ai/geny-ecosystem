import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Globe2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
const ADMIN_PASS="ingresarios2024";
const UCOL=["#00e5ff","#a78bfa","#00e676","#b388ff","#38bdf8","#f59e0b","#ef4444","#64ffda","#ea80fc","#2dd4bf"];
const fmt=(v:any)=>{const a=Math.abs(v);const s=v<0?"-":"";if(a>=1e6)return`${s}$${(a/1e6).toFixed(1)}M`;if(a>=1e3)return`${s}$${(a/1e3).toFixed(1)}K`;return`${s}$${a.toLocaleString()}`};
const fmtF=(v:any)=>{const n=Number(v);return n<0?`-$${Math.abs(n).toLocaleString("es-CO")}`:`$${n.toLocaleString("es-CO")}`};
const tzDateStr = (dateObj: Date) => { const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(dateObj); return `${parts.find(p => p.type === 'year')?.value}-${parts.find(p => p.type === 'month')?.value}-${parts.find(p => p.type === 'day')?.value}`; };
const td = () => tzDateStr(new Date());
const ws = (dStr: any) => { const dt = new Date(dStr + "T12:00:00-05:00"); const dy = dt.getDay(); dt.setDate(dt.getDate() - (dy === 0 ? 6 : dy - 1)); return tzDateStr(dt); };
const DAYS=["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
const MONTHS=["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

const Btn=({children,onClick,className,disabled,...p}: any)=>(
  <button onClick={onClick} disabled={disabled} 
    className={`px-4 py-2 font-semibold transition-all duration-300 rounded-xl flex items-center justify-center
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:brightness-110 active:scale-95'}
      ${className}`}
    {...p}>
    {children}
  </button>
);

const Logo=({size="lg"}: any)=>{
  const s=size==="lg"?{i:"w-16 h-16 text-3xl",t:"text-4xl",sub:"text-xs tracking-[0.2em]"}:size==="md"?{i:"w-12 h-12 text-2xl",t:"text-2xl",sub:"text-[10px] tracking-widest"}:{i:"w-8 h-8 text-xl",t:"text-lg",sub:"text-[9px] tracking-wider"};
  return(
    <div className="text-center flex flex-col items-center gap-2 select-none">
      <div className={`${s.i} rounded-[25%] flex items-center justify-center font-black bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_20px_rgba(34,211,238,0.4)] text-black mb-2`}>
        G
      </div>
      <div>
        <div className={`${s.t} font-black tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/20 text-glow-cyan`}>
          GENY B
        </div>
        <div className={`${s.sub} font-bold text-cyan-400 uppercase mt-1`}>
          by INGRESARIOS
        </div>
      </div>
    </div>
  );
};

const Input=({label,value,onChange,placeholder,type="text",mono,hint,className,...p}: any)=>(
  <div className="w-full">
    {label&&<label className="text-white/50 text-xs mb-1 block uppercase tracking-wider">{label}</label>}
    <input value={value} onChange={onChange} placeholder={placeholder} type={type}
      className={`w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all ${mono?'font-mono text-sm':'font-sans text-base'} ${className}`} {...p}/>
    {hint&&<div className="text-white/40 text-[11px] mt-1">{hint}</div>}
  </div>
);

const StatusBadge=({status,msg,onClose}: any)=>{
  if(!msg||status==="idle")return null;
  const cMap:any={syncing:"bg-cyan-500/10 text-cyan-400",ok:"bg-emerald-500/10 text-emerald-400",error:"bg-red-500/10 text-red-400",info:"bg-cyan-500/10 text-cyan-400"};
  const iMap:any={syncing:"⏳",ok:"✓",error:"✕",info:"ℹ"};
  return(
    <div className={`px-4 py-2 text-xs font-semibold text-center cursor-pointer flex items-center justify-center gap-2 rounded-lg backdrop-blur-md ${cMap[status]}`} onClick={onClose}>
      <span className="text-sm">{iMap[status]}</span> {msg} {status!=="syncing"&&<span className="opacity-50 font-normal hover:opacity-100 transition-opacity">(cerrar)</span>}
    </div>
  );
};

export default function App(){
  const navigate = useNavigate();
  const [screen,setScreen]=useState("splash");
  const [user,setUser]=useState<any>(null); // {name,email,ghlContactId}
  const [entries,setEntries]=useState<any[]>([]);
  const [allEntries,setAllEntries]=useState<any[]>([]);
  const [allUsers,setAllUsers]=useState<any[]>([]);
  const [loginEmail,setLoginEmail]=useState("");
  const [regName,setRegName]=useState("");const [regEmail,setRegEmail]=useState("");const [regProf,setRegProf]=useState("");
  const [amount,setAmount]=useState("");
  const [view,setView]=useState("dia");
  const [goal,setGoal]=useState(20000);
  const [showCheckin,setShowCheckin]=useState(false);
  const [checkinMode,setCheckinMode]=useState<"gain"|"loss">("gain");
  const [animPct,setAnimPct]=useState(0);
  const [syncSt,setSyncSt]=useState("idle");const [syncMsg,setSyncMsg]=useState("");
  const [splashOp,setSplashOp]=useState(0);
  const [adminPass,setAdminPass]=useState("");
  const [adminView,setAdminView]=useState("consolidated");
  const [selectedUser,setSelectedUser]=useState<any>(null);
  const [adminPeriod,setAdminPeriod]=useState("dia");
  const [loginLoading,setLoginLoading]=useState(false);
  const [loginError,setLoginError]=useState("");
  const [loginMode,setLoginMode]=useState("login"); // login | register

  // === LOAD ===
  useEffect(()=>{
    console.log("[App] useEffect Load starting...");
    (async()=>{
      let hasUser=false;
      try{
        console.log("[App] Checking for stored user...");
        const u = localStorage.getItem("cobro-user");
        if(u){
          const parsed = JSON.parse(u);
          // fetch from supabase to verify
          const {data: prof} = await supabase.from('profiles').select('*').eq('email', parsed.email).maybeSingle();
          if (prof) {
              const fullU = {id: prof.id, name: prof.full_name, email: prof.email, profession: prof.profession};
              setUser(fullU);
              localStorage.setItem("cobro-user", JSON.stringify(fullU));
              hasUser=true;
              
              const {data: myE} = await supabase.from('entries').select('*').eq('user_id', prof.id);
              if (myE) setEntries(myE);
          }
        }
      }catch(e){
        console.error("[App] Error loading user:", e);
      }
      try{const g=localStorage.getItem("cobro-goal");if(g)setGoal(Number(g))}catch{}
      await loadShared();
      setTimeout(()=>setSplashOp(1),100);
      setTimeout(()=>{setSplashOp(0);setTimeout(()=>setScreen(hasUser?"main":"login"),600)},2800);
    })();
  },[]);

  const loadShared=async()=>{
    try{
        const {data: profs} = await supabase.from('profiles').select('*');
        if(profs) setAllUsers(profs.map(p=>({id:p.id, name:p.full_name, email:p.email, profession:p.profession})));
        
        const {data: allE} = await supabase.from('entries').select('*, profiles(email, full_name)');
        if(allE) setAllEntries(allE.map(e=>({...e, userEmail: e.profiles?.email, userName: e.profiles?.full_name})));
    }catch{}
  };

  const handleLogin=async()=>{
    if(!loginEmail.trim())return;
    setLoginLoading(true);setLoginError("");
    try{
      const {data: contact} = await supabase.from('profiles').select('*').eq('email', loginEmail.trim()).maybeSingle();
      if(!contact){setLoginError("Email no registrado. ¿Eres nuevo? Regístrate primero.");setLoginLoading(false);return}
      const u={id: contact.id, name:`${contact.full_name||""}`.trim()||contact.email,email:contact.email,profession:contact.profession||""};
      setUser(u);localStorage.setItem("cobro-user",JSON.stringify(u));
      setLoginEmail("");setScreen("main");
      const {data: myE} = await supabase.from('entries').select('*').eq('user_id', u.id);
      if(myE) setEntries(myE);
      await loadShared();
    }catch(err: any){setLoginError(`Error intern: ${err.message}`)}
    setLoginLoading(false);
  };

  const handleRegister=async()=>{
    if(!regName.trim()||!regEmail.trim()||!regProf.trim())return;
    setLoginLoading(true);setLoginError("");
    try{
      const {data: existing} = await supabase.from('profiles').select('id').eq('email', regEmail.trim()).maybeSingle();
      if(existing){setLoginError("Este email ya está registrado. Inicia sesión.");setLoginLoading(false);return}
      
      const {data: newP, error} = await supabase.from('profiles').insert([{full_name: regName.trim(), email: regEmail.trim(), profession: regProf.trim()}]).select().single();
      if (error) throw error;
      
      const u={id: newP.id, name:newP.full_name,email:newP.email,profession:newP.profession};
      setUser(u);localStorage.setItem("cobro-user",JSON.stringify(u));
      setEntries([]);
      setRegName("");setRegEmail("");setRegProf("");setScreen("main");await loadShared();
    }catch(err: any){setLoginError(`Error: ${err.message}`)}
    setLoginLoading(false);
  };

  const myTotal=entries.filter(e=>e.date===td()).reduce((s,e)=>s+e.amount,0);
  const globalTotal=allEntries.filter(e=>e.date===td()).reduce((s,e)=>s+e.amount,0);
  const targetPct=Math.min(Math.max((myTotal/goal)*100,0),100);
  useEffect(()=>{const t=setTimeout(()=>setAnimPct(targetPct),100);return()=>clearTimeout(t)},[targetPct]);

  const handleCheckin=async()=>{
    const val=parseFloat(amount.replace(/[^0-9.]/g,""));if(!val||val<=0)return;
    const finalAmount=checkinMode==="loss"?-val:val;
    const now=new Date();
    const ts = now.getTime();
    const entry={user_id: user.id, amount:finalAmount,date:td(),time:now.toLocaleTimeString("es-CO",{timeZone:"America/Bogota",hour:"2-digit",minute:"2-digit"}),ts};
    const {data, error} = await supabase.from('entries').insert([entry]).select().single();
    if (!error && data) {
         setEntries([...entries,data]);
         setAllEntries([...allEntries, {...data, userEmail: user.email, userName: user.name}]);
         
         // Enviar al Webhook de FOMO solo en ganancias
         if (checkinMode==="gain") {
           try {
             await fetch("https://kbgvfrwgycayhuneuyfo.supabase.co/functions/v1/fomo-webhook", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                 name: user.name,
                 occupation: user.profession || "Miembro",
                 amount: `${val} usd`
               })
             });
           } catch(e) {
             console.error("Error enviando webhook FOMO", e);
           }
         }
    }
    setAmount("");setShowCheckin(false);setCheckinMode("gain");
  };



  const handleGoal=async (v: number)=>{setGoal(v);localStorage.setItem("cobro-goal",String(v));};
  const handleLogout=async()=>{setUser(null);setScreen("login");setLoginMode("login");localStorage.removeItem("cobro-user");};
  const handleAdminLogin=async()=>{if(adminPass===ADMIN_PASS){await loadShared();setScreen("admin")}else{alert("Clave incorrecta")}};
  const handleDelete=async (id: string)=>{
      const {error} = await supabase.from('entries').delete().eq('id', id);
      if(!error) {
          setEntries(entries.filter(e=>e.id!==id));
          setAllEntries(allEntries.filter(e=>e.id!==id));
      }
  };

  const buildDay=(src: any[])=>src.filter(e=>e.date===td()).map(e=>({name:e.time||"",valor:e.amount}));
  const buildWeek=(src: any[])=>{const w=ws(td());return DAYS.map((d,i)=>{const dt=new Date(w+"T12:00:00-05:00");dt.setDate(dt.getDate()+i);const k=tzDateStr(dt);return{name:d,valor:src.filter(e=>e.date===k).reduce((s,e)=>s+e.amount,0)}})};
  const buildMonth=(src: any[])=>{const mk=td().slice(0,7);const[y,m]=mk.split("-").map(Number);const dim=new Date(y,m,0).getDate();return Array.from({length:dim},(_,i)=>{const k=`${mk}-${String(i+1).padStart(2,"0")}`;return{name:String(i+1),valor:src.filter(e=>e.date===k).reduce((s,e)=>s+e.amount,0)}})};
  const getChart=(v: string,src: any[])=>v==="dia"?buildDay(src):v==="semana"?buildWeek(src):buildMonth(src);

  const getUserPie=()=>{
    const p=adminPeriod;
    const src=p==="dia"?allEntries.filter(e=>e.date===td()):p==="semana"?(()=>{const w=ws(td());const end=new Date(w+"T12:00:00-05:00");end.setDate(end.getDate()+6);return allEntries.filter(e=>e.date>=w&&e.date<=tzDateStr(end))})():allEntries.filter(e=>e.date?.startsWith(td().slice(0,7)));
    const map: any={};src.forEach(e=>{const k=e.userName||e.userEmail||"?";map[k]=(map[k]||0)+e.amount});
    return Object.entries(map).map(([name,value]: any,i)=>({name,value,fill:UCOL[i%UCOL.length]}));
  };

  const ChartBlock=({data,period,height=200}: any)=>(
    data.every((d:any)=>d.valor===0)?<div className="text-center py-10 flex flex-col items-center gap-3 opacity-40"><Globe2 size={32}/><div className="text-white font-mono tracking-widest uppercase text-xs">Sin datos operativos</div></div>:
    period==="mes"?(
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorCyan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
          <XAxis dataKey="name" tick={{fill:"rgba(255,255,255,0.4)",fontSize:10}} interval={4} axisLine={false} tickLine={false}/>
          <YAxis tick={{fill:"rgba(255,255,255,0.4)",fontSize:10, fontFamily:"monospace"}} tickFormatter={fmt} width={48} axisLine={false} tickLine={false}/>
          <Tooltip formatter={v=><span className="font-mono text-cyan-400 font-bold">{fmtF(v)}</span>} contentStyle={{background:"rgba(0,0,0,0.8)",backdropFilter:"blur(12px)",border:"1px solid rgba(34,211,238,0.2)",borderRadius:12,boxShadow:"0 10px 40px -10px rgba(34,211,238,0.5)",color:"#fff"}} cursor={{stroke: 'rgba(34,211,238,0.3)', strokeWidth: 2}}/>
          <Area type="monotone" dataKey="valor" stroke="#22d3ee" strokeWidth={3} fillOpacity={1} fill="url(#colorCyan)" activeDot={{r:6,fill:"#22d3ee",stroke:"#fff",strokeWidth:2}}/>
        </AreaChart>
      </ResponsiveContainer>
    ):(
      <ResponsiveContainer width="100%" height={height}><BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/><XAxis dataKey="name" tick={{fill:"rgba(255,255,255,0.4)",fontSize:10}} axisLine={false} tickLine={false}/><YAxis tick={{fill:"rgba(255,255,255,0.4)",fontSize:10, fontFamily:"monospace"}} tickFormatter={fmt} width={48} axisLine={false} tickLine={false}/><Tooltip formatter={v=><span className="font-mono font-bold">{fmtF(v)}</span>} contentStyle={{background:"rgba(0,0,0,0.8)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,color:"#fff"}} cursor={{fill: 'rgba(255,255,255,0.05)'}}/><Bar dataKey="valor" radius={[4,4,0,0]}>{data.map((e:any,i:number)=><Cell key={i} fill={e.valor>0?"#22d3ee":e.valor<0?"#ef4444":"rgba(255,255,255,0.1)"}/>)}</Bar></BarChart></ResponsiveContainer>
    )
  );

  const Tabs=({items,active,onSelect,color="#22d3ee"}: any)=>(
    <div className="flex gap-2 bg-black/40 rounded-2xl p-1.5 border border-white/5 shadow-inner">
      {items.map(([k,l]: any)=><Btn key={k} onClick={()=>onSelect(k)} style={{color:active===k?color:'rgba(255,255,255,0.5)'}} className={`flex-1 py-3 text-sm lg:text-base font-bold tracking-wide rounded-xl transition-all duration-300 ${active===k?'bg-cyan-500/15 shadow-[0_4px_15px_rgba(34,211,238,0.2)] border border-cyan-500/30 scale-[1.02]':'bg-transparent hover:bg-white/5 hover:text-white/70 border border-transparent scale-100'}`}>{l}</Btn>)}
    </div>
  );

  if(screen==="splash")return(
    <div className="relative z-10 pt-32 pb-24 flex flex-col items-center justify-center w-full min-h-[60vh] transition-opacity duration-800" style={{opacity:splashOp}}>
      <Logo size="lg"/>
      <div className="mt-10 flex gap-2">
        {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-cyan-400" style={{ animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
      </div>
      <div className="mt-4 text-xs text-white/50 tracking-widest uppercase">INICIANDO SISTEMA</div>
    </div>
  );

  if(screen==="login")return(
    <div className="relative z-10 pt-32 pb-24 flex flex-col items-center justify-center w-full px-4">
      <div className="w-full max-w-[420px]">
        <div className="mb-8"><Logo size="lg"/></div>
        <div className="glass-panel rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)] border-white/5 bg-black/40">
          {/* Toggle login/register */}
          <div className="flex gap-2 mb-6 bg-black/20 rounded-xl p-1 border border-white/5">
            <Btn onClick={()=>{setLoginMode("login");setLoginError("")}} className={`flex-1 ${loginMode==="login"?"bg-cyan-500/20 text-cyan-400 shadow-[inset_0_1px_rgba(255,255,255,0.1)]":"bg-transparent text-white/50"}`}>
              Iniciar Sesión
            </Btn>
            <Btn onClick={()=>{setLoginMode("register");setLoginError("")}} className={`flex-1 ${loginMode==="register"?"bg-emerald-500/20 text-emerald-400 shadow-[inset_0_1px_rgba(255,255,255,0.1)]":"bg-transparent text-white/50"}`}>
              Registrarse
            </Btn>
          </div>

          {loginMode==="login"?(
            <div className="flex flex-col gap-4">
              <div className="text-center mb-2">
                <div className="text-3xl mb-2">👋</div>
                <p className="text-white/50 text-sm m-0">Ingresa tu email registrado</p>
              </div>
              <Input label="Email" value={loginEmail} onChange={(e:any)=>setLoginEmail(e.target.value)} placeholder="tu@email.com" type="email" onKeyDown={(e:any)=>e.key==="Enter"&&handleLogin()}/>
              {loginError&&<div className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs font-semibold">{loginError}</div>}
              <Btn onClick={handleLogin} disabled={loginLoading} className="w-full py-4 mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-base shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                {loginLoading?"Verificando...":"Entrar 🚀"}
              </Btn>
            </div>
          ):(
            <div className="flex flex-col gap-4">
              <div className="text-center mb-5">
                <div className="text-3xl mb-3">✨</div>
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 mx-auto max-w-[320px] shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                  <p className="text-cyan-400 text-xs font-bold leading-relaxed m-0">
                    💡 IMPORTANTE: Usa el mismo correo con el que te inscribiste al entrenamiento para vincular tu progreso.
                  </p>
                </div>
              </div>
              <Input label="Nombre completo" value={regName} onChange={(e:any)=>setRegName(e.target.value)} placeholder="Tu nombre completo"/>
              <Input label="Email" value={regEmail} onChange={(e:any)=>setRegEmail(e.target.value)} placeholder="tu@email.com" type="email"/>
              <Input label="Profesión" value={regProf} onChange={(e:any)=>setRegProf(e.target.value)} placeholder="Ej: Trader, Empresario..." onKeyDown={(e:any)=>e.key==="Enter"&&handleRegister()}/>
              {loginError&&<div className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs font-semibold">{loginError}</div>}
              <Btn onClick={handleRegister} disabled={loginLoading} className="w-full py-4 mt-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold text-base shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                {loginLoading?"Creando cuenta...":"Registrarme ✨"}
              </Btn>
            </div>
          )}
        </div>
        <div className="flex gap-3 justify-center mt-6">
          <Btn onClick={()=>setScreen("adminlogin")} className="bg-black/20 text-white/40 text-xs px-4 py-2 border border-white/10 hover:text-white/60">🔐 Admin</Btn>
        </div>
      </div>
    </div>
  );

  if(screen==="adminlogin")return(
    <div className="relative z-10 pt-32 pb-24 flex flex-col items-center justify-center w-full px-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-8"><Logo size="md"/></div>
        <div className="glass-panel rounded-3xl p-8 border-white/5 bg-black/40">
          <div className="text-center mb-6">
            <div className="text-3xl mb-2">🛡️</div>
            <h2 className="text-xl font-bold m-0 text-white">Panel Admin</h2>
            <p className="text-white/50 text-sm mt-1">Clave de administrador</p>
          </div>
          <div className="flex flex-col gap-4">
            <Input value={adminPass} onChange={(e:any)=>setAdminPass(e.target.value)} placeholder="Clave secreta" type="password" onKeyDown={(e:any)=>e.key==="Enter"&&handleAdminLogin()}/>
            <Btn onClick={handleAdminLogin} className="w-full py-4 mt-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold text-base shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              Acceder 🛡️
            </Btn>
            <Btn onClick={()=>setScreen("login")} className="py-2 mt-2 bg-transparent border border-white/10 text-white/50 hover:bg-white/5 text-sm">
              ← Volver
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );



  // ===== ADMIN PANEL =====
  if(screen==="admin"){
    const pie=getUserPie();const totalAll=pie.reduce((s:number,p:any)=>s+p.value,0);
    const selSrc=selectedUser?allEntries.filter(e=>e.userEmail===selectedUser):allEntries;
    const selChart=getChart(adminPeriod,selSrc);const selTotal=selChart.reduce((s,d)=>s+d.valor,0);
    const selName=selectedUser?allUsers.find(u=>u.email===selectedUser)?.name||selectedUser:"Todos";
    const activeToday=[...new Set(allEntries.filter(e=>e.date===td()).map(e=>e.userEmail))].length;
    return(
      <div className="relative z-10 pt-32 pb-24 max-w-[800px] w-full mx-auto px-4">
        <div className="glass-panel rounded-2xl p-4 flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(139,92,246,0.3)]">🛡️</div>
            <div>
              <div className="font-bold text-sm tracking-wide">Panel Admin</div>
              <div className="text-white/50 text-[11px] uppercase tracking-wider">{new Date().toLocaleDateString("es-CO",{weekday:"long",day:"numeric",month:"long"})}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Btn onClick={()=>setScreen("ghlsetup")} className="bg-transparent border border-white/10 text-white/50 hover:bg-white/5 px-2 py-1">⚙️</Btn>
            <Btn onClick={()=>{setScreen("login");setAdminPass("")}} className="bg-transparent border border-white/10 text-white/50 hover:bg-white/5 text-xs px-3">Salir</Btn>
          </div>
        </div>

        <div className="max-w-[700px] mx-auto">
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[["Total Hoy",fmtF(allEntries.filter(e=>e.date===td()).reduce((s,e)=>s+e.amount,0)),"text-cyan-400"],["Usuarios",allUsers.length,"text-emerald-400"],["Activos Hoy",activeToday,"text-purple-400"]].map(([l,v,c]: any,i: number)=>(
              <div key={i} className="glass-panel rounded-2xl p-4 text-center border-white/5">
                <div className="text-white/50 text-[11px] uppercase tracking-wider mb-1">{l}</div>
                <div className={`text-xl font-black ${c}`}>{v}</div>
              </div>
            ))}
          </div>
          <div className="mb-4"><Tabs items={[["consolidated","📊 Consolidado"],["byuser","👥 Por Usuario"]]} active={adminView} onSelect={(v:any)=>{setAdminView(v);setSelectedUser(null)}} color="#a855f7"/></div>
          <div className="mb-6"><Tabs items={[["dia","Día"],["semana","Semana"],["mes","Mes"]]} active={adminPeriod} onSelect={setAdminPeriod}/></div>

          {adminView==="consolidated"?(
            <>
              <div className="glass-panel rounded-2xl p-6 mb-6">
                <div className="text-sm font-bold mb-4 text-cyan-400 tracking-wider">DISTRIBUCIÓN POR USUARIO</div>
                {pie.length===0?<div className="text-center py-8 text-white/50">Sin datos</div>:(
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={pie} dataKey="value" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={2} label={({name,percent}:any)=>`${name} ${(percent*100).toFixed(0)}%`} style={{fontSize:11, fill: 'rgba(255,255,255,0.7)'}}>
                          {pie.map((p:any,i:number)=><Cell key={i} fill={p.fill}/>)}
                        </Pie>
                        <Tooltip formatter={v=>fmtF(v)} contentStyle={{background:"rgba(0,0,0,0.8)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#fff"}}/>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="text-xl font-black text-cyan-400 text-center mt-2">Total: {fmtF(totalAll)}</div>
                  </>
                )}
              </div>
              <div className="glass-panel rounded-2xl p-6">
                <div className="text-sm font-bold mb-4 text-white/50 tracking-wider">TENDENCIA CONSOLIDADA</div>
                <ChartBlock data={selChart} period={adminPeriod} height={250}/>
              </div>
            </>
          ):(
            <>
              <div className="glass-panel rounded-2xl p-6 mb-6">
                <div className="text-sm font-bold mb-4 text-emerald-400 tracking-wider">👥 USUARIOS ({allUsers.length})</div>
                <div className="flex flex-col gap-2">
                  <div onClick={()=>setSelectedUser(null)} className={`flex justify-between items-center p-3 rounded-xl cursor-pointer border transition-colors ${!selectedUser?'bg-emerald-500/10 border-emerald-500/20':'bg-black/20 border-white/5 hover:bg-white/5'}`}>
                    <span className="font-semibold text-sm text-white">📊 Todos</span>
                    <span className="text-cyan-400 font-bold">{fmtF(allEntries.filter(e=>e.date===td()).reduce((s,e)=>s+e.amount,0))}</span>
                  </div>
                  {allUsers.map((u,i)=>{
                    const ut=allEntries.filter(e=>e.userEmail===u.email&&e.date===td()).reduce((s,e)=>s+e.amount,0);
                    const sel=selectedUser===u.email;
                    return(
                      <div key={u.email} onClick={()=>setSelectedUser(sel?null:u.email)} className={`flex justify-between items-center p-3 rounded-xl cursor-pointer border transition-colors ${sel?'bg-cyan-500/10 border-cyan-500/20':'bg-black/20 border-white/5 hover:bg-white/5'}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{background:UCOL[i%UCOL.length]}}/>
                          <div>
                            <div className="font-semibold text-sm text-white">{u.name}</div>
                            <div className="text-white/40 text-[11px]">{u.profession?`${u.profession} · `:""}{u.email}</div>
                          </div>
                        </div>
                        <span className="font-bold" style={{color:UCOL[i%UCOL.length]}}>{fmtF(ut)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="glass-panel rounded-2xl p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="text-sm font-bold text-white/50 tracking-wider">{selName}</div>
                  <div className="text-lg font-black text-emerald-400">{fmtF(selTotal)}</div>
                </div>
                <ChartBlock data={selChart} period={adminPeriod} height={250}/>
              </div>
              {selectedUser&&(()=>{const ue=allEntries.filter(e=>e.userEmail===selectedUser&&e.date===td());if(!ue.length)return null;return(
                <div className="glass-panel rounded-2xl p-5 border-white/5">
                  <div className="text-xs font-semibold mb-3 text-white/50 uppercase tracking-widest">Cobros hoy ({ue.length})</div>
                  {ue.map(e=><div key={e.id} className="flex justify-between p-2.5 bg-black/30 rounded-lg mb-2 items-center"><span className={`font-semibold text-sm ${e.amount>=0?'text-emerald-400':'text-red-400'}`}>{e.amount>=0?"+":""}{fmtF(e.amount)}</span><span className="text-white/40 text-[11px]">{e.time}</span></div>)}
                </div>)})()}
            </>
          )}
          <div className="text-center mt-10 opacity-30"><Logo size="sm"/></div>
        </div>
      </div>
    );
  }

  // ===== MAIN =====
  const todayEntries=entries.filter(e=>e.date===td());
  const chartData=getChart(view,entries);const viewTotal=chartData.reduce((s,d)=>s+d.valor,0);

  return(
      <main className="relative z-10 pt-32 pb-24 max-w-7xl mx-auto w-full px-4 lg:px-8">

      <StatusBadge status={syncSt} msg={syncMsg} onClose={()=>{setSyncMsg("");setSyncSt("idle")}}/>

      {/* Header Título GENY-B */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center mt-0 mb-6 select-none">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-md mb-3">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-400">Tracker Inteligente</span>
        </div>
        <h1 className="text-5xl md:text-7xl leading-none font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/20 text-glow-cyan">
          GENY<span className="text-cyan-400">-</span>B
        </h1>
      </motion.div>

      <div className="pt-2 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        {/* ========== COLUMNA IZQUIERDA: ACCIONES Y META ========== */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Global banner */}
          <div className="glass-panel rounded-2xl p-4 border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-600/5 flex justify-between items-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400"></div>
            <div className="absolute inset-0 bg-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <div>
              <div className="text-[11px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-2">
                <Globe2 size={14} /> Total Global Hoy
              </div>
              <div className="text-white/50 text-[11px] mt-1">{[...new Set(allEntries.filter(e=>e.date===td()).map(e=>e.userEmail))].length} traders activos</div>
            </div>
            <div className="text-2xl font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)] font-mono tracking-tighter">{fmtF(globalTotal)}</div>
          </div>

          {/* Thermometer */}
          <div className="glass-panel rounded-[2rem] p-8 text-center border-t border-white/10 shadow-2xl relative overflow-hidden group bg-black/40">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-cyan-500/5 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
            <div className="text-sm font-bold text-white/50 uppercase tracking-widest mb-1 relative z-10">Mi cobro hoy</div>
            <div className={`text-5xl lg:text-6xl font-black mb-2 transition-all duration-500 font-mono tracking-tighter relative z-10 ${myTotal<0?'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]':animPct<33?'text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.4)]':animPct<66?'text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]':'text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]'}`}>
              {fmtF(myTotal)}
            </div>
            <div className="text-xs font-semibold text-white/40 mb-6 uppercase tracking-wider font-mono relative z-10">Meta: {fmtF(goal)}</div>
            
            <div className="relative h-6 rounded-full bg-black/50 overflow-hidden border border-white/5 shadow-inner z-10">
              <div 
                className={`h-full transition-all duration-1000 ease-out flex items-center justify-end px-2
                  ${animPct<40?'bg-gradient-to-r from-red-600 to-red-400':animPct<75?'bg-gradient-to-r from-amber-600 to-amber-400':'bg-gradient-to-r from-emerald-600 to-emerald-400'}`}
                style={{ width: `${Math.max(5, animPct)}%` }}
              >
                <span className="text-[10px] font-black text-white/90 drop-shadow-md font-mono">{Math.round(animPct)}%</span>
              </div>
            </div>
            
            <div className="flex gap-2 justify-center mt-5 flex-wrap relative z-10">
              {[20000,50000,100000,500000].map(g=><Btn key={g} onClick={()=>handleGoal(g)} className={`px-3 py-1 text-xs border font-mono ${goal===g?'bg-cyan-500/20 border-cyan-500/50 text-cyan-400':'bg-transparent border-white/10 text-white/40'}`}>{fmt(g)}</Btn>)}
            </div>
          </div>

          {!showCheckin?(
            <div className="flex gap-3">
              <Btn onClick={()=>{setCheckinMode("gain");setShowCheckin(true)}} className="flex-1 py-4 lg:py-5 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white text-lg font-black shadow-[0_0_20px_rgba(16,185,129,0.2)] border border-emerald-400/20 hover:scale-105">
                💵 ¡YA COBRÉ!
              </Btn>
              <Btn onClick={()=>{setCheckinMode("loss");setShowCheckin(true)}} className="flex-1 py-4 lg:py-5 bg-gradient-to-br from-red-500 to-red-700 text-white text-lg font-black shadow-[0_0_20px_rgba(239,68,68,0.2)] border border-red-400/20 hover:scale-105">
                📉 PÉRDIDA
              </Btn>
            </div>
          ):(
            <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className={`glass-panel rounded-2xl p-5 border ${checkinMode==="loss"?'border-red-500/30 bg-red-500/5':'border-emerald-500/30 bg-emerald-500/5'}`}>
              <div className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${checkinMode==="loss"?'text-red-400':'text-emerald-400'}`}>
                {checkinMode==="loss"?"📉 Registrar pérdida":"💵 Registrar cobro"}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  {checkinMode==="loss"&&<span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500 text-xl font-bold">−</span>}
                  <input value={amount} onChange={(e:any)=>setAmount(e.target.value)} placeholder="0.00" type="number" min="0" autoFocus 
                    className={`w-full py-3 rounded-xl border bg-black/40 text-xl font-bold font-mono tracking-tighter outline-none transition-all
                    ${checkinMode==="loss"?'pl-8 px-4 border-red-500/30 text-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-400/50':'px-4 border-emerald-500/30 text-emerald-400 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50'}`}
                    onKeyDown={(e:any)=>e.key==="Enter"&&handleCheckin()}
                  />
                </div>
                <Btn onClick={handleCheckin} className={`px-6 text-white text-xl font-black ${checkinMode==="loss"?'bg-red-600 hover:bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]':'bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`}>✓</Btn>
                <Btn onClick={()=>{setShowCheckin(false);setAmount("");setCheckinMode("gain")}} className="px-5 bg-transparent border border-white/10 text-white/50 hover:bg-white/5 text-lg">✕</Btn>
              </div>
            </motion.div>
          )}
        </div>

        {/* ========== COLUMNA DERECHA: DASHBOARD Y ANALÍTICA ========== */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Pestañas superioeres de analítica */}
          <Tabs items={[["dia","📅 Día"],["semana","📊 Semana"],["mes","📈 Mes"]]} active={view} onSelect={setView} />

          {/* Grids de KPI */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel rounded-2xl p-5 text-center border-white/5 bg-black/40 group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-1 relative z-10">Total {view==="dia"?"hoy":view==="semana"?"semana":"mes"}</div>
              <div className="text-2xl lg:text-3xl font-black text-cyan-400 font-mono tracking-tighter relative z-10">{fmtF(viewTotal)}</div>
            </div>
            <div className="glass-panel rounded-2xl p-5 text-center border-white/5 bg-black/40 group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-bl from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-1 relative z-10">Promedio</div>
              <div className="text-2xl lg:text-3xl font-black text-amber-400 font-mono tracking-tighter relative z-10">{fmtF(view==="dia"?(todayEntries.length?myTotal/todayEntries.length:0):(chartData.filter((d:any)=>d.valor>0).length?viewTotal/chartData.filter((d:any)=>d.valor>0).length:0))}</div>
            </div>
          </div>

          {/* Gráfica principal */}
          <div className="glass-panel rounded-2xl p-6 border-white/5 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-cyan-500/5 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
            <div className="text-[11px] font-bold uppercase tracking-widest text-white/50 mb-6 flex justify-between items-center relative z-10">
              <span>{view==="dia"?"Cobros del día":view==="semana"?"Resumen semanal":MONTHS[new Date().getMonth()]}</span>
            </div>
            <div className="relative z-10">
              <ChartBlock data={chartData} period={view}/>
            </div>
          </div>
          
          {/* Lista de Movimientos de Hoy */}
          {todayEntries.length>0&&<div className="glass-panel rounded-2xl p-5 border-white/5 bg-black/20">
            <div className="text-[11px] font-bold uppercase tracking-widest text-white/50 mb-4">Movimientos de hoy ({todayEntries.length})</div>
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence>
                {todayEntries.map((e:any)=><motion.div key={e.id} initial={{opacity:0, y:-20, scale:0.95}} animate={{opacity:1, y:0, scale:1}} exit={{opacity:0, scale:0.9, x:-20}} className="flex justify-between items-center p-3 bg-black/40 hover:bg-white/5 transition-colors rounded-xl border border-white/5 group">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${e.amount>=0?'bg-emerald-400':'bg-red-400'} shadow-[0_0_10px_currentColor]`} />
                    <div>
                      <div className={`font-bold font-mono tracking-tighter text-lg leading-none ${e.amount>=0?'text-emerald-400':'text-red-400'}`}>
                        {e.amount>=0?"+":""}{fmtF(e.amount)}
                      </div>
                      <div className="text-white/30 text-[10px] uppercase tracking-wider">{e.time}</div>
                    </div>
                  </div>
                  <Btn onClick={()=>handleDelete(e.id)} className="bg-transparent text-white/30 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-lg">×</Btn>
                </motion.div>)}
              </AnimatePresence>
            </div>
          </div>}

        </div>
      </div>
      
    </main>
  );
}
