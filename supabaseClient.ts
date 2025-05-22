// supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ffsjivkbrrjxcykczzoz.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmc2ppdmticnJqeGN5a2N6em96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4ODk5ODMsImV4cCI6MjA2MzQ2NTk4M30.d_PyuAxp9eC3YoOZtcUH2moU4tqMsCNlRbjrBbqGAoI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
