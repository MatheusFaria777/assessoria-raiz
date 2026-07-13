import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { toast } from '../lib/toast'
import { getDayInfo, readCadenciaCache, writeCadenciaCache } from '../lib/utils'
import CadenciaClientCard from '../components/CadenciaClientCard'

function DayBanner({ endpoint }) {
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

  const rgb = config.color === '#4ade80' ? '74,222,128' : config.color === '#60a5fa' ? '96,165,250' : '203,161,53'

  return (
    <div style={{
      background: `rgba(${rgb},.08)`,
      border: `1px solid rgba(${rgb},.2)`,
      borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1.5rem',
    }}>
      <div style={{ fontSize: 24, marginBottom: '.25rem' }}>{config.emoji}</div>
      <div style={{ fontWeight: 700, fontSize: '1rem', color: config.color }}>{config.title}</div>
      <div style={{ fontSize: '.8125rem', color: 'rgba(245,245,245,.5)', marginTop: '.25rem' }}>{config.subtitle}</div>
    </div>
  )
}

export default function Cadencia() {
  const { dayIndex, dayName, isSegunda, isQuarta } = getDayInfo()
  const [activeTab, setActiveTab] = useState(() => {
    if (dayIndex === 1) return 'segunda'
    if (dayIndex === 3) return 'quarta'
    return 'segunda'
  })
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const load = async (tab, force = false) => {
    if (!force) {
      const cached = readCadenciaCache(tab)
      if (cached) { setItems(cached); return }
    }
    setLoading(true)
    setItems([])
    try {
      const data = await api.get(`/api/cadencia/${tab}`)
      writeCadenciaCache(tab, data)
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
          {(isSegunda || isQuarta) && ' — dia de mandar mensagem para os clientes 👇'}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '.5rem 1rem', borderRadius: 7, border: 'none',
              cursor: 'pointer', fontSize: '.8125rem',
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
            marginLeft: 'auto', padding: '.5rem .875rem', borderRadius: 7, border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer', fontSize: '.8125rem',
            background: 'rgba(245,245,245,.06)', color: 'rgba(245,245,245,.5)',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? 'Carregando…' : '↻ Atualizar'}
        </button>
      </div>

      <DayBanner endpoint={activeTab} />

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
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
          {ok.map(item => <CadenciaClientCard key={item.client_id} item={item} />)}
          {errors.length > 0 && (
            <>
              <div style={{
                fontSize: '.75rem', color: 'rgba(245,245,245,.3)',
                padding: '.5rem 0', borderTop: '1px solid rgba(245,245,245,.06)',
                marginTop: '.25rem',
              }}>
                {errors.length} cliente{errors.length > 1 ? 's' : ''} com erro
              </div>
              {errors.map(item => <CadenciaClientCard key={item.client_id} item={item} />)}
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
