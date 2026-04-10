import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Sparkles,
  Activity,
  ChevronRight,
  ChevronLeft,
  LineChart,
  Terminal,
  Cpu,
  Globe2
} from 'lucide-react';

const APPS = [
  {
    id: 'geny-b',
    name: 'Geny B',
    description: 'Tu copiloto de inteligencia artificial. Analiza patrones, volumen y estructura de mercado en milisegundos.',
    icon: Sparkles,
    badge: 'IA Activa',
    status: 'active',
    gradient: 'from-cyan-500/10 via-transparent to-blue-600/10',
    glow: 'bg-cyan-500/20 group-hover:bg-cyan-400/30',
    iconBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.2)]',
    badgeClass: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
    titleHover: 'group-hover:text-glow-cyan',
    actionText: 'Iniciar Terminal',
    ActionIcon: Terminal
  },
  {
    id: 'posicionamiento',
    name: 'Posicionamiento Dinámico',
    description: 'Calculadora de riesgo y tamaño de posición en tiempo real. Protege tu capital con precisión matemática.',
    icon: Activity,
    badge: 'Herramienta',
    status: 'active',
    gradient: 'from-emerald-500/10 via-transparent to-teal-600/10',
    glow: 'bg-emerald-500/20 group-hover:bg-emerald-400/30',
    iconBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.2)]',
    badgeClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    titleHover: 'group-hover:text-glow-emerald',
    actionText: 'Abrir Calculadora',
    ActionIcon: ChevronRight
  },
  {
    id: 'diario',
    name: 'Diario de Trading',
    description: 'Analíticas profundas de tu psicología y ejecución. Registra y mejora cada aspecto de tu operativa.',
    icon: LineChart,
    badge: 'En Desarrollo',
    status: 'upcoming',
    gradient: 'from-purple-500/5 via-transparent to-pink-600/5',
    glow: 'bg-purple-500/10 group-hover:bg-purple-400/20',
    iconBg: 'bg-white/5 border-white/10 text-white/40',
    badgeClass: 'border-white/10 bg-white/5 text-white/30',
    titleHover: 'group-hover:text-white',
    actionText: 'Próximamente',
    ActionIcon: null
  },
  {
    id: 'scanner',
    name: 'Scanner Institucional',
    description: 'Rastreo de volumen inusual y huellas institucionales en múltiples activos simultáneamente.',
    icon: Cpu,
    badge: 'En Desarrollo',
    status: 'upcoming',
    gradient: 'from-orange-500/5 via-transparent to-amber-600/5',
    glow: 'bg-orange-500/10 group-hover:bg-orange-400/20',
    iconBg: 'bg-white/5 border-white/10 text-white/40',
    badgeClass: 'border-white/10 bg-white/5 text-white/30',
    titleHover: 'group-hover:text-white',
    actionText: 'Próximamente',
    ActionIcon: null
  }
];

export default function EcosystemHub() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft) < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current && carouselRef.current.firstElementChild) {
      const cardWidth = carouselRef.current.firstElementChild.clientWidth;
      const gap = 24; // gap-6 is 24px
      const scrollAmount = cardWidth + gap;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };


  return (
      <main className="pt-32 pb-24 max-w-[1600px] mx-auto w-full">
        
        {/* Massive Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12 flex flex-col items-center text-center px-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono tracking-widest uppercase text-cyan-400">Sistema Operativo Ingresarios</span>
          </div>
          
          <div className="inline-flex flex-col mb-10 select-none">
            <h1 className="text-[15vw] md:text-[10vw] leading-[0.8] font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/20 text-glow-cyan">
              GENY
            </h1>
            <div className="w-full flex justify-between bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 font-bold uppercase text-lg md:text-3xl mt-2 md:mt-4 px-1 opacity-90">
              <span>E</span><span>C</span><span>O</span><span>S</span><span>Y</span><span>S</span><span>T</span><span>E</span><span>M</span>
            </div>
          </div>
          
          <p className="text-lg md:text-2xl font-light text-white/60 max-w-2xl">
            La central de inteligencia y herramientas avanzadas para dominar el mercado.
          </p>
        </motion.div>

        {/* Innovative Sliding Carousel */}
        <div className="relative w-full mb-16">
          {/* Edge fade masks for desktop to blend the carousel smoothly */}
          <div className="hidden md:block absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black to-transparent z-20 pointer-events-none" />
          <div className="hidden md:block absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black to-transparent z-20 pointer-events-none" />

          {/* Blinking Arrows for Scroll Indication */}
          {canScrollLeft && (
            <button 
              onClick={() => scroll('left')}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 cursor-pointer hover:scale-110 transition-transform focus:outline-none"
              aria-label="Deslizar a la izquierda"
            >
              <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white animate-pulse shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:bg-white/10">
                <ChevronLeft size={24} />
              </div>
            </button>
          )}
          {canScrollRight && (
            <button 
              onClick={() => scroll('right')}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 cursor-pointer hover:scale-110 transition-transform focus:outline-none"
              aria-label="Deslizar a la derecha"
            >
              <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white animate-pulse shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:bg-white/10">
                <ChevronRight size={24} />
              </div>
            </button>
          )}

          {/* Scrollable Container */}
          <div 
            ref={carouselRef}
            onScroll={checkScroll}
            className="flex overflow-x-auto gap-6 snap-x snap-mandatory hide-scrollbar px-4 md:px-16 pb-12 pt-4"
          >
            
            {APPS.map((app, idx) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + idx * 0.1 }}
                className="w-[85vw] md:w-[420px] shrink-0 snap-center md:snap-start relative group rounded-[2.5rem] overflow-hidden glass-panel glass-panel-hover cursor-pointer h-[440px] flex flex-col"
              >
                {/* Dynamic Backgrounds */}
                <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-50 group-hover:opacity-100 transition-opacity duration-700`} />
                <div className={`absolute right-[-10%] bottom-[-20%] w-[60%] h-[80%] ${app.glow} blur-[80px] rounded-full transition-colors duration-700`} />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-30" />

                {/* Card Content */}
                <div className="relative z-10 p-8 md:p-10 h-full flex flex-col justify-between">
                  
                  {/* Top Section */}
                  <div className="flex justify-between items-start">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-md border group-hover:scale-110 transition-transform duration-500 ${app.iconBg}`}>
                      <app.icon size={32} />
                    </div>
                    <div className={`px-4 py-1.5 rounded-full border text-xs font-mono tracking-widest uppercase ${app.badgeClass}`}>
                      {app.badge}
                    </div>
                  </div>
                  
                  {/* Bottom Section */}
                  <div className="mt-auto">
                    <h2 className={`text-3xl md:text-4xl font-bold tracking-tighter mb-4 transition-all duration-500 ${app.status === 'active' ? app.titleHover : 'text-white/50'}`}>
                      {app.name}
                    </h2>
                    <p className={`text-lg mb-8 font-light line-clamp-3 ${app.status === 'active' ? 'text-white/60' : 'text-white/30'}`}>
                      {app.description}
                    </p>
                    
                    {/* Action Button */}
                    {app.status === 'active' ? (
                      <Link to={app.id === 'geny-b' ? '/geny/genyb' : `/geny/${app.id}`} className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white text-black font-bold text-sm uppercase tracking-widest hover:scale-105 transition-transform duration-300">
                        {app.actionText} {app.ActionIcon && <app.ActionIcon size={18} />}
                      </Link>
                    ) : (
                      <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/30 font-bold text-sm uppercase tracking-widest">
                        {app.actionText}
                      </div>
                    )}
                  </div>
                  
                </div>
              </motion.div>
            ))}
            
            {/* Spacer for the end of scroll */}
            <div className="w-4 md:w-8 shrink-0" />
          </div>
        </div>

        {/* Live Market Ticker */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative rounded-full overflow-hidden glass-panel flex flex-col justify-center h-[80px] md:h-[100px] mx-4 md:mx-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-transparent to-purple-900/10" />
          
          <div className="flex overflow-hidden relative w-full items-center h-full">
            {/* Fade masks */}
            <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-black to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-black to-transparent z-10" />
            
            <div className="absolute left-6 z-20 hidden md:flex items-center gap-2 text-white/40 text-[10px] font-mono uppercase tracking-widest bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/5">
              <Globe2 size={12} /> Flujo Global
            </div>

            <div className="flex animate-marquee whitespace-nowrap items-center gap-12 md:gap-24 px-12 md:px-48">
              {/* Duplicated for infinite scroll effect */}
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-12 md:gap-24 items-center">
                  <div className="flex items-baseline gap-3">
                    <span className="text-white/40 text-xs font-mono">ES</span>
                    <span className="text-xl md:text-2xl font-mono font-bold text-white">5,124.50</span>
                    <span className="text-emerald-400 text-sm md:text-base">+12.5</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-white/40 text-xs font-mono">NQ</span>
                    <span className="text-xl md:text-2xl font-mono font-bold text-white">18,230.25</span>
                    <span className="text-emerald-400 text-sm md:text-base">+45.0</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-white/40 text-xs font-mono">GC</span>
                    <span className="text-xl md:text-2xl font-mono font-bold text-white">2,150.80</span>
                    <span className="text-rose-400 text-sm md:text-base">-2.4</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-white/40 text-xs font-mono">CL</span>
                    <span className="text-xl md:text-2xl font-mono font-bold text-white">82.45</span>
                    <span className="text-emerald-400 text-sm md:text-base">+0.8</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </main>
  );
}
