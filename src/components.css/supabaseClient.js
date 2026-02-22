import { createClient } from '@supabase/supabase-js'

// Estos datos los obtienes en el dashboard de Supabase:
// Settings -> API
const supabaseUrl = 'https://ozphjwpzsqdoorhtwvgm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96cGhqd3B6c3Fkb29yaHR3dmdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyOTcyNTIsImV4cCI6MjA4Njg3MzI1Mn0.EjI4T8_N7AfJJNq65ZeJIq-Y46yy5WQQ9-ARF_r8w5U'

export const supabase = createClient(supabaseUrl, supabaseKey)