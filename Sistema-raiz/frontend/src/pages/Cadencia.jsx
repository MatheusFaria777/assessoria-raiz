import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { toast } from '../lib/toast'

const DAYS_PT = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']

function getDayInfo() {
  const day = new Date().getDay()
  return { dayIndex: day, dayName: DAYS_PT[day] }
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast('Copiado!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast('Erro ao copiar', 'error')
    }
  }

  return (
    <button
      onClick={copy}
      style={{
        padding: '.375rem .875rem',
        borderRadius: 6,
        border: 'none',
        cursor: 'pointer',
        fontSize: '.8125rem',
        fontWeight: 600,
        background: copied ? 'rgba(74,222,128,.15)' : 'rgba(203,161,53,.15)',
        color: copied ? '#4ade80' : '#CBA135',
        transition: 'all .2s',
        flexShrink: 0,
      }}
    >
      {copied ? '✓ Copiado' : 'Copiar'}
    </button>
  )
}

function PlatformBadge({ platform }) {
  const isGoogle = platform === 'google'
  return (
    <span style={{
      fontSize: '.6875rem',
      fontWeight: 600,
      padding: '.15rem .45rem',
      borderRadius: 4,
      background: isGoogle ? 'rgba(96,165,250,.12)' : 'rgba(203,161,53,.1)',
      color: isGoogle ? '#60a5fa' : '#CBA135',
      flexShrink: 0,
    }}>
      {isGoogle ? 'Google' : 'Meta'}
    </span>
  )
}

function PeriodBadge({ periodType }) {
  if (periodType !== 'monthly') return null
  return (
    <span style={{
      fontSize: '.6875rem',
      fontWeight: 600,
      padding: '.15rem .45rem',
      borderRadius: 4,
      background: 'rgba(167,139,250,.12)',
      color: '#a78bfa',
      flexShrink: 0,
    }}>
      Mensal
    </span>
  )
}

function ClientCard({ item }) {
  const [expanded, setExpanded] = useState(false)

  if (!item.ok) {
    return (
      <div style={{
        background: 'rgba(248,113,113,.06)',
        border: '1px solid rgba(248,113,113,.2)',
        borderRadius: 10,
        padding: '.875rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '.75rem',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 7, background: 'rgba(248,113,113,.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, color: '#f87171', flexShrink: 0,
        }}>
          {item.name.charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '.875rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
            {item.name}
            {item.platform && <PlatformBadge platform={item.platform} />}
            <PeriodBadge periodType={item.period_type} />
          </div>
          <div style={{ fontSize: '.75rem', color: '#f87171', marginTop: 2 }}>{item.error}</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'rgba(245,245,245,.04)',
      border: '1px solid rgba(245,245,245,.08)',
      borderRadius: 10,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex', alignItems: 'center', gap: '.75rem',
          padding: '.875rem 1rem', cursor: 'pointer',
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 7,
          background: 'rgba(203,161,53,.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, color: '#CBA135', flexShrink: 0,
        }}>
          {item.name.charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '.875rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
            {item.name}
            {item.platform && <PlatformBadge platform={item.platform} />}
            <PeriodBadge periodType={item.period_type} />
          </div>
          {item.since && (
            <div style={{ fontSize: '.75rem', color: 'rgba(245,245,245,.4)', marginTop: 2 }}>
              {item.since?.slice(8, 10)}/{item.since?.slice(5, 7)} a {item.until?.slice(8, 10)}/{item.until?.slice(5, 7)}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
          <CopyButton text={item.message} />
          <span style={{
            fontSize: '.8125rem', color: 'rgba(245,245,245,.3)',
            transform: expanded ? 'rotate(180deg)' : 'none',
            transition: 'transform .2s', userSelect: 'none',
          }}>▾</span>
        </div>
      </div>

      {/* Mensagem expandida */}
      {expanded && (
        <div style={{
          borderTop: '1px solid rgba(245,245,245,.06)',
          padding: '.875rem 1rem',
          background: 'rgba(0,0,0,.15)',
        }}>
          <pre style={{
            fontFamily: 'inherit',
            fontSize: '.8125rem',
            color: 'rgba(245,245,245,.7)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            margin: 0,
            lineHeight: 1.6,
          }}>
            {item.message}
          </pre>
        </div>
      )}
    </div>
  )
}

function DayBanner({ dayName, endpoint }) {
  const config = {
    segunda: {
      emoji: '📊',
      title: 'Relatório da semana',
      subtitle: 'Métricas da semana + pedido de feedback de visitas e vendas',
      color: '#4ade80',
    },
    quarta: {
      emoji: '🎨',
      title: 'Melhores criativos',
      subtitle: 'Top 3 criativos com mais resultados + link do Instagram',
      color: '#60a5fa',
    },
  }[endpoint] || {
    emoji: '📅',
    title: 'Cadência',
    subtitle: '',
    color: '#CBA135',
  }

  return (
    <div style={{
      background: `rgba(${config.color === '#4ade80' ? '74,222,128' : config.color === '#60a5fa' ? '96,165,250' : '203,161,53'},.08)`,
      border: `1px solid rgba(${config.color === '#4ade80' ? '74,222,128' : config.color === '#60a5fa' ? '96,165,250' : '203,161,53'},.2)`,
      borderRadius: 10,
      padding: '1rem 1.25rem',
      marginBottom: '1.5rem',
    }}>
      <div style={{ fontSize: 24, marginBottom: '.25rem' }}>{config.emoji}</div>
      <div style={{ fontWeight: 700, fontSize: '1rem', color: config.color }}>{config.title}</div>
      <div style={{ fontSize: '.8125rem', color: 'rgba(245,245,245,.5)', marginTop: '.25rem' }}>{config.subtitle}</div>
    </div>
  )
}

const CACHE_TTL_MS = 4 * 60 * 60 * 1000 // 4 horas

function cacheKey(tab) {
  const today = new Date().toISOString().slice(0, 10)
  return `cadencia_${tab}_${today}`
}

function readCache(tab) {
  try {
    const raw = localStorage.getItem(cacheKey(tab))
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL_MS) return null
    return data
  } catch { return null }
}

function writeCache(tab, data) {
  try {
    localStorage.setItem(cacheKey(tab), JSON.stringify({ ts: Date.now(), data }))
  } catch {}
}

export default function Cadencia() {
  const { dayIndex, dayName } = getDayInfo()
  const [activeTab, setActiveTab] = useState(() => {
    if (dayIndex === 1) return 'segunda'
    if (dayIndex === 3) return 'quarta'
    return 'segunda'
  })
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const load = async (tab, force = false) => {
    if (!force) {
      const cached = readCache(tab)
      if (cached) { setItems(cached); return }
    }
    setLoading(true)
    setItems([])
    try {
      const data = await api.get(`/api/cadencia/${tab}`)
      writeCache(tab, data)
      setItems(data)
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(activeTab)
  }, [activeTab])

  const tabs = [
    { id: 'segunda', label: '📊 Segunda' },
    { id: 'quarta', label: '🎨 Quarta' },
  ]

  const ok = items.filter(i => i.ok)
  const errors = items.filter(i => !i.ok)

  return (
    <div style={{ maxWidth: 780, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
          Cadência Semanal 📅
        </h1>
        <p style={{ fontSize: '.8125rem', color: 'rgba(245,245,245,.45)', margin: '.25rem 0 0' }}>
          Hoje é {dayName}
          {(dayIndex === 1 || dayIndex === 3) && ' — dia de mandar mensagem para os clientes 👇'}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '.5rem 1rem',
              borderRadius: 7,
              border: 'none',
              cursor: 'pointer',
              fontSize: '.8125rem',
              fontWeight: activeTab === t.id ? 600 : 400,
              background: activeTab === t.id ? 'rgba(203,161,53,.15)' : 'rgba(245,245,245,.06)',
              color: activeTab === t.id ? '#CBA135' : 'rgba(245,245,245,.5)',
              transition: 'all .15s',
            }}
          >
            {t.label}
          </button>
        ))}
        <button
          onClick={() => load(activeTab, true)}
          disabled={loading}
          style={{
            marginLeft: 'auto',
            padding: '.5rem .875rem',
            borderRadius: 7,
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '.8125rem',
            background: 'rgba(245,245,245,.06)',
            color: 'rgba(245,245,245,.5)',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? 'Carregando…' : '↻ Atualizar'}
        </button>
      </div>

      <DayBanner dayName={dayName} endpoint={activeTab} />

      {loading && (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '.75rem',
        }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              height: 64, borderRadius: 10,
              background: 'rgba(245,245,245,.04)',
              border: '1px solid rgba(245,245,245,.06)',
              animation: 'pulse 1.5s ease infinite',
            }} />
          ))}
        </div>
      )}

      {!loading && items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {ok.map(item => <ClientCard key={item.client_id} item={item} />)}
          {errors.length > 0 && (
            <>
              <div style={{
                fontSize: '.75rem', color: 'rgba(245,245,245,.3)',
                padding: '.5rem 0', borderTop: '1px solid rgba(245,245,245,.06)',
                marginTop: '.25rem',
              }}>
                {errors.length} cliente{errors.length > 1 ? 's' : ''} com erro
              </div>
              {errors.map(item => <ClientCard key={item.client_id} item={item} />)}
            </>
          )}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '3rem 1rem',
          color: 'rgba(245,245,245,.3)', fontSize: '.875rem',
        }}>
          Nenhum cliente ativo com cadência habilitada.
        </div>
      )}
    </div>
  )
}
