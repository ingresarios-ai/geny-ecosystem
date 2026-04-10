import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sozizuskspotnixujipj.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_eKqj8tqRRksGJzFyWd4q3A_AHAo0p-U';

export const supabase = createClient(supabaseUrl, supabaseKey);
