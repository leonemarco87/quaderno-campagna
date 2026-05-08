import { createClient } from '@supabase/supabase-js'

// ─── ISTRUZIONI CONFIGURAZIONE ──────────────────────────────────────────────
// 1. Vai su https://supabase.com e crea un account gratuito
// 2. Crea un nuovo progetto (es. "quaderno-campagna")
// 3. Vai su Project Settings → API
// 4. Copia "Project URL" e "anon public key"
// 5. Sostituisci i valori qui sotto oppure crea un file .env nella root:
//    VITE_SUPABASE_URL=https://xxxxx.supabase.co
//    VITE_SUPABASE_ANON_KEY=eyJhbGci...
// ────────────────────────────────────────────────────────────────────────────

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ujqfwilmbldgjihnfnrf.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqcWZ3aWxtYmxkZ2ppaG5mbnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMDE4MzQsImV4cCI6MjA5Mzc3NzgzNH0.zJD4hDEcYbGCjP4TibFCTFwden83acoes7GdVxvKWtA'

export const supabase = createClient(supabaseUrl, supabaseKey)

// ─── HELPER GENERICI ────────────────────────────────────────────────────────
export const db = {
  async getAll(table, options = {}) {
    let query = supabase.from(table).select('*')
    if (options.order) query = query.order(options.order, { ascending: options.asc ?? false })
    if (options.limit) query = query.limit(options.limit)
    if (options.filters) {
      options.filters.forEach(([col, op, val]) => {
        query = query.filter(col, op, val)
      })
    }
    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async insert(table, row) {
    const { data, error } = await supabase.from(table).insert(row).select().single()
    if (error) throw error
    return data
  },

  async update(table, id, updates) {
    const { data, error } = await supabase.from(table).update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async remove(table, id) {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) throw error
  },

  async sumColumn(table, column, filters = []) {
    let query = supabase.from(table).select(column)
    filters.forEach(([col, op, val]) => { query = query.filter(col, op, val) })
    const { data, error } = await query
    if (error) return 0
    return (data || []).reduce((acc, row) => acc + (parseFloat(row[column]) || 0), 0)
  }
}
