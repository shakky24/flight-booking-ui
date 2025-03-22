import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://lqegazuelocbxjmtevti.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZWdhenVlbG9jYnhqbXRldnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1NTYwNzIsImV4cCI6MjA1ODEzMjA3Mn0.F4sVu3mQ6dJsCA6Kz66zPazGdB7a51TMovNUOZjT2mo';

export const supabase = createClient(supabaseUrl, supabaseKey);
