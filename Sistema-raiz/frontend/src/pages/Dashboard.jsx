import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'
import { toast } from '../lib/toast'
import { getDayInfo, readCadenciaCache, writeCadenciaCache, clearCadenciaCache } from '../lib/utils'
import CadenciaClientCard from '../components/CadenciaClientCard'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function getUser() {
  try { return JSON.parse(localStorage.getItem('raiz_user')) } catch { return null }
}

function SyncErrorPopup({ client, onClose }) {
  if (!client) return null
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#1a1a1a', border: '1px solid rgba(239,68,68,.3)',
          borderRadius: 10, padding: '1.25rem 1.5rem', maxWidth: 420, width: '90vw',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.75rem' }}>
          <strong style={{ fontSize: '.9375rem' }}>{client.client_name}</strong>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,245,245,.4)', fontSize: '1.1rem', lineHeight: 1 }}>✕</button>
        </div>
        <p style={{ margin: 0, fontSize: '.8125rem', color: 'rgba(245,245,245,.55)', lineHeight: 1.5 }}>
          {client.error ?? 'Erro desconhecido'}
        </p>
        {client.since && (
          <p style={{ margin: '.5rem 0 0', fontSize: '.75rem', color: 'rgba(245,245,245,.3)' }}>
            Período: {client.since}
          </p>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData]             = useState(null)
  const [loading, setLoading]       = useState(true)
  const [balances, setBalances]     = useState(null)
  const [cadencia, setCadencia]     = useState(null)
  const [cadLoading, setCadLoading] = useState(false)
  const [cadPreview, setCadPreview] = useState(null) // null | 'segunda' | 'quarta' — pré-visualização manual fora do dia real
  const [syncData, setSyncData]         = useState(null)
  const [syncOpen, setSyncOpen]         = useState(false)
  const [syncError, setSyncError]       = useState(null)
  const [syncMonthly, setSyncMonthly]   = useState(null)
  const [syncMOpen, setSyncMOpen]       = useState(false)
  const [retrying, setRetrying]         = useState({})   // { [`weekly-${clientId}` | `monthly-${clientId}`]: true }
  const today = new Date().toISOString().slice(0, 10)
  const user = getUser()
  const { isSegunda, isQuarta } = getDayInfo()

  useEffect(() => {
    api.get('/api/dashboard/')
      .then(setData)
      .catch(() => toast('Erro ao carregar dashboard', 'error'))
      .finally(() => setLoading(false))
    api.get('/api/dashboard/budget-alerts')
      .then(r => setBalances(r.balances))
      .catch(() => setBalances([]))
    api.get('/api/dashboard/sync-today')
      .then(setSyncData)
      .catch(() => setSyncData({ synced: 0, errors: 0, clients: [] }))
    api.get('/api/dashboard/sync-monthly')
      .then(setSyncMonthly)
      .catch(() => {})
  }, [])

  const retrySync = async (clientId) => {
    const key = `weekly-${clientId}`
    setRetrying(r => ({ ...r, [key]: true }))
    try {
      const updated = await api.post(`/api/dashboard/sync-run/${clientId}`)
      setSyncData(prev => {
        if (!prev) return prev
        const idx = prev.clients.findIndex(c => c.client_id === clientId)
        const clients = idx >= 0
          ? prev.clients.map((c, i) => i === idx ? { ...c, ...updated } : c)
          : [updated, ...prev.clients]
        const synced = clients.filter(c => c.status === 'success').length
        const errors = clients.filter(c => c.status === 'error').length
        return { ...prev, clients, synced, errors }
      })
      toast(updated.status === 'success' ? 'Planilhado com sucesso!' : updated.status === 'error' ? 'Ainda com erro' : 'Sem dados pra planilhar', updated.status === 'error' ? 'error' : 'success')
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setRetrying(r => ({ ...r, [key]: false }))
    }
  }

  const retrySyncMonthly = async (clientId) => {
    const key = `monthly-${clientId}`
    setRetrying(r => ({ ...r, [key]: true }))
    try {
      const updated = await api.post(`/api/dashboard/sync-monthly-run/${clientId}`)
      setSyncMonthly(prev => {
        if (!prev) return prev
        const idx = prev.clients.findIndex(c => c.client_id === clientId)
        const clients = idx >= 0
          ? prev.clients.map((c, i) => i === idx ? { ...c, ...updated } : c)
          : [updated, ...prev.clients]
        const synced = clients.filter(c => c.status === 'success').length
        const errors = clients.filter(c => c.status === 'error').length
        return { ...prev, clients, synced, errors }
      })
      toast(updated.status === 'success' ? 'Planilhado com sucesso!' : updated.status === 'error' ? 'Ainda com erro' : 'Sem dados pra planilhar', updated.status === 'error' ? 'error' : 'success')
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setRetrying(r => ({ ...r, [key]: false }))
    }
  }

  const activeCadTab = isSegunda ? 'segunda' : isQuarta ? 'quarta' : cadPreview

  const loadCadencia = useCallback((forceRefresh = false) => {
    if (!activeCadTab) return
    const tab = activeCadTab
    if (!forceRefresh) {
      const cached = readCadenciaCache(tab)
      if (cached) { setCadencia(cached); return }
    }
    setCadLoading(true)
    api.get(`/api/cadencia/${tab}`)
      .then(d => { writeCadenciaCache(tab, d); setCadencia(d) })
      .catch(() => toast('Erro ao carregar cadência', 'error'))
      .finally(() => setCadLoading(false))
  }, [activeCadTab])

  useEffect(() => {
    loadCadencia(false)
  }, [loadCadencia, today])

  const refreshCadencia = () => {
    if (!activeCadTab) return
    clearCadenciaCache(activeCadTab)
    loadCadencia(true)
  }

  // Recalcula só um cliente (ex: depois de corrigir a configuração dele) sem
  // esperar/gastar chamada de API nos outros todos de novo.
  const refreshCadenciaOne = async (clientId) => {
    if (!activeCadTab) return
    const fresh = await api.get(`/api/cadencia/${activeCadTab}?client_id=${clientId}`)
    const updated = fresh[0]
    if (!updated) return
    setCadencia(prev => {
      const next = (prev || []).map(i => i.client_id === clientId ? updated : i)
      writeCadenciaCache(activeCadTab, next)
      return next
    })
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <span className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  )

  if (!data) return null

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Saudação */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
          {getGreeting()}, {user?.name ?? 'pessoal'}
        </h1>
        <p style={{ margin: '.375rem 0 0', fontSize: '.9375rem', color: 'rgba(245,245,245,.5)' }}>
          {data.today_name}, {data.today_formatted}
        </p>
      </div>

      {/* Saldos Meta Ads */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.75rem' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Saldos Meta Ads</h2>
          {balances === null && <span className="spinner" style={{ width: 14, height: 14 }} />}
        </div>
        {balances !== null && balances.length === 0 && (
          <div style={{ fontSize: '.8rem', color: 'rgba(245,245,245,.3)' }}>Nenhum cliente Meta com saldo pré-pago configurado.</div>
        )}
        {balances !== null && balances.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '.5rem' }}>
            {balances.map((b, i) => {
              const isError   = b.level === 'error'
              const isWarning = b.level === 'warning'
              return (
                <div key={i} style={{
                  padding: '.625rem .875rem', borderRadius: 8,
                  background: isError ? 'rgba(239,68,68,.08)' : isWarning ? 'rgba(234,179,8,.08)' : 'rgba(245,245,245,.04)',
                  border: `1px solid ${isError ? 'rgba(239,68,68,.25)' : isWarning ? 'rgba(234,179,8,.25)' : 'rgba(245,245,245,.08)'}`,
                  display: 'flex', flexDirection: 'column', gap: '.25rem',
                }}>
                  <span style={{ fontSize: '.75rem', color: 'rgba(245,245,245,.5)', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                    {isError ? '🔴' : isWarning ? '🟡' : '🟢'} {b.client_name}
                    {b.platform === 'google' && <span style={{ opacity: .5 }}>· G</span>}
                  </span>
                  <span style={{
                    fontWeight: 700, fontSize: '.9375rem',
                    color: isError ? '#f87171' : isWarning ? '#fbbf24' : '#F5F5F5',
                  }}>
                    R$ {b.balance.toFixed(2)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Planilhamento automático */}
      {syncData && (syncData.synced > 0 || syncData.errors > 0) && (
        <section style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.75rem', marginBottom: '.625rem' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Planilhamento</h2>
            {syncData.clients.length > 0 && (
              <button
                onClick={() => setSyncOpen(o => !o)}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'rgba(245,245,245,.4)', fontSize: '.8rem', padding: 0,
                }}
              >
                {syncOpen ? 'ocultar' : 'detalhes'}
              </button>
            )}
          </div>
          <div style={{
            padding: '.625rem .875rem', borderRadius: 8,
            background: syncData.errors > 0 ? 'rgba(239,68,68,.05)' : 'rgba(245,245,245,.04)',
            border: `1px solid ${syncData.errors > 0 ? 'rgba(239,68,68,.2)' : 'rgba(245,245,245,.08)'}`,
            display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '.875rem',
          }}>
            <span>🟢 {syncData.synced} planilhado{syncData.synced !== 1 ? 's' : ''}</span>
            {syncData.errors > 0 && (
              <span style={{ color: '#f87171' }}>🔴 {syncData.errors} erro{syncData.errors !== 1 ? 's' : ''}</span>
            )}
            <span style={{ marginLeft: 'auto', fontSize: '.75rem', color: 'rgba(245,245,245,.3)' }}>hoje</span>
          </div>
          {syncOpen && syncData.clients.length > 0 && (
            <div style={{ marginTop: '.5rem', display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
              {syncData.clients.map((c, i) => (
                <div
                  key={i}
                  onClick={() => c.status === 'error' && setSyncError(c)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '.5rem',
                    padding: '.375rem .625rem', borderRadius: 6,
                    fontSize: '.8125rem', cursor: c.status === 'error' ? 'pointer' : 'default',
                    background: c.status === 'error' ? 'rgba(239,68,68,.06)' : 'transparent',
                  }}
                >
                  <span>{c.status === 'success' ? '✓' : c.status === 'error' ? '✕' : '—'}</span>
                  <span style={{ flex: 1, color: c.status === 'error' ? '#f87171' : 'rgba(245,245,245,.7)' }}>
                    {c.client_name}
                  </span>
                  {c.rows_synced > 0 && (
                    <span style={{ fontSize: '.75rem', color: 'rgba(245,245,245,.3)' }}>{c.rows_synced} aba{c.rows_synced !== 1 ? 's' : ''}</span>
                  )}
                  {c.status === 'error' && (
                    <>
                      <span style={{ fontSize: '.7rem', color: 'rgba(239,68,68,.6)' }}>ver erro</span>
                      <button
                        onClick={e => { e.stopPropagation(); retrySync(c.client_id) }}
                        disabled={retrying[`weekly-${c.client_id}`]}
                        title="Tentar de novo"
                        style={{
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          color: 'rgba(245,245,245,.5)', fontSize: '.85rem', padding: '.15rem .3rem', lineHeight: 1,
                        }}
                      >
                        {retrying[`weekly-${c.client_id}`] ? <span className="spinner" style={{ width: 12, height: 12 }} /> : '↻'}
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Planilhamento mensal */}
      {syncMonthly && (syncMonthly.synced > 0 || syncMonthly.errors > 0) && (
        <section style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.75rem', marginBottom: '.625rem' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
              Planilhamento mensal
              {syncMonthly.period && (
                <span style={{ marginLeft: '.5rem', fontWeight: 400, fontSize: '.8125rem', color: 'rgba(245,245,245,.4)' }}>
                  {syncMonthly.period}
                </span>
              )}
            </h2>
            {syncMonthly.clients.length > 0 && (
              <button
                onClick={() => setSyncMOpen(o => !o)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(245,245,245,.4)', fontSize: '.8rem', padding: 0 }}
              >
                {syncMOpen ? 'ocultar' : 'detalhes'}
              </button>
            )}
          </div>
          <div style={{
            padding: '.625rem .875rem', borderRadius: 8,
            background: syncMonthly.errors > 0 ? 'rgba(239,68,68,.05)' : 'rgba(245,245,245,.04)',
            border: `1px solid ${syncMonthly.errors > 0 ? 'rgba(239,68,68,.2)' : 'rgba(245,245,245,.08)'}`,
            display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '.875rem',
          }}>
            <span>🟢 {syncMonthly.synced} planilhado{syncMonthly.synced !== 1 ? 's' : ''}</span>
            {syncMonthly.errors > 0 && (
              <span style={{ color: '#f87171' }}>🔴 {syncMonthly.errors} erro{syncMonthly.errors !== 1 ? 's' : ''}</span>
            )}
            <span style={{ marginLeft: 'auto', fontSize: '.75rem', color: 'rgba(245,245,245,.3)' }}>mês anterior</span>
          </div>
          {syncMOpen && syncMonthly.clients.length > 0 && (
            <div style={{ marginTop: '.5rem', display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
              {syncMonthly.clients.map((c, i) => (
                <div
                  key={i}
                  onClick={() => c.status === 'error' && setSyncError(c)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '.5rem',
                    padding: '.375rem .625rem', borderRadius: 6, fontSize: '.8125rem',
                    cursor: c.status === 'error' ? 'pointer' : 'default',
                    background: c.status === 'error' ? 'rgba(239,68,68,.06)' : 'transparent',
                  }}
                >
                  <span>{c.status === 'success' ? '✓' : c.status === 'error' ? '✕' : '—'}</span>
                  <span style={{ flex: 1, color: c.status === 'error' ? '#f87171' : 'rgba(245,245,245,.7)' }}>
                    {c.client_name}
                  </span>
                  {c.status === 'error' && (
                    <>
                      <span style={{ fontSize: '.7rem', color: 'rgba(239,68,68,.6)' }}>ver erro</span>
                      <button
                        onClick={e => { e.stopPropagation(); retrySyncMonthly(c.client_id) }}
                        disabled={retrying[`monthly-${c.client_id}`]}
                        title="Tentar de novo"
                        style={{
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          color: 'rgba(245,245,245,.5)', fontSize: '.85rem', padding: '.15rem .3rem', lineHeight: 1,
                        }}
                      >
                        {retrying[`monthly-${c.client_id}`] ? <span className="spinner" style={{ width: 12, height: 12 }} /> : '↻'}
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <SyncErrorPopup client={syncError} onClose={() => setSyncError(null)} />

      {/* Cadência de hoje — segunda e quarta (ou pré-visualização manual em outros dias) */}
      {!isSegunda && !isQuarta && (
        <section style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.5rem' }}>
          <span style={{ fontSize: '.8rem', color: 'rgba(245,245,245,.4)' }}>
            Cadência só roda automaticamente seg/qua. Pré-visualizar:
          </span>
          <button
            onClick={() => setCadPreview(p => p === 'segunda' ? null : 'segunda')}
            className={cadPreview === 'segunda' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '.3rem .75rem', fontSize: '.8rem' }}
          >
            Segunda
          </button>
          <button
            onClick={() => setCadPreview(p => p === 'quarta' ? null : 'quarta')}
            className={cadPreview === 'quarta' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '.3rem .75rem', fontSize: '.8rem' }}
          >
            Quarta
          </button>
        </section>
      )}

      {activeCadTab && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.75rem', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
              Cadência — {activeCadTab === 'segunda' ? 'Segunda-feira' : 'Quarta-feira'}
              {cadPreview && !isSegunda && !isQuarta && (
                <span style={{ fontSize: '.75rem', fontWeight: 400, color: 'rgba(245,245,245,.35)', marginLeft: '.5rem' }}>
                  (pré-visualização)
                </span>
              )}
            </h2>
            <button
              onClick={refreshCadencia}
              disabled={cadLoading}
              style={{
                background: 'transparent', border: '1px solid rgba(245,245,245,.15)',
                borderRadius: 6, padding: '.3rem .75rem',
                color: 'rgba(245,245,245,.55)', cursor: cadLoading ? 'default' : 'pointer',
                fontSize: '.8rem', display: 'flex', alignItems: 'center', gap: '.375rem',
              }}
            >
              {cadLoading ? <span className="spinner" style={{ width: 12, height: 12 }} /> : '↻'} Atualizar
            </button>
          </div>

          {cadLoading && !cadencia && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  height: 64, borderRadius: 8,
                  background: 'rgba(245,245,245,.04)', border: '1px solid rgba(245,245,245,.08)',
                }} />
              ))}
            </div>
          )}

          {cadencia && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
              {cadencia.map(item => (
                <CadenciaClientCard key={item.client_id} item={item} onRefresh={refreshCadenciaOne} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
