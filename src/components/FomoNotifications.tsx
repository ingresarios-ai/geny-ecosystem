import { useState, useEffect, useCallback } from 'react';
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

export default function FomoNotifications() {
  const [notifications, setNotifications] = useState<FomoEntry[]>([]);
  const [currentNotif, setCurrentNotif] = useState<FomoEntry | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch recent entries from non-admin users
  const fetchEntries = useCallback(async () => {
    try {
      // Get admin user IDs to exclude
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin');

      const adminIds = (admins || []).map(a => a.id);

      // Get all profiles for name mapping
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email');

      const profileMap: Record<string, string> = {};
      (profiles || []).forEach(p => {
        profileMap[p.id] = p.full_name || p.email?.split('@')[0] || 'Usuario';
      });

      // Get recent entries, excluding admins
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

        // Shuffle for variety
        const shuffled = filtered.sort(() => Math.random() - 0.5);
        setNotifications(shuffled);
      }
    } catch (err) {
      console.error('FOMO fetch error:', err);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchEntries, 300000);
    return () => clearInterval(interval);
  }, [fetchEntries]);

  // Cycle through notifications
  useEffect(() => {
    if (notifications.length === 0 || dismissed) return;

    // Initial delay before first notification (3-6 seconds)
    const initialDelay = setTimeout(() => {
      showNext();
    }, 3000 + Math.random() * 3000);

    return () => clearTimeout(initialDelay);
  }, [notifications, dismissed]);

  const showNext = () => {
    if (notifications.length === 0 || dismissed) return;

    const idx = currentIndex % notifications.length;
    setCurrentNotif(notifications[idx]);
    setVisible(true);
    setCurrentIndex(prev => prev + 1);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      setVisible(false);

      // Schedule next notification (8-15 seconds gap)
      setTimeout(() => {
        showNext();
      }, 8000 + Math.random() * 7000);
    }, 5000);
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
  };

  if (dismissed || notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[60] max-w-[340px]">
      <AnimatePresence>
        {visible && currentNotif && (
          <motion.div
            initial={{ opacity: 0, y: 40, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, x: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative group"
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
