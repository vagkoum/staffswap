import { createClient } from '@supabase/supabase-js'

// ─────────────────────────────────────────────
// 👉 EDIT THESE TWO LINES WITH YOUR OWN VALUES
//    Get them from: https://app.supabase.com
//    → Your project → Settings → API
// ─────────────────────────────────────────────
const SUPABASE_URL = 'https://fnqkylgekrnpvczbivzh.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_zX1qS0QmH5RIkvOexSAYqQ_RqrzgYof'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
