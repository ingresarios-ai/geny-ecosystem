import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Outlet, Link } from 'react-router-dom';

export default function AppLayout() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden font-sans selection:bg-cyan-500/30">
      
      {/* Immersive Cinematic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Dynamic Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        {/* Interactive Glowing Orbs */}
        <motion.div 
          animate={{
            x: `${mousePosition.x}%`,
            y: `${mousePosition.y}%`,
          }}
          transition={{ type: "spring", damping: 50, stiffness: 50, mass: 2 }}
          className="absolute w-[40vw] h-[40vw] rounded-full bg-cyan-600/20 blur-[120px] mix-blend-screen -translate-x-1/2 -translate-y-1/2"
        />
        <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-900/30 blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-emerald-900/20 blur-[150px] mix-blend-screen" />
      </div>

      {/* Ultra-Minimal Floating Nav */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl rounded-full glass-panel px-6 py-3 flex justify-between items-center">
        <Link to="/geny" className="flex items-center">
          <img 
            src="/logo.png" 
            alt="Ingresarios Logo" 
            className="h-8 w-auto object-contain"
            width="120"
            height="32"
          />
        </Link>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6 text-xs font-medium tracking-widest uppercase text-white/50">
            <Link to="/geny" className="hover:text-white transition-colors cursor-pointer text-white">Hub</Link>
            <span className="hover:text-white transition-colors cursor-pointer">Perfil</span>
            <span className="hover:text-white transition-colors cursor-pointer">Ajustes</span>
          </div>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ingresarios&backgroundColor=transparent" alt="User" className="w-full h-full object-cover" />
          </div>
        </div>
      </nav>

      {/* Main Content Area para las Rutas */}
      <div className="relative z-10 w-full min-h-screen flex flex-col">
        <div className="flex-1">
          <Outlet />
        </div>

        {/* Footer Ecosystem Global */}
        <div className="flex flex-col items-center justify-center py-10 mt-auto opacity-40 hover:opacity-100 transition-opacity duration-500 gap-5">
          <img src="/logo.png" alt="Ingresarios" className="h-5 md:h-6 object-contain grayscale hover:grayscale-0 transition-all opacity-80" />
          <div className="flex items-center gap-4 text-[10px] md:text-xs font-mono tracking-widest uppercase text-white/50">
            <a href="https://site.ingresarios.net/terminos-de-uso-de-informacion" target="_blank" rel="noopener noreferrer" className="hover:text-white cursor-pointer transition-colors">Términos de Uso</a>
            <span>•</span>
            <a href="https://site.ingresarios.net/politicas-privacidad" target="_blank" rel="noopener noreferrer" className="hover:text-white cursor-pointer transition-colors">Políticas de Privacidad</a>
          </div>
          <div className="text-[10px] font-mono tracking-widest text-white/30">
            © 2026 INGRESARIOS
          </div>
        </div>
      </div>
    </div>
  );
}
