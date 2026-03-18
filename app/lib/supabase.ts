import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qwerquacvpipxgnynbro.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3ZXJxdWFjdnBpcHhnbnluYnJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMzA4ODAsImV4cCI6MjA4ODkwNjg4MH0.IIK5bIRNXq4Sn5HETXSWLkuSYSDX5fcSMhi9slXe1Tw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
