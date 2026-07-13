import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'

const ClientsContext = createContext(null)

export function ClientsProvider({ children }) {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    try {
      const data = await api.get('/api/clients/')
      setClients(data)
    } catch {}
    finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { reload() }, [reload])

  return (
    <ClientsContext.Provider value={{ clients, loading, reload }}>
      {children}
    </ClientsContext.Provider>
  )
}

export function useClients() {
  return useContext(ClientsContext)
}
