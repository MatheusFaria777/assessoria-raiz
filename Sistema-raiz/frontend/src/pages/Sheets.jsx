import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { toast } from '../lib/toast'

function lastMonthRange() {
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const last  = new Date(now.getFullYear(), now.getMonth(), 0)
  const fmt = d => d.toISOString().split('T')[0]
  return { since: fmt(first), until: fmt(last) }
}

function lastWeekRange() {
  // Janela rolante: until = ontem, since = ontem - 6 dias
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const since = new Date(yesterday)
  since.setDate(yesterday.getDate() - 6)
  const fmt = d => d.toISOString().split('T')[0]
  return { since: fmt(since), until: fmt(yesterday) }
}

function SyncStatusBadge({ clientId }) {
  const [log, setLog] = useState(null)

  useEffect(() => {
    api.get(`/api/sheets/last-sync/${clientId}`)
      .then(setLog).catch(() => {})
  }, [clientId])

  if (!log?.synced_at) return <span className="badge badge-neutral">Nunca sincronizado</span>

  const dt = new Date(log.synced_at)
  const fmt = dt.toLocaleDateString('pt-BR') + ' ' + dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return (
    <span className={`badge ${log.status === 'success' ? 'badge-success' : 'badge-error'}`}>
      {log.status === 'success' ? '✓' : '✗'} {fmt} · {log.type}
    </span>
  )
}

export default function Sheets() {
  const [clients, setClients] = useState([])
  const [syncType, setSyncType] = useState('weekly')
  const [since, setSince]   = useState(() => lastWeekRange().since)
  const [until, setUntil]   = useState(() => lastWeekRange().until)
  const [loading, setLoading] = useState({})
  const [batchLoading, setBatchLoading] = useState(false)
  const [results, setResults] = useState({})

  useEffect(() => {
    api.get('/api/clients/').then(cs => setClients(cs.filter(c => c.sheets_id))).catch(() => {})
  }, [])

  useEffect(() => {
    const r = syncType === 'weekly' ? lastWeekRange() : lastMonthRange()
    setSince(r.since); setUntil(r.until)
  }, [syncType])

  const sync = async (clientId) => {
    setLoading(l => ({ ...l, [clientId]: true }))
    setResults(r => ({ ...r, [clientId]: null }))
    try {
      const r = await api.post('/api/sheets/sync', { client_id: clientId, since, until, sync_type: syncType })
      setResults(prev => ({ ...prev, [clientId]: r }))
      if (r.ok) toast(`Sincronizado!`)
      else toast(`Sincronizado com erros`, 'error')
    } catch (e) {
      toast(e.message, 'error')
      setResults(prev => ({ ...prev, [clientId]: { ok: false, errors: [e.message] } }))
    } finally {
      setLoading(l => ({ ...l, [clientId]: false }))
    }
  }

  const syncAll = async () => {
    setBatchLoading(true)
    try {
      const r = await api.post('/api/sheets/sync-batch', { since, until, sync_type: syncType })
      const ok = r.results.filter(x => x.ok).length
      const fail = r.results.filter(x => !x.ok).length
      toast(`${ok} sincronizados${fail ? `, ${fail} com erro` : ''}`, fail ? 'error' : 'success')
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBatchLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Sincronização de Planilhas</h2>
          <p style={{ margin: '.25rem 0 0', fontSize: '.875rem', color: 'rgba(245,245,245,.45)' }}>
            {clients.length} cliente{clients.length !== 1 ? 's' : ''} com planilha configurada
          </p>
        </div>
        <button className="btn-secondary" onClick={syncAll} disabled={batchLoading || clients.length === 0}>
          {batchLoading ? <span className="spinner" /> : '🔄'}
          Sincronizar todos
        </button>
      </div>

      {/* Controles */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div className="field" style={{ flex: 'none' }}>
          <label className="label">Tipo</label>
          <div style={{ display: 'flex', gap: '.5rem' }}>
            {[['weekly', 'Semanal'], ['monthly', 'Mensal']].map(([v, l]) => (
              <button key={v} type="button" onClick={() => setSyncType(v)} style={{
                padding: '.375rem .875rem', borderRadius: 6, border: '1px solid', cursor: 'pointer',
                fontSize: '.8rem', transition: 'all .15s',
                background: syncType === v ? 'rgba(203,161,53,.2)' : 'transparent',
                borderColor: syncType === v ? '#CBA135' : 'rgba(245,245,245,.15)',
                color: syncType === v ? '#CBA135' : 'rgba(245,245,245,.5)',
              }}>{l}</button>
            ))}
          </div>
        </div>
        <div className="field">
          <label className="label">De</label>
          <input className="input" type="date" value={since} onChange={e => setSince(e.target.value)} style={{ width: 160 }} />
        </div>
        <div className="field">
          <label className="label">Até</label>
          <input className="input" type="date" value={until} onChange={e => setUntil(e.target.value)} style={{ width: 160 }} />
        </div>
      </div>

      {/* Lista de clientes */}
      {clients.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48, marginBottom: '1rem' }}>📋</div>
          <p style={{ fontWeight: 500, color: 'rgba(245,245,245,.5)' }}>Nenhum cliente com planilha configurada</p>
          <p style={{ fontSize: '.875rem', marginTop: '.5rem' }}>Configure o ID da planilha em Clientes → aba Planilha</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {clients.map(c => {
            const res = results[c.id]
            return (
              <div key={c.id} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 8, flexShrink: 0,
                    background: 'rgba(203,161,53,.15)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#CBA135',
                  }}>{c.name.charAt(0)}</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '.9375rem' }}>{c.name}</div>
                    <div style={{ marginTop: '.25rem' }}>
                      <SyncStatusBadge clientId={c.id} />
                    </div>
                  </div>

                  <button className="btn-primary" onClick={() => sync(c.id)} disabled={loading[c.id]}>
                    {loading[c.id] ? <span className="spinner" /> : '🔄'}
                    Sincronizar
                  </button>
                </div>

                {/* Resultado */}
                {res && (
                  <div style={{ marginTop: '.875rem', paddingTop: '.875rem', borderTop: '1px solid rgba(245,245,245,.08)' }}>
                    {res.ok ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                        {Object.entries(res.results || {}).map(([tab, r]) => (
                          <span key={tab} className={`badge ${r.ok ? 'badge-success' : 'badge-error'}`}>
                            {r.ok ? `✓ ${tab} (linha ${r.row})` : `✗ ${tab}: ${r.error}`}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '.8125rem', color: '#f87171' }}>
                        {res.errors?.join(' | ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
