import { createClient } from '@supabase/supabase-js'

// 加上 as string，讓 TypeScript 知道這絕對是字串
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseKey)