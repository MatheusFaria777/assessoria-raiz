import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { toast } from '../lib/toast'

function dateRange(type) {
  const today = new Date()
  const fmt = d => d.toISOString().split('T')[0]
  if (type === 'week') {
    const day = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1) - 7)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return { since: fmt(monday), until: fmt(sunday) }
  }
  const first = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const last  = new Date(today.getFullYear(), today.getMonth(), 0)
  return { since: fmt(first), until: fmt(last) }
}

export default function Reports() {
  const [clients, setClients]         = useState([])
  const [clientId, setClientId]       = useState('')
  const [periodType, setPeriodType]   = useState('week')
  const [since, setSince]             = useState('')
  const [until, setUntil]             = useState('')
  const [includePrev, setIncludePrev] = useState(true)
  const [summary, setSummary]         = useState('')
  const [loading, setLoading]         = useState(false)
  const [result, setResult]           = useState(null)
  const [history, setHistory]         = useState([])
  const [histClient, setHistClient]   = useState('')
  const [histLoading, setHistLoading] = useState(false)
  const [pending, setPending]         = useState([])
  const [selectedPending, setSelectedPending] = useState(null)
  const [runningScheduler, setRunningScheduler] = useState(false)

  const loadPending = () => api.get('/api/reports/pending').then(setPending).catch(() => {})

  useEffect(() => {
    api.get('/api/clients/').then(setClients).catch(() => {})
    loadPending()
  }, [])

  useEffect(() => {
    const r = dateRange(periodType)
    setSince(r.since); setUntil(r.until)
  }, [periodType])

  const generate = async () => {
    if (!clientId) { toast('Selecione um cliente', 'error'); return }
    if (!since || !until) { toast('Defina o período', 'error'); return }
    setLoading(true); setResult(null)
    try {
      const data = await api.post('/api/reports/generate', {
        client_id: parseInt(clientId), since, until,
        period_type: periodType, include_previous: includePrev, summary_text: summary,
      })
      setResult(data)
      toast('Relatório gerado!')
    } catch (e) { toast(e.message, 'error') }
    finally { setLoading(false) }
  }

  const loadHistory = async (cid) => {
    setHistClient(cid)
    if (!cid) { setHistory([]); return }
    setHistLoading(true)
    try { setHistory(await api.get(`/api/reports/history/${cid}`)) }
    catch (e) { toast('Erro ao carregar histórico', 'error') }
    finally { setHistLoading(false) }
  }

  const restoreReport = async (cid, rid) => {
    try {
      const r = await api.get(`/api/reports/history/${cid}/${rid}`)
      setResult({ content: r.content, platform: r.platform, total_spend: 0, tipos: {} })
    } catch (e) { toast('Erro ao carregar relatório', 'error') }
  }

  const deleteReport = async (rid) => {
    if (!confirm('Remover este relatório do histórico?')) return
    try { await api.delete(`/api/reports/history/${rid}`); toast('Removido'); loadHistory(histClient) }
    catch (e) { toast(e.message, 'error') }
  }

  const copyReport = () => {
    navigator.clipboard.writeText(result.content)
    toast('Copiado para a área de transferência!')
  }

  const markSent = async (id) => {
    await api.post(`/api/reports/pending/${id}/mark-sent`)
    toast('Marcado como enviado')
    loadPending()
    if (selectedPending?.id === id) setSelectedPending(null)
  }

  const runScheduler = async () => {
    setRunningScheduler(true)
    try {
      await api.post('/api/reports/run-scheduler')
      toast('Relatórios agendados gerados!')
      loadPending()
    } catch (e) { toast(e.message, 'error') }
    finally { setRunningScheduler(false) }
  }

  return (
    <div>

      {/* ── Seção de pendentes ── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem' }}>
            <span style={{ fontSize: 18 }}>⏳</span>
            <span style={{ fontWeight: 600 }}>Aguardando revisão</span>
            {pending.length > 0 && (
              <span style={{ background: '#CBA135', color: '#1a1a1a', fontSize: '.7rem', fontWeight: 700, padding: '.1rem .5rem', borderRadius: 999 }}>
                {pending.length}
              </span>
            )}
          </div>
          <button className="btn-ghost" onClick={runScheduler} disabled={runningScheduler} style={{ fontSize: '.8rem' }}>
            {runningScheduler
              ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Gerando...</>
              : '▶ Executar agora'}
          </button>
        </div>

        {pending.length === 0 ? (
          <p style={{ fontSize: '.8rem', color: 'rgba(245,245,245,.35)', padding: '.25rem 0' }}>
            Nenhum relatório aguardando. Clique em "Executar agora" para gerar os relatórios dos clientes com dia configurado para hoje.
          </p>
        ) : (
          <>
            {pending.map(r => (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'center', gap: '.75rem',
                padding: '.75rem 1rem', borderRadius: 8, marginBottom: '.5rem',
                background: 'rgba(203,161,53,.08)', border: '1px solid rgba(203,161,53,.25)',
                cursor: 'pointer',
              }} onClick={() => setSelectedPending(selectedPending?.id === r.id ? null : r)}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, fontSize: '.875rem' }}>{r.client_name}</span>
                  <span style={{ fontSize: '.75rem', color: 'rgba(245,245,245,.5)', marginLeft: '.5rem' }}>
                    {r.period_start} → {r.period_end}
                  </span>
                </div>
                <button className="btn-primary" style={{ fontSize: '.75rem', padding: '.3rem .75rem' }}
                  onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(r.content); toast('Copiado!') }}>
                  Copiar
                </button>
                <button className="btn-secondary" style={{ fontSize: '.75rem', padding: '.3rem .75rem' }}
                  onClick={e => { e.stopPropagation(); markSent(r.id) }}>
                  ✓ Enviado
                </button>
              </div>
            ))}
            {selectedPending && (
              <div className="card" style={{ marginTop: '.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.75rem' }}>
                  <span style={{ fontWeight: 600 }}>{selectedPending.client_name}</span>
                  <button className="btn-ghost" onClick={() => setSelectedPending(null)}>✕</button>
                </div>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '.875rem', lineHeight: 1.7, color: '#F5F5F5', background: 'rgba(245,245,245,.04)', padding: '1rem', borderRadius: 8, margin: 0, maxHeight: 300, overflowY: 'auto' }}>
                  {selectedPending.content}
                </pre>
              </div>
            )}
          </>
        )}
        <hr className="divider" style={{ marginTop: '1rem' }} />
      </div>

      {/* ── Gerar relatório manualmente ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>

        {/* Painel esquerdo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600 }}>Gerar Relatório</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
              <div className="field">
                <label className="label">Cliente</label>
                <select className="input" value={clientId} onChange={e => setClientId(e.target.value)}>
                  <option value="">Selecione...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label">Tipo de período</label>
                <div style={{ display: 'flex', gap: '.5rem' }}>
                  {[['week', 'Semanal'], ['month', 'Mensal']].map(([v, l]) => (
                    <button key={v} type="button" onClick={() => setPeriodType(v)} style={{
                      flex: 1, padding: '.5rem', borderRadius: 6, border: '1px solid', cursor: 'pointer',
                      fontSize: '.8rem', transition: 'all .15s',
                      background: periodType === v ? 'rgba(203,161,53,.2)' : 'transparent',
                      borderColor: periodType === v ? '#CBA135' : 'rgba(245,245,245,.15)',
                      color: periodType === v ? '#CBA135' : 'rgba(245,245,245,.5)',
                    }}>{l}</button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label className="label">De</label>
                <input className="input" type="date" value={since} onChange={e => setSince(e.target.value)} />
              </div>
              <div className="field">
                <label className="label">Até</label>
                <input className="input" type="date" value={until} onChange={e => setUntil(e.target.value)} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', fontSize: '.875rem' }}>
                <input type="checkbox" checked={includePrev} onChange={e => setIncludePrev(e.target.checked)}
                  style={{ accentColor: '#CBA135', width: 15, height: 15 }} />
                <span style={{ color: 'rgba(245,245,245,.6)' }}>Incluir período anterior</span>
              </label>
              <div className="field">
                <label className="label">Resumo (opcional)</label>
                <textarea className="input" rows={3} value={summary} onChange={e => setSummary(e.target.value)}
                  placeholder="Observações sobre o período..." style={{ resize: 'vertical' }} />
              </div>
              <button className="btn-primary" onClick={generate} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? <><span className="spinner" /> Gerando...</> : '📊 Gerar Relatório'}
              </button>
            </div>
          </div>

          {/* Histórico */}
          <div className="card">
            <h3 style={{ margin: '0 0 .75rem', fontSize: '.9375rem', fontWeight: 600 }}>Histórico</h3>
            <select className="input" value={histClient} onChange={e => loadHistory(e.target.value)} style={{ marginBottom: '.75rem' }}>
              <option value="">Selecione um cliente...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {histLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}><span className="spinner" /></div>
            ) : history.length === 0 ? (
              <p style={{ fontSize: '.8rem', color: 'rgba(245,245,245,.35)', textAlign: 'center', padding: '.5rem' }}>
                {histClient ? 'Nenhum relatório gerado' : 'Selecione um cliente'}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.375rem' }}>
                {history.map(r => (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.5rem .625rem', borderRadius: 6, background: 'rgba(245,245,245,.04)', fontSize: '.8rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#F5F5F5', fontWeight: 500 }}>{r.type === 'month' ? 'Mensal' : 'Semanal'} · {r.platform}</div>
                      <div style={{ color: 'rgba(245,245,245,.4)', fontSize: '.7rem' }}>{r.period_start} → {r.period_end}</div>
                    </div>
                    <button className="btn-ghost" style={{ fontSize: '.7rem', padding: '.25rem .5rem' }}
                      onClick={() => restoreReport(histClient, r.id)}>Ver</button>
                    <button onClick={() => deleteReport(r.id)}
                      style={{ background: 'none', border: 'none', color: 'rgba(248,113,113,.6)', cursor: 'pointer', fontSize: 14 }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Painel direito — resultado */}
        <div className="card" style={{ minHeight: 400 }}>
          {!result ? (
            <div className="empty-state" style={{ height: '100%', justifyContent: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: '1rem' }}>📊</div>
              <p style={{ fontWeight: 500, color: 'rgba(245,245,245,.4)' }}>Selecione um cliente e clique em Gerar Relatório</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                  <span className={`badge badge-${result.platform === 'meta' ? 'meta' : 'google'}`}>{result.platform}</span>
                  {result.total_spend > 0 && (
                    <span style={{ fontSize: '.8rem', color: 'rgba(245,245,245,.5)' }}>
                      R$ {result.total_spend.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </div>
                <button className="btn-primary" onClick={copyReport}>📋 Copiar</button>
              </div>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit', fontSize: '.875rem', lineHeight: 1.7, color: '#F5F5F5', background: 'rgba(245,245,245,.04)', padding: '1rem', borderRadius: 8, margin: 0, maxHeight: 600, overflowY: 'auto' }}>
                {result.content}
              </pre>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
