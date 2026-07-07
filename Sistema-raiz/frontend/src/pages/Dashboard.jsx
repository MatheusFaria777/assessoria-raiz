import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { toast } from '../lib/toast'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function getUser() {
  try { return JSON.parse(localStorage.getItem('raiz_user')) } catch { return null }
}

function getDayInfo() {
  const d = new Date().getDay()
  return { isSegunda: d === 1, isQuarta: d === 3 }
}

function PlanilhamentoCard({ item, onDismiss }) {
  const { already_generated, already_synced } = item

  let status, color, bg, border, icon
  if (!already_generated) {
    status = 'Aguardando'; color = 'rgba(245,245,245,.45)'; icon = '⏳'
    bg = 'rgba(245,245,245,.03)'; border = 'rgba(245,245,245,.08)'
  } else if (already_synced) {
    status = 'Planilhado'; color = '#4ade80'; icon = '✓'
    bg = 'rgba(74,222,128,.05)'; border = 'rgba(74,222,128,.18)'
  } else {
    status = 'Falhou'; color = '#f87171'; icon = '✗'
    bg = 'rgba(239,68,68,.06)'; border = 'rgba(239,68,68,.2)'
  }

  return (
    <div style={{
      padding: '.625rem .875rem', borderRadius: 8,
      display: 'flex', alignItems: 'center', gap: '.75rem',
      background: bg, border: `1px solid ${border}`,
    }}>
      <span style={{ fontSize: 14, color, minWidth: 16, textAlign: 'center' }}>{icon}</span>
      <span style={{ flex: 1, fontSize: '.875rem', fontWeight: 500 }}>{item.name}</span>
      <span style={{ fontSize: '.75rem', color }}>{status}</span>
      {already_synced && (
        <button onClick={() => onDismiss(item.id)} title="Dispensar"
          style={{ background: 'transparent', border: 'none', color: 'rgba(245,245,245,.3)',
            cursor: 'pointer', fontSize: '1rem', padding: '.25rem', lineHeight: 1 }}>
          ✕
        </button>
      )}
    </div>
  )
}

function CadenciaCard({ item }) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  if (!item.ok) return (
    <div style={{
      padding: '.625rem .875rem', borderRadius: 8,
      background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.2)',
      fontSize: '.8rem', color: '#f87171',
    }}>
      <strong>{item.name}</strong> — {item.error}
    </div>
  )

  const copy = () => {
    navigator.clipboard.writeText(item.message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast(`Copiado — ${item.name}`)
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '.625rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          background: 'rgba(203,161,53,.15)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#CBA135',
        }}>
          {item.name.charAt(0)}
        </div>
        <span style={{ flex: 1, fontWeight: 600, fontSize: '.9rem' }}>{item.name}</span>
        <button onClick={() => setExpanded(e => !e)}
          style={{ background: 'transparent', border: 'none', color: 'rgba(245,245,245,.4)',
            cursor: 'pointer', fontSize: '.75rem', padding: '.25rem .5rem' }}>
          {expanded ? 'Fechar' : 'Ver'}
        </button>
        <button className="btn-primary" onClick={copy}
          style={{ fontSize: '.8rem', padding: '.35rem .875rem' }}>
          {copied ? '✓ Copiado' : '📋 Copiar'}
        </button>
      </div>

      {expanded && (
        <pre style={{
          whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '.75rem',
          lineHeight: 1.65, color: 'rgba(245,245,245,.75)',
          background: 'rgba(245,245,245,.03)', padding: '.75rem', borderRadius: 6,
          margin: 0, maxHeight: 260, overflowY: 'auto',
          border: '1px solid rgba(245,245,245,.07)',
        }}>
          {item.message}
        </pre>
      )}
    </div>
  )
}

export default function Dashboard() {
  const [data, setData]             = useState(null)
  const [loading, setLoading]       = useState(true)
  const [balances, setBalances]     = useState(null)
  const [cadencia, setCadencia]     = useState(null)
  const [cadLoading, setCadLoading] = useState(false)
  const today = new Date().toISOString().slice(0, 10)
  const [dismissed, setDismissed]   = useState(() => {
    try { return JSON.parse(localStorage.getItem(`plan_ok_${today}`) || '[]') } catch { return [] }
  })
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

  useEffect(() => {
    if (!isSegunda && !isQuarta) return
    setCadLoading(true)
    const endpoint = isSegunda ? '/api/cadencia/segunda' : '/api/cadencia/quarta'
    api.get(endpoint)
      .then(setCadencia)
      .catch(() => toast('Erro ao carregar cadência', 'error'))
      .finally(() => setCadLoading(false))
  }, [isSegunda, isQuarta])

  const dismiss = (clientId) => {
    const next = [...dismissed, clientId]
    setDismissed(next)
    try { localStorage.setItem(`plan_ok_${today}`, JSON.stringify(next)) } catch {}
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <span className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  )

  if (!data) return null

  const planItems = (data.scheduled_today || []).filter(c => c.has_sheets)
  const visiblePlanItems = planItems.filter(c => !dismissed.includes(c.id))
  const allDismissed = planItems.length > 0 && visiblePlanItems.length === 0

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Saudação */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
          {getGreeting()}, {user?.name ?? 'pessoal'} 👋
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
          <div style={{ fontSize: '.8rem', color: 'rgba(245,245,245,.3)' }}>Nenhum cliente Meta configurado.</div>
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

      {/* Planilhamento de hoje */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 .75rem', fontSize: '1rem', fontWeight: 600 }}>Planilhamento de hoje</h2>
        {planItems.length === 0 ? (
          <div style={{ fontSize: '.8rem', color: 'rgba(245,245,245,.3)' }}>
            Nenhum planilhamento agendado para hoje.
          </div>
        ) : allDismissed ? (
          <div style={{ padding: '1rem', background: 'rgba(74,222,128,.06)', borderRadius: 10,
            textAlign: 'center', color: '#4ade80', fontSize: '.875rem', border: '1px solid rgba(74,222,128,.2)' }}>
            ✅ Tudo planilhado com sucesso.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            {visiblePlanItems.map(item => (
              <PlanilhamentoCard key={item.id} item={item} onDismiss={dismiss} />
            ))}
          </div>
        )}
      </section>

      {/* Cadência de hoje — só aparece em segunda e quarta */}
      {(isSegunda || isQuarta) && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
              Cadência de hoje — {isSegunda ? 'Segunda' : 'Quarta'}
            </h2>
            {cadLoading && <span className="spinner" style={{ width: 14, height: 14 }} />}
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
                <CadenciaCard key={item.client_id} item={item} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
