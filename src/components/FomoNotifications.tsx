import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { TrendingUp, TrendingDown, X } from 'lucide-react';

interface FomoEntry {
  id: string;
  amount: number;
  userName: string;
  date: string;
  timeAgo: string;
}

const getTimeAgo = (dateStr: string): string => {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);

  if (mins < 1) return 'ahora mismo';
  if (mins < 60) return `hace ${mins} min`;
  if (hrs < 24) return `hace ${hrs}h`;
  if (days === 1) return 'ayer';
  if (days < 7) return `hace ${days} días`;
  return `hace ${Math.floor(days / 7)} sem`;
};

const maskName = (name: string): string => {
  if (!name || name.length < 3) return 'Usuario';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1][0]}.`;
  }
  return `${name.slice(0, Math.ceil(name.length * 0.6))}...`;
};

// Fisher-Yates shuffle (one-time randomization)
const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export default function FomoNotifications() {
  const [notifications, setNotifications] = useState<FomoEntry[]>([]);
  const [currentNotif, setCurrentNotif] = useState<FomoEntry | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Refs for stable sequential cycling inside timeouts
  const indexRef = useRef(0);
  const dismissedRef = useRef(false);
  const notifsRef = useRef<FomoEntry[]>([]);
  const showTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Keep refs in sync
  useEffect(() => { dismissedRef.current = dismissed; }, [dismissed]);
  useEffect(() => { notifsRef.current = notifications; }, [notifications]);

  // Fetch recent entries from non-admin users
  const fetchEntries = useCallback(async () => {
    try {
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin');

      const adminIds = (admins || []).map(a => a.id);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email');

      const profileMap: Record<string, string> = {};
      (profiles || []).forEach(p => {
        profileMap[p.id] = p.full_name || p.email?.split('@')[0] || 'Usuario';
      });

      const { data: recentEntries } = await supabase
        .from('entries')
        .select('id, user_id, amount, date, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (recentEntries) {
        const filtered = recentEntries
          .filter(e => !adminIds.includes(e.user_id))
          .map(e => ({
            id: e.id,
            amount: Number(e.amount),
            userName: maskName(profileMap[e.user_id] || 'Usuario'),
            date: e.created_at || e.date,
            timeAgo: getTimeAgo(e.created_at || e.date),
          }));

        // Shuffle once, then cycle sequentially
        const shuffled = shuffle(filtered);
        setNotifications(shuffled);
        notifsRef.current = shuffled;
        indexRef.current = 0;
      }
    } catch (err) {
      console.error('FOMO fetch error:', err);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
    const interval = setInterval(fetchEntries, 300000);
    return () => clearInterval(interval);
  }, [fetchEntries]);

  // Sequential cycling with random delays
  const scheduleNext = useCallback(() => {
    if (dismissedRef.current || notifsRef.current.length === 0) return;

    const delay = 8000 + Math.random() * 7000; // 8-15s random gap
    showTimerRef.current = setTimeout(() => {
      if (dismissedRef.current || notifsRef.current.length === 0) return;

      // Pick next in sequence
      const idx = indexRef.current % notifsRef.current.length;
      setCurrentNotif(notifsRef.current[idx]);
      setVisible(true);
      indexRef.current = idx + 1;

      // Auto-hide after 5s, then schedule the next one
      hideTimerRef.current = setTimeout(() => {
        setVisible(false);
        scheduleNext();
      }, 5000);
    }, delay);
  }, []);

  // Kick off the cycle once data is loaded
  useEffect(() => {
    if (notifications.length === 0 || dismissed) return;

    // Initial delay 3-6s
    const initDelay = 3000 + Math.random() * 3000;
    showTimerRef.current = setTimeout(() => {
      if (dismissedRef.current) return;
      setCurrentNotif(notifsRef.current[0]);
      setVisible(true);
      indexRef.current = 1;

      hideTimerRef.current = setTimeout(() => {
        setVisible(false);
        scheduleNext();
      }, 5000);
    }, initDelay);

    return () => {
      clearTimeout(showTimerRef.current);
      clearTimeout(hideTimerRef.current);
    };
  }, [notifications, dismissed, scheduleNext]);

  const handleDismiss = () => {
    clearTimeout(showTimerRef.current);
    clearTimeout(hideTimerRef.current);
    setVisible(false);
    setDismissed(true);
  };

  if (dismissed || notifications.length === 0) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-6 md:right-auto z-[60] max-w-[340px] mx-auto pointer-events-none flex justify-center md:justify-start">
      <AnimatePresence>
        {visible && currentNotif && (
          <motion.div
            initial={{ opacity: 0, y: 40, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, x: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative group w-full pointer-events-auto"
          >
            {/* Glow effect */}
            <div className={`absolute -inset-1 rounded-2xl blur-lg opacity-30 ${
              currentNotif.amount >= 0 
                ? 'bg-emerald-500/40' 
                : 'bg-red-500/40'
            }`} />
            
            <div className={`relative flex items-start gap-3 p-4 rounded-2xl backdrop-blur-xl border shadow-2xl ${
              currentNotif.amount >= 0
                ? 'bg-[#0a1a12]/90 border-emerald-500/20 shadow-emerald-500/5'
                : 'bg-[#1a0a0a]/90 border-red-500/20 shadow-red-500/5'
            }`}>
              
              {/* Icon */}
              <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                currentNotif.amount >= 0
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {currentNotif.amount >= 0 ? (
                  <TrendingUp size={20} />
                ) : (
                  <TrendingDown size={20} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="text-[13px] text-white leading-snug">
                  <span className="font-bold">{currentNotif.userName}</span>
                  <span className="text-white/60">
                    {currentNotif.amount >= 0 ? ' registró una ganancia de ' : ' registró una pérdida de '}
                  </span>
                  <span className={`font-black font-mono ${
                    currentNotif.amount >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    ${Math.abs(currentNotif.amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-[10px] text-white/30 font-mono mt-1 uppercase tracking-wider">
                  {currentNotif.timeAgo} · Geny-B Tracker
                </div>
              </div>

              {/* Dismiss */}
              <button
                onClick={handleDismiss}
                className="shrink-0 text-white/20 hover:text-white/60 transition-colors p-0.5 opacity-0 group-hover:opacity-100"
              >
                <X size={14} />
              </button>
            </div>

            {/* Progress bar */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 5, ease: 'linear' }}
              className={`absolute bottom-0 left-4 right-4 h-[2px] rounded-full origin-left ${
                currentNotif.amount >= 0 ? 'bg-emerald-500/40' : 'bg-red-500/40'
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
