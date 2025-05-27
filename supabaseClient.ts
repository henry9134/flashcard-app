import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ffsjivkbrrjxcykczzoz.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

