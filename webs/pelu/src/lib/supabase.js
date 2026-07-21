import { createClient } from '@supabase/supabase-js';

// Substitueix aquests valors amb les teves claus de Supabase (Project Settings > API)
const supabaseUrl = 'https://giirxihhynoqcycemgjh.supabase.co';
const supabaseAnonKey = 'sb_publishable_pjxst0_gtfs-loiHIuOoRA_M4W46Mdg';

//NEXT_PUBLIC_SUPABASE_URL=https://giirxihhynoqcycemgjh.supabase.co
//NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_pjxst0_gtfs-loiHIuOoRA_M4W46Mdg

export const supabase = createClient(supabaseUrl, supabaseAnonKey);