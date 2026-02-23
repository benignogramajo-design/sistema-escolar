import { createClient } from '@supabase/supabase-js'

// Estos datos los obtienes en el dashboard de Supabase:
// Settings -> API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Verificamos si las credenciales existen antes de crear el cliente
// Esto evita que la pantalla se ponga en blanco si falta el archivo .env
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

if (!supabase) console.warn("Supabase no está configurado. Faltan las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.");
