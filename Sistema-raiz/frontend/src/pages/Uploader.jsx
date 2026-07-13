import { useState, useEffect, useRef } from 'react'
import { api } from '../lib/api'
import { toast } from '../lib/toast'
import { useClients } from '../contexts/ClientsContext'

const STATUS_LABELS = {
  pending:    { label: 'Pendente',     color: '#CBA135' },
  processing: { label: 'Processando',  color: '#60a5fa' },
  done:       { label: 'Concluído',    color: '#4ade80' },
  error:      { label: 'Erro',         color: '#f87171' },
  ratelimit:  { label: 'Retry automático', color: '#fb923c' },
}

const ERROR_PATTERNS = [
  {
    match: /does not exist|cannot be loaded due to missing permissions/i,
    friendly: 'Sem permissão para essa conta de anúncios. O token de acesso não tem acesso a essa conta.',
    hint: 'Configure o token individual do cliente em Clientes → aba Meta Ads.',
  },
  {
    match: /maximum number of ads|too many ads|50 ad|limit.*ad set|ad set.*limit/i,
    friendly: 'Limite de anúncios atingido nesse conjunto (máximo 50 anúncios ativos).',
    hint: 'Pause ou remova anúncios antigos no Meta Ads Manager antes de subir novos, ou configure um adset diferente.',
  },
  {
    match: /Session has expired|access token.*expired/i,
    friendly: 'Token de acesso expirado.',
    hint: 'Vá em Configurações → Meta Ads e converta o token para 60 dias.',
  },
  {
    match: /Invalid OAuth/i,
    friendly: 'Token de acesso inválido.',
    hint: 'Gere um novo token em Configurações → Meta Ads.',
  },
  {
    match: /caption.*missing|caption.*required/i,
    friendly: 'Post do Instagram sem descrição — não foi possível gerar o copy.',
    hint: 'Use um post que tenha legenda escrita.',
  },
  {
    match: /Post nao encontrado|Post não encontrado|perfil privado/i,
    friendly: 'Post não encontrado ou perfil privado.',
    hint: 'Verifique se o perfil do Instagram é público e a URL está correta.',
  },
  {
    match: /rate.?limit|code.*17|user request limit|request limit reached|too many calls|Rate limit Meta/i,
    friendly: 'Limite de requisições atingido (rate limit do Meta).',
    hint: 'O sistema vai tentar de novo automaticamente. Não precisa fazer nada — a página atualiza sozinha.',
  },
  {
    match: /Nenhuma imagem/i,
    friendly: 'Nenhuma imagem encontrada no post.',
    hint: 'O post pode ser só vídeo ou não ter imagens acessíveis.',
  },
]

function ErrorMessage({ error }) {
  const [expanded, setExpanded] = useState(false)
  const pattern = ERROR_PATTERNS.find(p => p.match.test(error))

  return (
    <div style={{ marginTop: '.375rem' }}>
      <div style={{ fontSize: '.8rem', color: '#f87171', fontWeight: 500 }}>
        ✗ {pattern ? pattern.friendly : 'Erro ao processar o anúncio.'}
      </div>
      {pattern?.hint && (
        <div style={{ fontSize: '.75rem', color: 'rgba(248,113,113,.7)', marginTop: '.125rem' }}>
          💡 {pattern.hint}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginTop: '.375rem' }}>
        <button
          className="btn-ghost"
          style={{ fontSize: '.7rem', padding: '.15rem .5rem', color: 'rgba(245,245,245,.4)' }}
          onClick={() => setExpanded(e => !e)}
        >
          {expanded ? 'Ocultar' : 'Ver erro técnico'}
        </button>
        <button
          className="btn-ghost"
          style={{ fontSize: '.7rem', padding: '.15rem .5rem', color: 'rgba(245,245,245,.4)' }}
          onClick={() => {
            navigator.clipboard.writeText(error)
            alert('Erro copiado!')
          }}
        >
          📋 Copiar erro
        </button>
      </div>
      {expanded && (
        <pre style={{
          marginTop: '.375rem', padding: '.5rem .75rem', borderRadius: 6,
          background: 'rgba(248,113,113,.08)', border: '1px solid rgba(248,113,113,.2)',
          fontSize: '.7rem', color: 'rgba(248,113,113,.8)',
          whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: 120, overflowY: 'auto',
        }}>
          {error}
        </pre>
      )}
    </div>
  )
}

function RateLimitBadge({ error }) {
  const match = error?.match(/aguardando (\d+) min/)
  const mins = match ? match[1] : null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginTop: '.375rem' }}>
      <span style={{ fontSize: '.75rem', color: '#fb923c' }}>
        ⏳ {mins ? `Retry automático em ~${mins} min` : 'Retry automático em andamento...'}
      </span>
      <span style={{ fontSize: '.7rem', color: 'rgba(245,245,245,.35)' }}>
        (a página atualiza sozinha)
      </span>
    </div>
  )
}

function isRateLimitPending(item) {
  return item.status === 'pending' && item.error_message?.includes('Rate limit')
}

function QueueItem({ item, clientName, clientQueue, onRetry, onCancel, onReset, onDelete }) {
  const rl = isRateLimitPending(item)
  const statusKey = rl ? 'ratelimit' : item.status
  const s = STATUS_LABELS[statusKey] || STATUS_LABELS.pending
  const copy = item.ai_copy ? JSON.parse(item.ai_copy) : null

  return (
    <div className="card" style={{ padding: '.875rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '.75rem' }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0, marginTop: 5 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: '.875rem' }}>
              {copy?.nome_anuncio || item.instagram_url.split('/').filter(Boolean).pop()}
            </span>
            <span style={{ fontSize: '.7rem', fontWeight: 600, color: s.color, padding: '.1rem .4rem', borderRadius: 4, background: `${s.color}18` }}>
              {s.label}
            </span>
            <span style={{ fontSize: '.75rem', color: 'rgba(245,245,245,.4)' }}>{item.adset_label}</span>
          </div>
          <div style={{ fontSize: '.75rem', color: 'rgba(245,245,245,.4)', marginTop: '.25rem', wordBreak: 'break-all' }}>
            {item.instagram_url}
          </div>
          {item.status === 'done' && item.meta_ad_id && (
            <div style={{ marginTop: '.375rem', display: 'flex', alignItems: 'center', gap: '.625rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '.75rem', color: '#4ade80' }}>✓ {item.meta_ad_id}</span>
              <button
                className="btn-ghost"
                style={{ fontSize: '.7rem', padding: '.2rem .5rem', color: '#CBA135' }}
                onClick={() => {
                  const done = (clientQueue || [item]).filter(i => i.status === 'done' && i.meta_ad_id)
                  const blocks = done.map(i => {
                    const c = i.ai_copy ? JSON.parse(i.ai_copy) : null
                    const nome = c?.nome_anuncio?.toUpperCase() || i.meta_ad_id
                    const linha3 = clientName ? `Já está rodando nas campanhas da ${clientName}.` : ''
                    return [`✅ Anúncio novo no ar!`, nome, linha3].filter(Boolean).join('\n')
                  })
                  navigator.clipboard.writeText(blocks.join('\n\n')).then(() => toast('Notificação copiada!')).catch(() => toast('Erro ao copiar', 'error'))
                }}
              >
                📋 Copiar notificação
              </button>
            </div>
          )}
          {rl && <RateLimitBadge error={item.error_message} />}
          {!rl && item.error_message && (item.status === 'error' || item.status === 'pending') && (
            <ErrorMessage error={item.error_message} />
          )}
          {item.status === 'processing' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginTop: '.375rem' }}>
              <span className="spinner" style={{ width: 14, height: 14 }} />
              <span style={{ fontSize: '.75rem', color: '#60a5fa' }}>Baixando imagens → gerando copy → subindo no Meta...</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '.375rem', flexShrink: 0 }}>
          {item.status === 'error' && (
            <button className="btn-secondary" style={{ fontSize: '.7rem', padding: '.25rem .625rem' }} onClick={() => onRetry(item.id)}>
              Retry
            </button>
          )}
          {item.status === 'processing' && (
            <button className="btn-ghost" style={{ fontSize: '.7rem', padding: '.25rem .625rem', color: '#60a5fa', border: '1px solid rgba(96,165,250,.3)' }}
              onClick={() => onReset(item.id)}
              title="Use se o item estiver travado há mais de 5 minutos">
              Reiniciar
            </button>
          )}
          {rl && (
            <button className="btn-ghost" style={{ fontSize: '.7rem', padding: '.25rem .625rem', color: '#fb923c', border: '1px solid rgba(251,146,60,.3)' }}
              onClick={() => onCancel(item.id)}>
              Cancelar
            </button>
          )}
          <button className="btn-ghost" style={{ fontSize: '.7rem', padding: '.25rem .5rem', color: 'rgba(248,113,113,.6)' }}
            onClick={() => onDelete(item.id)}>✕</button>
        </div>
      </div>
    </div>
  )
}

export default function Uploader() {
  const { clients: allClients } = useClients()
  const clients = allClients.filter(c => c.has_meta)
  const [clientId, setClientId] = useState('')
  const [adsets, setAdsets]     = useState([])
  const [adsetId, setAdsetId]   = useState('')
  const [url, setUrl]           = useState('')
  const [adding, setAdding]     = useState(false)
  const [queue, setQueue]       = useState([])
  const timerRef = useRef(null)

  const isProcessing = queue.some(i => i.status === 'processing')
  const pending      = queue.filter(i => i.status === 'pending' && !isRateLimitPending(i)).length

  const loadQueue = async () => {
    try {
      const q = await api.get('/api/uploader/queue')
      setQueue(q)
      return q
    } catch {
      return null
    }
  }

  // Adaptive poller: 4s when active, 20s when idle — starts on mount, no manual refresh needed
  useEffect(() => {
    let cancelled = false

    const poll = async () => {
      if (cancelled) return
      const q = await loadQueue()
      if (cancelled) return
      const hasActive = q?.some(i => i.status === 'processing' || i.status === 'pending')
      timerRef.current = setTimeout(poll, hasActive ? 4000 : 20000)
    }

    poll()
    return () => {
      cancelled = true
      clearTimeout(timerRef.current)
    }
  }, [])


  useEffect(() => {
    if (!clientId) { setAdsets([]); setAdsetId(''); return }
    const client = clients.find(c => String(c.id) === String(clientId))
    setAdsets(client?.adsets || [])
    setAdsetId('')
  }, [clientId, clients])

  const addToQueue = async () => {
    if (!clientId || !adsetId || !url.trim()) {
      toast('Preencha cliente, adset e URL', 'error'); return
    }
    setAdding(true)
    try {
      await api.post('/api/uploader/queue', {
        client_id: parseInt(clientId), adset_id: parseInt(adsetId), instagram_url: url.trim(),
      })
      setUrl('')
      toast('Adicionado à fila')
      loadQueue()
    } catch (e) { toast(e.message, 'error') }
    finally { setAdding(false) }
  }

  const processAll = async () => {
    try {
      const r = await api.post('/api/uploader/process-all')
      if (!r.started?.length) {
        toast('Fila vazia — nada a processar')
        return
      }
      loadQueue()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  const retry = async (id) => {
    await api.post(`/api/uploader/queue/${id}/retry`)
    loadQueue()
  }

  const cancel = async (id) => {
    await api.post(`/api/uploader/queue/${id}/cancel`)
    loadQueue()
  }

  const reset = async (id) => {
    await api.post(`/api/uploader/queue/${id}/reset`)
    loadQueue()
  }

  const del = async (id) => {
    await api.delete(`/api/uploader/queue/${id}`)
    loadQueue()
  }

  const delAllDone = async (items) => {
    const done = items.filter(i => i.status === 'done')
    await Promise.all(done.map(i => api.delete(`/api/uploader/queue/${i.id}`)))
    loadQueue()
  }

  // Agrupa fila por cliente
  const queueByClient = queue.reduce((acc, item) => {
    const key = item.client_name || 'Sem cliente'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Uploader de Anúncios</h2>
          <p style={{ margin: '.25rem 0 0', fontSize: '.875rem', color: 'rgba(245,245,245,.45)' }}>
            Cole a URL de um post do Instagram — o sistema baixa as imagens, gera o copy e sobe no Meta.
          </p>
        </div>
        {pending > 0 && (
          <button className="btn-primary" onClick={processAll} disabled={isProcessing}>
            {isProcessing ? <><span className="spinner" /> Processando...</> : `▶ Processar tudo (${pending})`}
          </button>
        )}
      </div>

      {/* Formulário */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="field" style={{ minWidth: 180, flex: 1 }}>
            <label className="label">Cliente</label>
            <select className="input" value={clientId} onChange={e => setClientId(e.target.value)}>
              <option value="">Selecione...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field" style={{ minWidth: 160, flex: 1 }}>
            <label className="label">Adset</label>
            <select className="input" value={adsetId} onChange={e => setAdsetId(e.target.value)} disabled={!clientId}>
              <option value="">Selecione...</option>
              {adsets.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
          </div>
          <div className="field" style={{ flex: 3, minWidth: 260 }}>
            <label className="label">URL do post do Instagram</label>
            <input className="input" value={url} onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addToQueue()}
              placeholder="https://www.instagram.com/p/..." />
          </div>
          <button className="btn-primary" onClick={addToQueue} disabled={adding || !clientId || !adsetId}>
            {adding ? <span className="spinner" /> : '+ Adicionar'}
          </button>
        </div>

        {adsetId && (() => {
          const ads = adsets.find(a => String(a.id) === String(adsetId))
          if (!ads) return null
          return ads?.page_id ? (
            <p style={{ margin: '.625rem 0 0', fontSize: '.75rem', color: 'rgba(245,245,245,.4)' }}>
              ✓ Adset configurado — anúncio criado do zero com imagens e copy gerado por IA
            </p>
          ) : (
            <p style={{ margin: '.625rem 0 0', fontSize: '.75rem', color: '#CBA135' }}>
              ⚠ Adset sem Page ID — configure em Clientes → aba Adsets
            </p>
          )
        })()}
      </div>

      {/* Fila global agrupada por cliente */}
      {queue.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48, marginBottom: '1rem' }}>🚗</div>
          <p style={{ color: 'rgba(245,245,245,.4)', fontWeight: 500 }}>Fila vazia — adicione URLs acima</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {Object.entries(queueByClient).map(([clientName, items]) => {
            const doneCount = items.filter(i => i.status === 'done').length
            return (
            <div key={clientName}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'rgba(245,245,245,.4)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                  {clientName}
                </div>
                {doneCount > 0 && (
                  <button
                    onClick={() => delAllDone(items)}
                    style={{
                      fontSize: '.7rem', fontWeight: 600, padding: '.2rem .6rem',
                      borderRadius: 5, border: 'none', cursor: 'pointer',
                      background: 'rgba(74,222,128,.1)', color: '#4ade80',
                    }}
                  >
                    ✕ Fechar concluídos ({doneCount})
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                {items.map(item => (
                  <QueueItem
                    key={item.id}
                    item={item}
                    clientName={clientName}
                    clientQueue={items}
                    onRetry={retry}
                    onCancel={cancel}
                    onReset={reset}
                    onDelete={del}
                  />
                ))}
              </div>
            </div>
          )})}

        </div>
      )}
    </div>
  )
}
