import { createBrowserClient as createClient } from "@supabase/ssr"
import type { Database } from "@/lib/database.types"

export const createBrowserClient = () =>
  createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

