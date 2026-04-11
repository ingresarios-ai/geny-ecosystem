import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, LayoutGrid, BarChart2, Target, X, ChevronDown, UserCircle, User, Shield, LogOut } from 'lucide-react';
import Auth from '../pages/Auth';
import { supabase } from '../lib/supabase';

export default function AppLayout() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [appsDropdownOpen, setAppsDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  const verifyAuth = async () => {
    try {
      const u = localStorage.getItem("cobro-user");
      if (u) {
        const parsed = JSON.parse(u);
        setIsAuthenticated(true);
        if (parsed.avatar) {
          setAvatarUrl(parsed.avatar);
        } else {
          setAvatarUrl("");
        }

        // Check if Admin
        if (parsed.id && parsed.id !== "00000000-0000-0000-0000-000000000000") {
            const { data } = await supabase.from('profiles').select('role').eq('id', parsed.id).single();
            if (data?.role === 'admin') setIsAdmin(true);
            else setIsAdmin(false);
        }

      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    } catch {
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
    setAuthChecking(false);
  };

  useEffect(() => {
    verifyAuth();
    const handleLogout = () => {
      setIsAuthenticated(false);
      setAvatarUrl("");
    };
    window.addEventListener('AvatarUpdated', verifyAuth);
    window.addEventListener('UserLogout', handleLogout);
    return () => {
      window.removeEventListener('AvatarUpdated', verifyAuth);
      window.removeEventListener('UserLogout', handleLogout);
    };
  }, []);

  const handleLoginGlobal = (u: any) => {
    localStorage.setItem("cobro-user", JSON.stringify(u));
    setIsAuthenticated(true);
    verifyAuth();
  };

  const handleSignOut = async () => {
    setProfileDropdownOpen(false);
    localStorage.removeItem("cobro-user");
    await supabase.auth.signOut();
    window.dispatchEvent(new Event('UserLogout'));
  };

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAppsDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setAppsDropdownOpen(false);
  }, [location.pathname]);

  const apps = [
    { name: "Hub del Ecosistema", path: "/geny", icon: <LayoutGrid size={16} /> },
    { name: "GENY-B Tracker", path: "/geny/genyb", icon: <BarChart2 size={16} /> },
    { name: "Posicionamiento Dinámico", path: "/geny/posicionamiento", icon: <Target size={16} /> }
  ];

  if (isAdmin) {
      apps.push({ name: "Admin Dashboard", path: "/admin", icon: <Shield size={16} /> });
  }

  if (authChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // Common background elements for both Auth and App Layout
  const BackgroundElements = (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_110%)]" />
      <motion.div 
        animate={{ x: `${mousePosition.x}%`, y: `${mousePosition.y}%` }}
        transition={{ type: "spring", damping: 50, stiffness: 50, mass: 2 }}
        className="absolute w-[40vw] h-[40vw] rounded-full bg-cyan-600/20 blur-[120px] mix-blend-screen -translate-x-1/2 -translate-y-1/2"
      />
      <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-900/30 blur-[150px] mix-blend-screen" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-emerald-900/20 blur-[150px] mix-blend-screen" />
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white overflow-x-hidden font-sans selection:bg-cyan-500/30">
        {BackgroundElements}
        <Auth onLogin={handleLoginGlobal} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden font-sans selection:bg-cyan-500/30">
      
      {/* Immersive Cinematic Background */}
      {BackgroundElements}
        


      {/* Ultra-Minimal Floating Nav */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl rounded-full glass-panel px-4 md:px-6 py-3 flex justify-between items-center transition-all duration-300">
        
        {/* LEFT COMPONENT: Hamburger + Logo + Apps Dropdown */}
        <div className="flex items-center gap-3 md:gap-6">
          
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white/80 hover:text-white p-2 rounded-full focus:outline-none bg-white/5 border border-white/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <Link to="/geny" className="flex items-center">
            <img 
              src="/logo.png" 
              alt="Ingresarios Logo" 
              className="h-7 md:h-8 w-auto object-contain"
              width="120"
              height="32"
            />
          </Link>
        </div>

        {/* RIGHT COMPONENT: Desktop Apps + Profile Icon */}
        <div className="flex items-center gap-6">
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center text-xs font-medium tracking-widest uppercase text-white/70">
            {/* Apps Dropdown */}
            <div 
              className="relative" 
              ref={dropdownRef}
              onMouseEnter={() => setAppsDropdownOpen(true)}
              onMouseLeave={() => setAppsDropdownOpen(false)}
            >
              <button 
                onClick={() => setAppsDropdownOpen(!appsDropdownOpen)}
                className="flex items-center gap-1 hover:text-white transition-colors focus:outline-none"
              >
                Aplicaciones <ChevronDown size={14} className={`transition-transform duration-300 ${appsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {appsDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full mt-4 right-0 w-64 glass-panel rounded-2xl p-2 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col gap-1"
                    style={{ background: 'rgba(5, 10, 15, 0.85)' }}
                  >
                    {apps.map(app => (
                      <Link 
                        key={app.path} 
                        to={app.path}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${location.pathname === app.path ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-white/10 text-white/80 hover:text-white'}`}
                      >
                        {app.icon}
                        <span className="text-xs font-bold font-sans tracking-wide normal-case">{app.name}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="hidden md:block w-px h-6 bg-white/20"></div>

          {/* Profile Dropdown */}
          <div 
            className="relative" 
            ref={profileRef}
            onMouseEnter={() => setProfileDropdownOpen(true)}
            onMouseLeave={() => setProfileDropdownOpen(false)}
          >
            <button 
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="w-8 h-8 rounded-full overflow-hidden border border-white/20 hover:border-cyan-400/50 transition-colors cursor-pointer relative bg-black/40 flex items-center justify-center focus:outline-none"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="User" className="w-full h-full object-cover" />
              ) : (
                <User size={16} className="text-white/50" />
              )}
            </button>
            <AnimatePresence>
              {profileDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full mt-4 right-0 w-48 glass-panel rounded-2xl p-2 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col gap-1"
                  style={{ background: 'rgba(5, 10, 15, 0.85)' }}
                >
                  <Link 
                    to="/geny/perfil" 
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/10 text-white/80 hover:text-white"
                  >
                    <User size={16} />
                    <span className="text-xs font-bold font-sans tracking-wide">Mi Cuenta</span>
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-red-500/20 text-red-500 hover:text-red-400 w-full text-left"
                  >
                    <LogOut size={16} />
                    <span className="text-xs font-bold font-sans tracking-wide">Cerrar Sesión</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-md glass-panel rounded-3xl p-4 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col gap-2 md:hidden"
            style={{ background: 'rgba(5, 10, 15, 0.90)' }}
          >
            <div className="text-[10px] font-black tracking-widest uppercase text-white/40 mb-2 px-2">Aplicaciones</div>
            {apps.map(app => (
              <Link 
                key={app.path} 
                to={app.path}
                className={`flex items-center gap-3 p-4 rounded-2xl transition-colors ${location.pathname === app.path ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-black/30 text-white/80 border border-white/5 hover:bg-white/10'}`}
              >
                {app.icon}
                <span className="text-sm font-bold">{app.name}</span>
              </Link>
            ))}
            

          </motion.div>
        )}
      </AnimatePresence>

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
