import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const migration = readFileSync(join(__dirname, 'supabase/migrations/20251016125800_fix_rls_for_anon_access.sql'), 'utf8');

console.log('Applying RLS fix migration...');

const { data, error } = await supabase.rpc('exec_sql', { sql: migration });

if (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}

console.log('Migration applied successfully!');
