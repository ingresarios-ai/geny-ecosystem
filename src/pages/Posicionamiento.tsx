import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { Lightbulb, Target, TrendingUp } from "lucide-react";

// Types
type ScenarioType = "agresivo" | "equilibrado" | "conservador" | "custom";

interface SimResult {
  currentBalance: number;
  totalTrades: number;
  success: boolean;
  failure: boolean;
  history: any[];
  chartData: any[];
}

const SCENARIOS = {
  agresivo: { dd: 2500, target: 3000, avg: 60, rbr: 1.5, tpm: 22 },
  equilibrado: { dd: 2500, target: 3000, avg: 50, rbr: 1.5, tpm: 30 },
  conservador: { dd: 2500, target: 3000, avg: 40, rbr: 2.5, tpm: 40 }
};

const fmt = (v: number) => `$${v.toLocaleString('en-US', {minimumFractionDigits:0, maximumFractionDigits:2})}`;

const Btn = ({children, onClick, className, active}: any) => (
  <button 
    onClick={onClick} 
    className={`px-6 py-4 font-black transition-all duration-300 rounded-xl flex items-center justify-center text-xs md:text-sm uppercase tracking-widest border
      ${active 
        ? 'bg-orange-500/25 border-orange-500 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.3)] scale-[1.03]' 
        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/30 hover:scale-[1.02]'}
      ${className}`}
  >
    {children}
  </button>
);

const Input = ({ label, value, onChange, icon, colorClass = "text-cyan-400" }: any) => (
  <div className="w-full">
    <label className={`block text-xs font-black uppercase mb-2 tracking-widest ${colorClass}`}>
      {label}
    </label>
    <div className="relative group">
      <input 
        type="number" 
        value={value} 
        onChange={e => onChange(e.target.value)}
        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-base md:text-lg font-bold text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner font-mono tracking-tighter"
      />
    </div>
  </div>
);

export default function Posicionamiento() {
  const [scenario, setScenario] = useState<ScenarioType>("agresivo");
  const [screen, setScreen] = useState("splash");
  const [splashOp, setSplashOp] = useState(1);
  
  // Inputs
  const [accountSize, setAccountSize] = useState("50000");
  const [dd, setDd] = useState("2500");
  const [target, setTarget] = useState("3000");
  const [avg, setAvg] = useState("60");
  const [rbr, setRbr] = useState("1.5");
  const [tpm, setTpm] = useState("22");

  // Output State
  const [riskPerTrade, setRiskPerTrade] = useState(0);
  const [expectedMonths, setExpectedMonths] = useState<string>("");
  const [minRbr, setMinRbr] = useState(0);
  const [simRes, setSimRes] = useState<SimResult | null>(null);

  // Helper to trigger simulation
  const runSim = (overrideParams?: any) => {
    const pAcc = parseFloat(accountSize) || 0;
    const pDd = parseFloat(overrideParams?.dd || dd) || 0;
    const pTgt = parseFloat(overrideParams?.target || target) || 0;
    const pAvg = (parseFloat(overrideParams?.avg || avg) || 0) / 100;
    const pRbr = parseFloat(overrideParams?.rbr || rbr) || 0;
    const pTpm = parseFloat(overrideParams?.tpm || tpm) || 1;

    const risk = pDd / pTpm;
    setRiskPerTrade(risk);

    const expectedTradeProfit = (pAvg * risk * pRbr) - ((1 - pAvg) * risk);
    const tradesNeeded = expectedTradeProfit > 0 ? Math.ceil(pTgt / expectedTradeProfit) : 0;
    setExpectedMonths(tradesNeeded > 0 ? (tradesNeeded / pTpm).toFixed(1) : "NEGATIVA");
    
    // Asesor Strategy
    const rNeeded = ((pTgt / pTpm) + (risk * (1 - pAvg))) / (pAvg * risk);
    setMinRbr(rNeeded > 0 && rNeeded !== Infinity ? rNeeded : 0);

    // Bucle Simulación
    let currentBalance = pAcc;
    let currentProfit = 0;
    let chartData = [{ name: "Inicio", valor: currentBalance }];
    let history = [];
    
    let i = 1;
    let success = false;
    let failure = false;
    const maxSimTrades = 200;

    while (i <= maxSimTrades) {
      const isWin = Math.random() < pAvg;
      const res = isWin ? risk * pRbr : -risk;
      currentBalance += res;
      currentProfit += res;
      
      chartData.push({ name: `T${i}`, valor: currentBalance });
      history.push({
        num: i,
        risk: risk,
        isWin,
        result: res,
        balance: currentBalance
      });

      if (currentProfit >= pTgt) { success = true; break; }
      if (currentProfit <= -pDd) { failure = true; break; }
      i++;
    }

    setSimRes({
      currentBalance,
      totalTrades: history.length,
      success,
      failure,
      history,
      chartData
    });
  };

  const handleScenario = (s: ScenarioType) => {
    if (s === "custom") return;
    setScenario(s);
    const rules = SCENARIOS[s];
    setDd(rules.dd.toString());
    setTarget(rules.target.toString());
    setAvg(rules.avg.toString());
    setRbr(rules.rbr.toString());
    setTpm(rules.tpm.toString());
    runSim(rules);
  };

  useEffect(() => {
    // Initial run
    handleScenario("agresivo");
    const t1 = setTimeout(() => setSplashOp(0), 1000);
    const t2 = setTimeout(() => setScreen("main"), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if(screen==="splash")return(
    <div className="relative z-10 pt-32 pb-24 flex flex-col items-center justify-center w-full min-h-[60vh] transition-opacity duration-800" style={{opacity:splashOp}}>
      <div className="text-center flex flex-col items-center gap-2 select-none mb-10">
        <div className="w-16 h-16 text-4xl rounded-[25%] flex items-center justify-center font-black bg-gradient-to-br from-orange-400 to-red-600 shadow-[0_0_20px_rgba(249,115,22,0.4)] text-black mb-2">
          P
        </div>
        <div>
          <div className="text-4xl font-black tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/20">
            DINÁMICO
          </div>
          <div className="text-xs tracking-[0.2em] font-bold text-orange-400 uppercase mt-1">
            by INGRESARIOS
          </div>
        </div>
      </div>
      <div className="mt-10 flex gap-2">
        {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-orange-500" style={{ animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
      </div>
      <div className="mt-4 text-[10px] font-mono text-white/50 tracking-widest uppercase">CARGANDO ALGORITMO MACRO...</div>
    </div>
  );

  return (
    <main className="relative z-10 pt-32 pb-24 max-w-7xl mx-auto w-full px-4 lg:px-8">
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center mt-0 mb-10 select-none">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 backdrop-blur-md mb-3">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-[10px] font-mono tracking-widest uppercase text-orange-400">Simulador Estocástico</span>
        </div>
        <h1 className="text-4xl md:text-6xl leading-none font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/20 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
          POSICIONAMIENTO <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 block md:inline mt-2 md:mt-0">DINÁMICO</span>
        </h1>
      </motion.div>

      {/* QUICK PRESETS */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        <Btn active={scenario === "agresivo"} onClick={() => handleScenario("agresivo")}>AVG 60% (Agresivo)</Btn>
        <Btn active={scenario === "equilibrado"} onClick={() => handleScenario("equilibrado")}>AVG 50% (Equilibrado)</Btn>
        <Btn active={scenario === "conservador"} onClick={() => handleScenario("conservador")}>AVG 40% (Conservador)</Btn>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        
        {/* COLUMNA IZQ: PARÁMETROS */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          
          <div className="glass-panel p-6 md:p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400" />
            <h2 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Target size={14} className="text-cyan-400" /> PLAN DE TRADING
            </h2>

            <div className="space-y-5">
               <Input label="Tamaño Cuenta ($)" value={accountSize} onChange={(v:any) => { setAccountSize(v); setScenario("custom"); }} colorClass="text-slate-400"/>
               
               <div className="grid grid-cols-2 gap-4">
                 <Input label="Drawdown ($)" value={dd} onChange={(v:any) => { setDd(v); setScenario("custom"); }} colorClass="text-orange-400"/>
                 <Input label="Meta ($)" value={target} onChange={(v:any) => { setTarget(v); setScenario("custom"); }} colorClass="text-emerald-400"/>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <Input label="AVG Bateo (%)" value={avg} onChange={(v:any) => { setAvg(v); setScenario("custom"); }} colorClass="text-emerald-400"/>
                 <Input label="Ratio (RBR)" value={rbr} onChange={(v:any) => { setRbr(v); setScenario("custom"); }} colorClass="text-cyan-400"/>
               </div>

               <Input label="Trades / Mes" value={tpm} onChange={(v:any) => { setTpm(v); setScenario("custom"); }} colorClass="text-orange-400"/>

               <button onClick={() => runSim()} className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] transition-all uppercase tracking-[0.2em] text-[11px] hover:-translate-y-1">
                 Lanzar Simulación
               </button>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden border border-orange-500/20">
             <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none" />
             <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Riesgo Sugerido / Trade</p>
             <h3 className="text-5xl md:text-6xl font-black italic tracking-tighter text-white font-mono">{fmt(riskPerTrade)}</h3>
             <div className={`text-xs md:text-sm font-black uppercase mt-3 tracking-widest ${expectedMonths==="NEGATIVA" ? 'text-red-400' : 'text-emerald-400'}`}>
                {expectedMonths === "NEGATIVA" ? "EXPECTATIVA MATEMÁTICA NEGATIVA" : `META ESTIMADA EN ${expectedMonths} MESES`}
             </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-indigo-900/10">
            <h2 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
               <Lightbulb size={16} /> ASESORÍA MATEMÁTICA
            </h2>
            <div className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-1">
               Para alcanzar la meta en 1 mes ({tpm} trades):
            </div>
            <div className="text-base md:text-lg text-white font-black italic mb-2">
               Necesitas un RBR mínimo de <span className="text-cyan-400 text-2xl">{minRbr.toFixed(2)}</span>
            </div>
            <div className="text-[11px] text-slate-500 uppercase font-bold tracking-widest mt-3">
               Basado en tu AVG de {avg}% y riesgo de {fmt(riskPerTrade)}
            </div>
          </div>

        </aside>

        {/* COLUMNA DER: RESULTADOS */}
        <main className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="glass-panel p-6 lg:p-8 rounded-3xl min-h-[400px] flex flex-col">
            <div className="flex justify-between items-start mb-6">
               <div className="flex items-center gap-2 text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">
                 <TrendingUp size={14} className="text-emerald-400"/> CRECIMIENTO PATRIMONIAL
               </div>
               {simRes && (
                 <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                   simRes.success ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                   simRes.failure ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                   'bg-white/5 text-slate-400 border-white/10'
                 }`}>
                   {simRes.success ? "Meta Alcanzada ✅" : simRes.failure ? "Drawdown Tocado 🚫" : "Límite de Operaciones"}
                 </div>
               )}
            </div>

            <div className="flex-grow w-full h-[300px]">
              {simRes ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={simRes.chartData}>
                    <defs>
                      <linearGradient id="colorGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={simRes.failure ? "#ef4444" : "#10b981"} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={simRes.failure ? "#ef4444" : "#10b981"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                    <XAxis dataKey="name" tick={{fill:"rgba(255,255,255,0.4)",fontSize:10}} interval="preserveStartEnd" axisLine={false} tickLine={false}/>
                    <YAxis domain={['auto', 'auto']} tick={{fill:"rgba(255,255,255,0.4)",fontSize:10, fontFamily:"monospace"}} width={60} tickFormatter={v=>fmt(v)} axisLine={false} tickLine={false}/>
                    <Tooltip 
                      formatter={(v:any)=><span className="font-mono text-white font-bold">{fmt(v)}</span>} 
                      contentStyle={{background:"rgba(0,0,0,0.8)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,color:"#fff"}} 
                    />
                    <Area type="monotone" dataKey="valor" stroke={simRes.failure ? "#ef4444" : "#10b981"} strokeWidth={3} fillOpacity={1} fill="url(#colorGlow)" activeDot={{r:6,fill:"#10b981",stroke:"#fff",strokeWidth:2}}/>
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20 text-sm font-mono tracking-widest">
                  ESPERANDO SIMULACIÓN...
                </div>
              )}
            </div>
          </div>

          {/* HISTORIAL */}
          <div className="glass-panel rounded-3xl flex flex-col h-[500px] overflow-hidden">
             <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40">
                <h2 className="text-xs font-black text-white/50 uppercase tracking-[0.2em]">Bitácora Simulada</h2>
                <span className="text-xs font-black text-cyan-400 uppercase tracking-widest bg-cyan-400/10 px-3 py-1 rounded-md border border-cyan-400/20">
                  {simRes?.totalTrades || 0} TRADES
                </span>
             </div>
             
             <div className="overflow-y-auto flex-grow custom-scrollbar p-2">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-[#0a0a0d] text-white/40 z-10">
                        <tr>
                            <th className="p-4 text-[11px] md:text-xs font-black uppercase tracking-widest text-center">Op #</th>
                            <th className="p-4 text-[11px] md:text-xs font-black uppercase tracking-widest">Riesgo</th>
                            <th className="p-4 text-[11px] md:text-xs font-black uppercase tracking-widest">Resultado</th>
                            <th className="p-4 text-[11px] md:text-xs font-black uppercase tracking-widest text-right">Saldo</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm md:text-base font-bold divide-y divide-white/5">
                      {simRes?.history.map((op, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors group">
                           <td className="p-4 text-white/30 font-mono text-center">#{op.num}</td>
                           <td className="p-4 text-white/70 font-mono tracking-tighter">{fmt(op.risk)}</td>
                           <td className={`p-4 font-mono tracking-tighter ${op.isWin ? 'text-emerald-400' : 'text-red-500'}`}>
                             {op.isWin ? '+' : ''}{fmt(op.result)}
                           </td>
                           <td className="p-4 text-cyan-400 font-mono tracking-tighter text-right group-hover:text-cyan-300 transition-colors">
                             {fmt(op.balance)}
                           </td>
                        </tr>
                      ))}
                    </tbody>
                </table>
                {!simRes && <div className="text-center py-20 text-white/20 font-mono text-xs">Sin registros de simulación</div>}
             </div>
          </div>

        </main>
      </div>
    </main>
  );
}
