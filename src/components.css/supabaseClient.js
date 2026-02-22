import { createClient } from '@supabase/supabase-js'

// Estos datos los obtienes en el dashboard de Supabase:
// Settings -> API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)