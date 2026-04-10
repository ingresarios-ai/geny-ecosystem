import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sozizuskspotnixujipj.supabase.co';
const supabaseKey = 'sb_publishable_eKqj8tqRRksGJzFyWd4q3A_AHAo0p-U';

export const supabase = createClient(supabaseUrl, supabaseKey);
