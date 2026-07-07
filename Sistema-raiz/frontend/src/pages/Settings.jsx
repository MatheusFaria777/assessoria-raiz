import { useState, useEffect } from 'react'
import CampaignGroups from '../components/settings/CampaignGroups'
import { toast } from '../lib/toast'
import { api } from '../lib/api'

function GoogleAdsSettings() {
  const [form, setForm] = useState({ developer_token: '', client_id: '', client_secret: '', refresh_token: '', login_customer_id: '' })
  const [saving, setSaving]       = useState(false)
  const [showForm, setShowForm]   = useState(false)
  const [connecting, setConnecting] = useState(false)

  // Escuta mensagem do popup OAuth
  useEffect(() => {
    function onMessage(e) {
      if (!e.data?.google_oauth) return
      setConnecting(false)
      if (e.data.google_oauth === 'success') {
        toast(e.data.msg || 'Google conectado com sucesso!', 'success')
      } else {
        toast(e.data.msg || 'Erro ao conectar com Google.', 'error')
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  async function startOAuth() {
    setConnecting(true)
    try {
      const { auth_url } = await api.get('/api/settings/google-oauth/start')
      const popup = window.open(auth_url, 'google_oauth', 'width=520,height=660,left=200,top=100')
      if (!popup) {
        toast('Popup bloqueado. Permita popups para esse site.', 'error')
        setConnecting(false)
      }
    } catch (e) {
      toast(e.message, 'error')
      setConnecting(false)
    }
  }

  async function save() {
    if (!form.developer_token || !form.client_id || !form.client_secret) {
      toast('Preencha Developer Token, Client ID e Client Secret', 'error'); return
    }
    setSaving(true)
    try {
      const res = await api.post('/api/settings/google-credentials', form)
      toast(res.message, 'success')
      setShowForm(false)
      setForm({ developer_token: '', client_id: '', client_secret: '', refresh_token: '', login_customer_id: '' })
    } catch (e) { toast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const field = (label, key, placeholder = '') => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.375rem' }}>
      <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'rgba(245,245,245,.5)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</label>
      <input className="input" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} />
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h3 style={{ margin: '0 0 .375rem', fontSize: '1rem', fontWeight: 600 }}>Google Ads</h3>
        <p style={{ margin: 0, fontSize: '.875rem', color: 'rgba(245,245,245,.45)' }}>Credenciais OAuth para acesso às contas Google Ads dos clientes.</p>
      </div>

      {/* Botão principal de reconexão */}
      <div style={{ padding: '1rem 1.25rem', background: 'rgba(203,161,53,.08)', borderRadius: 8, border: '1px solid rgba(203,161,53,.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '.9rem', marginBottom: '.2rem' }}>Renovar token Google</div>
          <div style={{ fontSize: '.78rem', color: 'rgba(245,245,245,.5)', lineHeight: 1.5 }}>
            Clique, faça login na sua conta Google e o refresh token é atualizado em todos os clientes automaticamente.
          </div>
        </div>
        <button className="btn-primary" onClick={startOAuth} disabled={connecting} style={{ flexShrink: 0 }}>
          {connecting ? <><span className="spinner" /> Aguardando...</> : '🔗 Autenticar com Google'}
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(245,245,245,.1)' }} />
        <span style={{ fontSize: '.75rem', color: 'rgba(245,245,245,.3)' }}>ou atualize as credenciais manualmente</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(245,245,245,.1)' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '.875rem', color: 'rgba(245,245,245,.5)' }}>Developer token, Client ID, Client Secret, Refresh Token e Customer ID</span>
        <button className="btn-secondary" onClick={() => setShowForm(f => !f)}>
          {showForm ? 'Cancelar' : 'Editar credenciais'}
        </button>
      </div>

      {showForm && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem', background: 'rgba(245,245,245,.04)', borderRadius: 8, border: '1px solid rgba(245,245,245,.1)' }}>
          {field('Developer Token *', 'developer_token')}
          {field('Client ID *', 'client_id')}
          {field('Client Secret *', 'client_secret')}
          {field('Refresh Token', 'refresh_token', 'Opcional — use o botão OAuth acima para gerar automaticamente')}
          {field('Login Customer ID (MCC)', 'login_customer_id', 'Opcional — ID da conta gerenciadora')}
          <button className="btn-primary" onClick={save} disabled={saving} style={{ alignSelf: 'flex-start' }}>
            {saving ? 'Salvando...' : 'Salvar e aplicar em todos os clientes'}
          </button>
        </div>
      )}

      <p style={{ margin: 0, fontSize: '.78rem', color: 'rgba(245,245,245,.35)', lineHeight: 1.6 }}>
        Se aparecer erro <strong style={{ color: '#f87171' }}>invalid_grant</strong>, clique em "Autenticar com Google" acima.
        Para isso funcionar, o URL <code style={{ fontSize: '.75rem', color: 'rgba(245,245,245,.4)' }}>http://localhost:8001/api/settings/google-oauth/callback</code> precisa estar na lista de Redirect URIs autorizadas no Google Cloud Console (APIs &amp; Services → Credenciais → seu OAuth client).
      </p>
    </div>
  )
}

const SECTIONS = [
  { id: 'campaign-groups', label: 'Grupos de Campanha', icon: '🏷️' },
  { id: 'sheets',          label: 'Google Sheets',      icon: '📊' },
  { id: 'meta',            label: 'Meta Ads',           icon: '📘' },
  { id: 'google',          label: 'Google Ads',         icon: '🔍' },
]

const SERVICE_ACCOUNT_EMAIL = 'assessoria-raiz-sheets@relatorios-raiz.iam.gserviceaccount.com'

function SheetsSettings() {
  const copy = () => {
    navigator.clipboard.writeText(SERVICE_ACCOUNT_EMAIL)
    toast('Email copiado!')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h3 style={{ margin: '0 0 .375rem', fontSize: '1rem', fontWeight: 600 }}>Google Sheets</h3>
        <p style={{ margin: 0, fontSize: '.875rem', color: 'rgba(245,245,245,.45)' }}>
          Para conectar a planilha de um cliente ao sistema, siga os passos abaixo.
        </p>
      </div>

      {/* Email da service account */}
      <div style={{ padding: '1rem 1.25rem', background: 'rgba(203,161,53,.08)', borderRadius: 8, borderLeft: '3px solid #CBA135' }}>
        <p style={{ margin: '0 0 .5rem', fontSize: '.75rem', fontWeight: 600, color: '#CBA135', textTransform: 'uppercase', letterSpacing: '.05em' }}>
          Email da Service Account
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <code style={{
            flex: 1, padding: '.5rem .75rem', background: 'rgba(245,245,245,.06)',
            borderRadius: 6, fontSize: '.875rem', color: '#F5F5F5',
            border: '1px solid rgba(245,245,245,.1)', wordBreak: 'break-all',
          }}>
            {SERVICE_ACCOUNT_EMAIL}
          </code>
          <button className="btn-secondary" onClick={copy} style={{ flexShrink: 0 }}>Copiar</button>
        </div>
        <p style={{ margin: '.5rem 0 0', fontSize: '.75rem', color: 'rgba(245,245,245,.45)' }}>
          Este é o email que precisa ter acesso de editor na planilha de cada cliente.
        </p>
      </div>

      {/* Passo a passo */}
      <div>
        <p style={{ margin: '0 0 .75rem', fontSize: '.8125rem', fontWeight: 600, color: 'rgba(245,245,245,.6)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
          Como conectar a planilha de um cliente
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.625rem' }}>
          {[
            ['1', 'Abra a planilha do cliente no Google Sheets.'],
            ['2', 'Clique em Compartilhar (canto superior direito).'],
            ['3', `Adicione o email acima (${SERVICE_ACCOUNT_EMAIL}) com permissão de Editor.`],
            ['4', 'Copie o ID da planilha da URL — é o código longo entre /d/ e /edit.'],
            ['5', 'No cadastro do cliente, cole o ID na aba Planilha.'],
          ].map(([n, text]) => (
            <div key={n} style={{ display: 'flex', gap: '.75rem', alignItems: 'flex-start' }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(203,161,53,.2)', color: '#CBA135',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '.75rem', fontWeight: 700,
              }}>{n}</div>
              <p style={{ margin: 0, fontSize: '.875rem', color: 'rgba(245,245,245,.7)', lineHeight: 1.5 }}>{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Como encontrar o ID */}
      <div style={{ padding: '1rem', background: 'rgba(245,245,245,.04)', borderRadius: 8, borderLeft: '3px solid rgba(245,245,245,.1)' }}>
        <p style={{ margin: '0 0 .375rem', fontSize: '.8rem', fontWeight: 600, color: 'rgba(245,245,245,.5)' }}>Onde fica o ID da planilha:</p>
        <code style={{ fontSize: '.8rem', color: 'rgba(245,245,245,.6)' }}>
          {'docs.google.com/spreadsheets/d/'}
          <span style={{ background: 'rgba(203,161,53,.25)', color: '#CBA135', padding: '0 3px', borderRadius: 3 }}>
            1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
          </span>
          {'/edit'}
        </code>
        <p style={{ margin: '.375rem 0 0', fontSize: '.75rem', color: 'rgba(245,245,245,.4)' }}>
          O trecho destacado em dourado é o ID que você precisa copiar.
        </p>
      </div>
    </div>
  )
}

function TokenField({ label, settingKey, hint }) {
  const [preview, setPreview] = useState(null)
  const [value, setValue]     = useState('')
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    fetch(`/api/settings/${settingKey}`)
      .then(r => r.json())
      .then(d => setPreview(d.preview))
      .catch(() => {})
  }, [settingKey])

  const save = async () => {
    if (!value.trim()) { toast('Cole o token antes de salvar', 'error'); return }
    setSaving(true)
    try {
      const r = await fetch(`/api/settings/${settingKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: value.trim(), is_encrypted: true }),
      })
      const d = await r.json()
      setPreview(d.preview)
      setValue('')
      toast('Token salvo com segurança!')
    } catch { toast('Erro ao salvar', 'error') }
    finally { setSaving(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
      <label className="label">{label}</label>
      {preview && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.25rem' }}>
          <span className="badge badge-success">✓ Configurado</span>
          <code style={{ fontSize: '.75rem', color: 'rgba(245,245,245,.4)' }}>{preview}</code>
        </div>
      )}
      <div style={{ display: 'flex', gap: '.5rem' }}>
        <input className="input" type="password" value={value} onChange={e => setValue(e.target.value)}
          placeholder={preview ? 'Cole um novo token para substituir' : 'Cole o token aqui'} style={{ flex: 1 }} />
        <button className="btn-primary" onClick={save} disabled={saving}>
          {saving ? <span className="spinner" /> : 'Salvar'}
        </button>
      </div>
      {hint && <p style={{ margin: 0, fontSize: '.75rem', color: 'rgba(245,245,245,.4)', lineHeight: 1.5 }}>{hint}</p>}
    </div>
  )
}

function MetaSettings() {
  const [tokenInfo, setTokenInfo]   = useState(null)
  const [shortToken, setShortToken] = useState('')
  const [exchanging, setExchanging] = useState(false)

  const loadTokenInfo = () => {
    fetch('/api/settings/meta-token/info')
      .then(r => r.json())
      .then(setTokenInfo)
      .catch(() => {})
  }

  useEffect(() => { loadTokenInfo() }, [])

  const exchangeToken = async () => {
    if (!shortToken.trim()) { toast('Cole o token antes de converter', 'error'); return }
    setExchanging(true)
    try {
      const r = await fetch('/api/settings/meta-token/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: shortToken.trim() }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.detail || 'Erro desconhecido')
      toast(d.message)
      setShortToken('')
      loadTokenInfo()
    } catch (e) { toast(e.message, 'error') }
    finally { setExchanging(false) }
  }

  const daysLeft = tokenInfo?.days_left

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h3 style={{ margin: '0 0 .375rem', fontSize: '1rem', fontWeight: 600 }}>Meta Ads — Token de Acesso</h3>
        <p style={{ margin: 0, fontSize: '.875rem', color: 'rgba(245,245,245,.45)' }}>
          Token de longa duração (60 dias) com renovação automática. Um token para todos os clientes.
        </p>
      </div>

      {/* Status atual do token */}
      {tokenInfo?.has_token && (
        <div style={{
          padding: '1rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: '1rem',
          background: daysLeft > 14 ? 'rgba(74,222,128,.08)' : daysLeft > 7 ? 'rgba(203,161,53,.08)' : 'rgba(248,113,113,.08)',
          border: `1px solid ${daysLeft > 14 ? 'rgba(74,222,128,.3)' : daysLeft > 7 ? 'rgba(203,161,53,.3)' : 'rgba(248,113,113,.3)'}`,
        }}>
          <div style={{ fontSize: 28 }}>{daysLeft > 14 ? '✅' : daysLeft > 7 ? '⚠️' : '🔴'}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '.9rem' }}>
              {daysLeft > 0 ? `Token válido — ${daysLeft} dias restantes` : 'Token expirado'}
            </div>
            {tokenInfo.expires_at && (
              <div style={{ fontSize: '.75rem', color: 'rgba(245,245,245,.5)', marginTop: '.25rem' }}>
                Expira em: {new Date(tokenInfo.expires_at).toLocaleDateString('pt-BR')}
                {daysLeft <= 14 && ' — clique em "Renovar agora" abaixo'}
              </div>
            )}
            <div style={{ fontSize: '.75rem', color: 'rgba(245,245,245,.4)', marginTop: '.125rem' }}>
              O sistema renova automaticamente todos os dias às 9h quando faltam menos de 15 dias.
            </div>
          </div>
        </div>
      )}

      {/* Campos App ID e Secret */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.875rem' }}>
        <p style={{ margin: 0, fontSize: '.8rem', fontWeight: 600, color: 'rgba(245,245,245,.5)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
          Credenciais do App (Meta for Developers)
        </p>
        <TokenField label="App ID" settingKey="meta_app_id"
          hint="Encontre em developers.facebook.com → seu app → Painel → App ID" />
        <TokenField label="App Secret" settingKey="meta_app_secret"
          hint="Mesmo lugar → Configurações Básicas → Chave Secreta do Aplicativo" />
      </div>

      <hr className="divider" />

      {/* Conversão de token */}
      <div>
        <p style={{ margin: '0 0 .75rem', fontSize: '.875rem', fontWeight: 600 }}>
          {tokenInfo?.has_token ? 'Renovar ou substituir token' : 'Adicionar token'}
        </p>
        <p style={{ margin: '0 0 .75rem', fontSize: '.8rem', color: 'rgba(245,245,245,.5)', lineHeight: 1.5 }}>
          Cole qualquer token do Meta (curto ou longo) — o sistema converte automaticamente para um token de 60 dias.
          Pegue o token em: <strong style={{ color: '#CBA135' }}>developers.facebook.com → Graph API Explorer → Generate Access Token</strong>
        </p>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <input className="input" type="password" value={shortToken}
            onChange={e => setShortToken(e.target.value)}
            placeholder="Cole o token aqui..." style={{ flex: 1 }} />
          <button className="btn-primary" onClick={exchangeToken} disabled={exchanging}>
            {exchanging ? <><span className="spinner" /> Convertendo...</> : '🔄 Converter para 60 dias'}
          </button>
        </div>
      </div>

      <hr className="divider" />

      <TokenField
        label="Chave API Claude (para geração de copy dos anúncios)"
        settingKey="anthropic_api_key"
        hint="Usada no Uploader para gerar o copy dos anúncios de veículos. Encontre em console.anthropic.com → API Keys."
      />

      <hr className="divider" />

      <TokenField
        label="Instagram Session ID (para download de posts no servidor)"
        settingKey="instagram_sessionid"
        hint="Necessário para o Uploader funcionar no servidor. Como obter: abra instagram.com no Chrome → F12 → Application → Cookies → sessionid → copie o valor."
      />
    </div>
  )
}


export default function Settings() {
  const [section, setSection] = useState('campaign-groups')

  return (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
      <div style={{
        width: 200, flexShrink: 0,
        background: '#1E3D34', borderRadius: 10,
        border: '1px solid rgba(245,245,245,.1)',
        padding: '.5rem',
      }}>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '.625rem',
            padding: '.5rem .75rem', borderRadius: 6, border: 'none', cursor: 'pointer',
            fontSize: '.8125rem', fontWeight: section === s.id ? 600 : 400,
            background: section === s.id ? 'rgba(203,161,53,.15)' : 'transparent',
            color: section === s.id ? '#CBA135' : 'rgba(245,245,245,.6)',
            marginBottom: 2, transition: 'all .15s', textAlign: 'left',
          }}>
            <span>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ flex: 1 }}>
        {section === 'campaign-groups' && <CampaignGroups />}
        {section === 'sheets' && <SheetsSettings />}
        {section === 'meta'   && <MetaSettings />}
        {section === 'google' && <GoogleAdsSettings />}
      </div>
    </div>
  )
}
