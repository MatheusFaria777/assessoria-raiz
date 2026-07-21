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

export default function Dashboard() {
  const [data, setData]             = useState(null)
  const [loading, setLoading]       = useState(true)
  const [balances, setBalances]     = useState(null)
  const [cadencia, setCadencia]     = useState(null)
  const [cadLoading, setCadLoading] = useState(false)
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
  }, [])

  const loadCadencia = useCallback((forceRefresh = false) => {
    if (!isSegunda && !isQuarta) return
    const tab = isSegunda ? 'segunda' : 'quarta'
    if (!forceRefresh) {
      const cached = readCadenciaCache(tab)
      if (cached) { setCadencia(cached); return }
    }
    setCadLoading(true)
    api.get(`/api/cadencia/${tab}`)
      .then(d => { writeCadenciaCache(tab, d); setCadencia(d) })
      .catch(() => toast('Erro ao carregar cadência', 'error'))
      .finally(() => setCadLoading(false))
  }, [isSegunda, isQuarta])

  useEffect(() => {
    loadCadencia(false)
  }, [loadCadencia, today])

  const refreshCadencia = () => {
    const tab = isSegunda ? 'segunda' : 'quarta'
    clearCadenciaCache(tab)
    loadCadencia(true)
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

      {/* Cadência de hoje — segunda e quarta */}
      {(isSegunda || isQuarta) && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.75rem', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
              Cadência — {isSegunda ? 'Segunda-feira' : 'Quarta-feira'}
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
                <CadenciaClientCard key={item.client_id} item={item} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
