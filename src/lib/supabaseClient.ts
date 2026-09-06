import { createClient } from '@supabase/supabase-js'

// The anon key is designed to be public in client apps — actual protection
// comes from Postgres Row Level Security policies, not from hiding this key.
const SUPABASE_URL = 'https://qjjttdpadxpxdvlxffcd.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_DYysIyo70uegYLB-tHH8kQ_4ZM-cQkh'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
