import { useState } from 'react'
import { toast } from '../lib/toast'

const TODAY = new Date().toISOString().slice(0, 10)

function getSentKey(clientId) {
  return `cadencia_sent_${TODAY}_${clientId}`
}

function isSent(clientId) {
  try { return !!localStorage.getItem(getSentKey(clientId)) } catch { return false }
}

function markSent(clientId) {
  try { localStorage.setItem(getSentKey(clientId), '1') } catch {}
}

function currentGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia!'
  if (h < 18) return 'Boa tarde!'
  return 'Boa noite!'
}

function CopyButton({ text, onCopied }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      const greeting = currentGreeting()
      await navigator.clipboard.writeText(`${greeting} ${text}`)
      setCopied(true)
      onCopied?.()
      toast('Copiado!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast('Erro ao copiar', 'error')
    }
  }
  return (
    <button onClick={copy} style={{
      padding: '.375rem .875rem', borderRadius: 6, border: 'none',
      cursor: 'pointer', fontSize: '.8125rem', fontWeight: 600,
      background: copied ? 'rgba(74,222,128,.15)' : 'rgba(203,161,53,.15)',
      color: copied ? '#4ade80' : '#CBA135', transition: 'all .2s', flexShrink: 0,
    }}>
      {copied ? '✓ Copiado' : 'Copiar'}
    </button>
  )
}

function PlatformBadge({ platform }) {
  const isGoogle = platform === 'google'
  return (
    <span style={{
      fontSize: '.6875rem', fontWeight: 600, padding: '.15rem .45rem', borderRadius: 4,
      background: isGoogle ? 'rgba(96,165,250,.12)' : 'rgba(203,161,53,.1)',
      color: isGoogle ? '#60a5fa' : '#CBA135', flexShrink: 0,
    }}>
      {isGoogle ? 'Google' : 'Meta'}
    </span>
  )
}

function PeriodBadge({ periodType }) {
  if (periodType !== 'monthly') return null
  return (
    <span style={{
      fontSize: '.6875rem', fontWeight: 600, padding: '.15rem .45rem', borderRadius: 4,
      background: 'rgba(167,139,250,.12)', color: '#a78bfa', flexShrink: 0,
    }}>
      Mensal
    </span>
  )
}

function SentBadge() {
  return (
    <span style={{
      fontSize: '.6875rem', fontWeight: 600, padding: '.15rem .45rem', borderRadius: 4,
      background: 'rgba(74,222,128,.1)', color: '#4ade80', flexShrink: 0,
    }}>
      Enviado ✓
    </span>
  )
}

export default function CadenciaClientCard({ item }) {
  const [expanded, setExpanded] = useState(false)
  const [sent, setSent] = useState(() => isSent(item.client_id))

  const handleCopied = () => {
    markSent(item.client_id)
    setSent(true)
  }

  if (!item.ok) {
    return (
      <div style={{
        background: 'rgba(248,113,113,.06)', border: '1px solid rgba(248,113,113,.2)',
        borderRadius: 10, padding: '.875rem 1rem',
        display: 'flex', alignItems: 'center', gap: '.75rem',
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
      background: sent ? 'rgba(74,222,128,.04)' : 'rgba(245,245,245,.04)',
      border: `1px solid ${sent ? 'rgba(74,222,128,.15)' : 'rgba(245,245,245,.08)'}`,
      borderRadius: 10, overflow: 'hidden',
      transition: 'background .3s, border-color .3s',
    }}>
      <div onClick={() => setExpanded(e => !e)} style={{
        display: 'flex', alignItems: 'center', gap: '.75rem',
        padding: '.875rem 1rem', cursor: 'pointer',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 7,
          background: sent ? 'rgba(74,222,128,.15)' : 'rgba(203,161,53,.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700,
          color: sent ? '#4ade80' : '#CBA135',
          flexShrink: 0,
        }}>
          {item.name.charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '.875rem', display: 'flex', alignItems: 'center', gap: '.4rem', flexWrap: 'wrap' }}>
            {item.name}
            {item.platform && <PlatformBadge platform={item.platform} />}
            <PeriodBadge periodType={item.period_type} />
            {sent && <SentBadge />}
          </div>
          {item.since && (
            <div style={{ fontSize: '.75rem', color: 'rgba(245,245,245,.4)', marginTop: 2 }}>
              {item.since?.slice(8, 10)}/{item.since?.slice(5, 7)} a {item.until?.slice(8, 10)}/{item.until?.slice(5, 7)}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
          <CopyButton text={item.message} onCopied={handleCopied} />
          <span style={{
            fontSize: '.8125rem', color: 'rgba(245,245,245,.3)',
            transform: expanded ? 'rotate(180deg)' : 'none',
            transition: 'transform .2s', userSelect: 'none',
          }}>▾</span>
        </div>
      </div>
      {expanded && (
        <div style={{
          borderTop: '1px solid rgba(245,245,245,.06)',
          padding: '.875rem 1rem', background: 'rgba(0,0,0,.15)',
        }}>
          <pre style={{
            fontFamily: 'inherit', fontSize: '.8125rem',
            color: 'rgba(245,245,245,.7)', whiteSpace: 'pre-wrap',
            wordBreak: 'break-word', margin: 0, lineHeight: 1.6,
          }}>
            {item.message}
          </pre>
        </div>
      )}
    </div>
  )
}
