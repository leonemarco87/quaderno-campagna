import { useState, useEffect, createContext, useContext } from 'react'
import { db } from '../lib/supabase'

const ConfigContext = createContext({})

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState({})
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const rows = await db.getAll('configurazioni', { order: 'ordinamento', asc: true })
      const grouped = {}
      rows.forEach(r => {
        if (!grouped[r.categoria]) grouped[r.categoria] = []
        grouped[r.categoria].push({ id: r.id, valore: r.valore, ordinamento: r.ordinamento })
      })
      setConfig(grouped)
    } catch(e) {
      console.error('Errore caricamento configurazioni:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const getList = (categoria) =>
    (config[categoria] || []).map(r => r.valore)

  const addItem = async (categoria, valore) => {
    if (!valore.trim()) return
    const existing = config[categoria] || []
    const maxOrd = existing.reduce((m, r) => Math.max(m, r.ordinamento), 0)
    await db.insert('configurazioni', {
      categoria,
      valore: valore.trim(),
      ordinamento: maxOrd + 1
    })
    await load()
  }

  const removeItem = async (id) => {
    await db.remove('configurazioni', id)
    await load()
  }

  const updateItem = async (id, valore) => {
    await db.update('configurazioni', id, { valore })
    await load()
  }

  return (
    <ConfigContext.Provider value={{ config, loading, getList, addItem, removeItem, updateItem, reload: load }}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  return useContext(ConfigContext)
}
