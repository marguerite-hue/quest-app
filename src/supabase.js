import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://uxgejvkoevtexfquafgg.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Z2VqdmtvZXZ0ZXhmcXVhZmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NjE5NjIsImV4cCI6MjA4MzUzNzk2Mn0.kt9snmmPJHEzf-dSJkFr40v2qu3CcjXl9kmo7ORqXPE'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
export const HUGGINGFACE_TOKEN = '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'