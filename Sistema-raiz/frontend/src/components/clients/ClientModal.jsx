import { useState, useEffect, useCallback } from 'react'
import { api } from '../../lib/api'
import { toast } from '../../lib/toast'

const EMPTY_ADSET = {
  label: '', adset_id: '', page_id: '', whatsapp: '',
  instagram_actor_id: '', store_name: '', store_description: '',
  store_address: '', store_phone: '', store_whatsapp_display: '',
  store_website: '', template_ad_id: '', lead_gen_form_id: '', active: true,
}

function parseGroupTabs(raw) {
  if (!raw) return {}
  try { return JSON.parse(raw) } catch { return {} }
}

export default function ClientModal({ client, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: '', has_meta: false, meta_account_id: '',
    has_google: false, google_customer_id: '',
    sheets_id: '', group_tabs: {}, campaign_group_ids: [],
    cadencia_ativa: true, cadencia_contexto: '',
  })
  const [adsets, setAdsets] = useState([])
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('basico')

  // Mapeamento explícito de campanhas
  const [campaignMappings, setCampaignMappings] = useState([])  // mapeamentos salvos
  const [metaCampaigns, setMetaCampaigns]       = useState([])  // campanhas da API Meta
  const [loadingCampaigns, setLoadingCampaigns] = useState(false)
  const [mappingsDirty, setMappingsDirty]       = useState(false)

  useEffect(() => {
    if (client) {
      setForm({
        name: client.name || '',
        has_meta: client.has_meta || false,
        meta_account_id: client.meta_account_id || '',
        has_google: client.has_google || false,
        google_customer_id: client.google_customer_id || '',
        sheets_id: client.sheets_id || '',
        group_tabs: parseGroupTabs(client.sheets_tabs),
        campaign_group_ids: client.campaign_groups?.map(g => g.id) || [],
        cadencia_ativa: client.cadencia_ativa ?? true,
        cadencia_contexto: client.cadencia_contexto || '',
      })
      setAdsets(client.adsets?.map(a => ({ ...a })) || [])
      // Carrega mapeamentos de campanhas existentes
      api.get(`/api/clients/${client.id}/campaign-mapping`)
        .then(d => setCampaignMappings(d.campaigns || []))
        .catch(() => {})
    }
  }, [client])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Adsets
  const addAdset    = () => setAdsets(a => [...a, { ...EMPTY_ADSET, _new: Date.now() }])
  const removeAdset = (idx) => setAdsets(a => a.filter((_, i) => i !== idx))
  const setAdset    = (idx, k, v) => setAdsets(a => a.map((x, i) => i === idx ? { ...x, [k]: v } : x))

  // Campaign mappings
  const fetchMetaCampaigns = useCallback(async () => {
    if (!client?.id) return
    setLoadingCampaigns(true)
    try {
      const d = await api.get(`/api/clients/${client.id}/meta-campaigns`)
      const savedById = Object.fromEntries(campaignMappings.map(m => [m.meta_campaign_id, m]))
      // Merge campanhas da API com mapeamentos já salvos — sem mapeamento salvo, usa o
      // palpite de tipo que o Meta sugere pelo objetivo da campanha (pode trocar na hora)
      setMetaCampaigns(d.campaigns.map(c => ({
        id: c.id,
        name: c.name,
        status: c.status,
        campaign_type: savedById[c.id]?.campaign_type ?? c.suggested_type ?? '',
        sheet_tab: savedById[c.id]?.sheet_tab || '',
      })))
    } catch (e) {
      toast(e.message || 'Erro ao buscar campanhas', 'error')
    } finally {
      setLoadingCampaigns(false)
    }
  }, [client?.id, campaignMappings])

  const updateMapping = (campaignId, field, value) => {
    setMetaCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, [field]: value } : c))
    setMappingsDirty(true)
  }

  const saveMappings = async (clientId) => {
    const toSave = metaCampaigns.filter(c => c.campaign_type)
    await api.put(`/api/clients/${clientId}/campaign-mapping`, {
      campaigns: toSave.map(c => ({
        meta_campaign_id: c.id,
        name: c.name,
        campaign_type: c.campaign_type,
        sheet_tab: c.sheet_tab || null,
        active: true,
      })),
    })
    setMappingsDirty(false)
  }

  const save = async () => {
    if (!form.name.trim()) { toast('Nome é obrigatório', 'error'); return }
    setSaving(true)
    try {
      const sheetsTabsObj = {}
      for (const [type, t] of Object.entries(form.group_tabs)) {
        if (t?.trim()) sheetsTabsObj[type] = t.trim()
      }
      const cleanAdsets = adsets.map(({ _new, client_id, ...rest }) => rest)

      const payload = {
        name: form.name,
        has_meta: form.has_meta,
        meta_account_id: form.meta_account_id,
        has_google: form.has_google,
        google_customer_id: form.google_customer_id,
        sheets_id: form.sheets_id,
        sheets_tabs: Object.keys(sheetsTabsObj).length ? JSON.stringify(sheetsTabsObj) : null,
        cadencia_ativa: form.cadencia_ativa,
        cadencia_contexto: form.cadencia_contexto || null,
        campaign_group_ids: form.campaign_group_ids,
        adsets: cleanAdsets,
      }

      let savedId = client?.id
      if (client) {
        await api.put(`/api/clients/${client.id}`, payload)
        toast('Cliente atualizado')
      } else {
        const created = await api.post('/api/clients/', payload)
        savedId = created.id
        toast('Cliente criado')
      }

      // Salva mapeamentos de campanhas se houver alterações
      if (mappingsDirty && savedId && metaCampaigns.length > 0) {
        await saveMappings(savedId)
      }

      onSaved()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const TABS = [
    { id: 'basico',    label: 'Dados' },
    { id: 'adsets',    label: `Conjuntos${adsets.length ? ` (${adsets.length})` : ''}` },
    { id: 'campanhas', label: `Campanhas${campaignMappings.length ? ` (${campaignMappings.length})` : ''}` },
    { id: 'planilha',  label: 'Planilha' },
  ]

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxHeight: '92vh', overflowY: 'auto', maxWidth: 660, padding: '1.25rem' }}>
        <div className="modal-header" style={{ marginBottom: '1rem' }}>
          <span className="modal-title">{client ? 'Editar Cliente' : 'Novo Cliente'}</span>
          <button className="btn-ghost" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: '1.25rem' }}>
          {TABS.map(t => (
            <button key={t.id} className={`tab${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>

        {/* ── Tab: Dados ── */}
        {tab === 'basico' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Field label="Nome *">
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nome da empresa" />
            </Field>

            <Section title="Meta Ads">
              <Toggle label="Ativo" checked={form.has_meta} onChange={v => set('has_meta', v)} />
              {form.has_meta && (
                <div style={{ marginTop: '.75rem' }}>
                  <Field label="Conta Meta (act_...)" hint="ID da conta de anúncios. Ex: act_123456789">
                    <input className="input" value={form.meta_account_id}
                      onChange={e => set('meta_account_id', e.target.value)} placeholder="act_123456789" />
                  </Field>
                </div>
              )}
            </Section>

            <Section title="Google Ads">
              <Toggle label="Ativo" checked={form.has_google} onChange={v => set('has_google', v)} />
              {form.has_google && (
                <div style={{ marginTop: '.75rem' }}>
                  <Field label="Customer ID">
                    <input className="input" value={form.google_customer_id}
                      onChange={e => set('google_customer_id', e.target.value)} placeholder="123-456-7890" />
                  </Field>
                </div>
              )}
            </Section>

            <Section title="Cadência Semanal">
              <Toggle label="Ativo na cadência" checked={form.cadencia_ativa} onChange={v => set('cadencia_ativa', v)} />
              {form.cadencia_ativa && (
                <div style={{ marginTop: '.75rem' }}>
                  <Field label="Notas do cliente" hint="Contexto usado para personalizar as mensagens de segunda e quarta">
                    <textarea
                      className="input" rows={3} value={form.cadencia_contexto}
                      onChange={e => set('cadencia_contexto', e.target.value)}
                      placeholder="Ex: Cipriani — compra no Pix, avaliação 15 min, aceita financiado. Foco em mensagem."
                      style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: '.8125rem' }}
                    />
                  </Field>
                </div>
              )}
            </Section>
          </div>
        )}

        {/* ── Tab: Conjuntos de anúncio ── */}
        {tab === 'adsets' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            <div style={{ fontSize: '.8rem', color: 'rgba(245,245,245,.45)', lineHeight: 1.5, marginBottom: '.5rem' }}>
              Cada conjunto representa um ad set do Meta Ads. O uploader usa o <strong style={{ color: 'rgba(245,245,245,.7)' }}>ID do Conjunto</strong> pra saber onde postar os anúncios.
            </div>

            {adsets.length === 0 && (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'rgba(245,245,245,.3)', fontSize: '.875rem' }}>
                Nenhum conjunto configurado. Clique em "+ Adicionar" para começar.
              </div>
            )}

            {adsets.map((a, idx) => (
              <AdsetRow key={a.id || a._new || idx} adset={a} idx={idx}
                onChange={setAdset} onRemove={removeAdset} />
            ))}

            <button className="btn-secondary" style={{ alignSelf: 'flex-start' }} onClick={addAdset}>
              + Adicionar conjunto
            </button>
          </div>
        )}

        {/* ── Tab: Campanhas ── */}
        {tab === 'campanhas' && (
          <CampaignsTab
            client={client}
            campaignMappings={campaignMappings}
            metaCampaigns={metaCampaigns}
            loading={loadingCampaigns}
            hasMeta={form.has_meta}
            onFetch={fetchMetaCampaigns}
            onUpdate={updateMapping}
          />
        )}

        {/* ── Tab: Planilha ── */}
        {tab === 'planilha' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Field label="ID da Planilha Google Sheets" hint="O ID fica na URL entre /d/ e /edit">
              <input className="input" value={form.sheets_id}
                onChange={e => set('sheets_id', e.target.value)}
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms" />
            </Field>

            {Object.keys(form.group_tabs).length > 0 && (
              <div style={{ fontSize: '.78rem', color: 'rgba(245,245,245,.4)', fontStyle: 'italic', lineHeight: 1.5 }}>
                As abas da planilha são agora configuradas por campanha na aba "Campanhas".
              </div>
            )}
          </div>
        )}

        <hr className="divider" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.75rem' }}>
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={save} disabled={saving}>
            {saving ? <><span className="spinner" /> Salvando...</> : client ? 'Salvar' : 'Criar Cliente'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── CampaignsTab ─────────────────────────────────────────────────────────── */
function CampaignsTab({ client, campaignMappings, metaCampaigns, loading, hasMeta, onFetch, onUpdate }) {
  const [campaignTypes, setCampaignTypes] = useState([])

  useEffect(() => {
    api.get('/api/clients/campaign-mapping/types')
      .then(d => setCampaignTypes(d.types || []))
      .catch(() => {})
  }, [])

  if (!client?.id) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(245,245,245,.4)', fontSize: '.875rem' }}>
        Salve o cliente primeiro para configurar as campanhas.
      </div>
    )
  }

  if (!hasMeta) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(245,245,245,.4)', fontSize: '.875rem' }}>
        Configure o Meta Ads na aba "Dados" para mapear campanhas.
      </div>
    )
  }

  const showList = metaCampaigns.length > 0 ? metaCampaigns : campaignMappings.map(m => ({
    id: m.meta_campaign_id,
    name: m.name || m.meta_campaign_id,
    campaign_type: m.campaign_type,
    sheet_tab: m.sheet_tab || '',
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ fontSize: '.8rem', color: 'rgba(245,245,245,.45)', lineHeight: 1.5 }}>
          Mapeie cada campanha Meta ao seu tipo. Só campanhas mapeadas aparecem nos relatórios.
        </div>
        <button className="btn-secondary" onClick={onFetch} disabled={loading} style={{ flexShrink: 0 }}>
          {loading ? <><span className="spinner" /> Buscando...</> : 'Buscar do Meta'}
        </button>
      </div>

      {showList.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '1.5rem', color: 'rgba(245,245,245,.3)', fontSize: '.875rem' }}>
          Clique em "Buscar do Meta" para listar as campanhas da conta.
        </div>
      )}

      {showList.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
          {showList.map(c => (
            <CampaignRow
              key={c.id}
              campaign={c}
              campaignTypes={campaignTypes}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}

      {showList.length > 0 && (
        <div style={{ fontSize: '.72rem', color: 'rgba(245,245,245,.3)', lineHeight: 1.5 }}>
          Deixe o tipo vazio para ignorar a campanha nos relatórios. A aba da planilha é opcional.
        </div>
      )}
    </div>
  )
}

function CampaignRow({ campaign, campaignTypes, onUpdate }) {
  const isActive = campaign.status === 'ACTIVE'
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 160px 140px',
      gap: '.5rem', alignItems: 'center',
      padding: '.625rem .75rem', borderRadius: 7,
      background: 'rgba(245,245,245,.04)',
      border: '1px solid rgba(245,245,245,.08)',
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: '.825rem', color: '#F5F5F5', whiteSpace: 'nowrap',
          overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500,
        }}>
          {campaign.name}
        </div>
        <div style={{ fontSize: '.7rem', color: isActive ? '#4ade80' : 'rgba(245,245,245,.3)', marginTop: 2 }}>
          {isActive ? 'Ativa' : (campaign.status || 'ID: ' + campaign.id)}
        </div>
      </div>
      <select
        className="input"
        value={campaign.campaign_type || ''}
        onChange={e => onUpdate(campaign.id, 'campaign_type', e.target.value)}
        style={{ fontSize: '.8rem' }}
      >
        <option value="">— ignorar —</option>
        {campaignTypes.map(t => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>
      <input
        className="input"
        value={campaign.sheet_tab || ''}
        onChange={e => onUpdate(campaign.id, 'sheet_tab', e.target.value)}
        placeholder="Aba planilha"
        style={{ fontSize: '.8rem' }}
      />
    </div>
  )
}

/* ── AdsetRow ─────────────────────────────────────────────────────────────── */
function AdsetRow({ adset, idx, onChange, onRemove }) {
  const [expanded, setExpanded] = useState(!adset.adset_id)

  return (
    <div style={{ border: '1px solid rgba(245,245,245,.12)', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.75rem 1rem', background: 'rgba(245,245,245,.04)', cursor: 'pointer' }}
        onClick={() => setExpanded(e => !e)}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '.875rem', color: adset.label ? '#F5F5F5' : 'rgba(245,245,245,.35)' }}>
            {adset.label || 'Novo conjunto'}
          </div>
          {adset.adset_id && (
            <div style={{ fontSize: '.72rem', color: 'rgba(245,245,245,.4)', marginTop: 2, fontFamily: 'monospace' }}>
              ID: {adset.adset_id}
            </div>
          )}
        </div>
        <button className="btn-danger" style={{ fontSize: '.75rem', padding: '.2rem .6rem' }}
          onClick={e => { e.stopPropagation(); onRemove(idx) }}>
          Remover
        </button>
        <span style={{ color: 'rgba(245,245,245,.35)', fontSize: '.75rem' }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          <div className="field-row">
            <Field label="Nome / rótulo *" hint="Ex: Seminovos, Motos, Principal">
              <input className="input" value={adset.label}
                onChange={e => onChange(idx, 'label', e.target.value)} placeholder="Ex: Principal" />
            </Field>
            <Field label="ID do Conjunto (Meta)" hint="ID do Ad Set no Gerenciador de Anúncios">
              <input className="input" value={adset.adset_id}
                onChange={e => onChange(idx, 'adset_id', e.target.value)} placeholder="Ex: 120208320211450740" />
            </Field>
          </div>
          <div className="field-row">
            <Field label="Page ID" hint="ID da Página do Facebook">
              <input className="input" value={adset.page_id || ''}
                onChange={e => onChange(idx, 'page_id', e.target.value)} placeholder="Ex: 123456789012345" />
            </Field>
            <Field label="WhatsApp">
              <input className="input" value={adset.whatsapp || ''}
                onChange={e => onChange(idx, 'whatsapp', e.target.value)} placeholder="Ex: 5554999999999" />
            </Field>
          </div>
          <div className="field-row">
            <Field label="Instagram Actor ID">
              <input className="input" value={adset.instagram_actor_id || ''}
                onChange={e => onChange(idx, 'instagram_actor_id', e.target.value)} placeholder="Ex: 17841400000000000" />
            </Field>
            <Field label="Template Ad ID" hint="ID de anúncio com WABA para duplicar">
              <input className="input" value={adset.template_ad_id || ''}
                onChange={e => onChange(idx, 'template_ad_id', e.target.value)} placeholder="Opcional" />
            </Field>
          </div>
          <div className="field-row">
            <Field label="Formulário Instantâneo ID" hint="Preencha para campanhas de lead gen (formulário)">
              <input className="input" value={adset.lead_gen_form_id || ''}
                onChange={e => onChange(idx, 'lead_gen_form_id', e.target.value)} placeholder="Ex: 1234567890" />
            </Field>
          </div>

          <details style={{ fontSize: '.8rem' }}>
            <summary style={{ cursor: 'pointer', color: 'rgba(245,245,245,.4)', userSelect: 'none', padding: '.25rem 0' }}>
              Dados da loja (nome, endereço, telefone, site)
            </summary>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', marginTop: '.75rem' }}>
              <Field label="Nome da loja">
                <input className="input" value={adset.store_name || ''}
                  onChange={e => onChange(idx, 'store_name', e.target.value)} placeholder="Nome da loja" />
              </Field>
              <Field label="Descrição">
                <textarea className="input" rows={2} value={adset.store_description || ''}
                  onChange={e => onChange(idx, 'store_description', e.target.value)} style={{ resize: 'vertical' }} />
              </Field>
              <div className="field-row">
                <Field label="Endereço">
                  <input className="input" value={adset.store_address || ''}
                    onChange={e => onChange(idx, 'store_address', e.target.value)} />
                </Field>
                <Field label="Telefone loja">
                  <input className="input" value={adset.store_phone || ''}
                    onChange={e => onChange(idx, 'store_phone', e.target.value)} />
                </Field>
              </div>
              <div className="field-row">
                <Field label="WhatsApp exibição">
                  <input className="input" value={adset.store_whatsapp_display || ''}
                    onChange={e => onChange(idx, 'store_whatsapp_display', e.target.value)} />
                </Field>
                <Field label="Site">
                  <input className="input" value={adset.store_website || ''}
                    onChange={e => onChange(idx, 'store_website', e.target.value)} />
                </Field>
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  )
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function Section({ title, children }) {
  return (
    <div style={{ padding: '1rem', background: 'rgba(245,245,245,.04)', borderRadius: 8 }}>
      <div style={{ fontSize: '.875rem', fontWeight: 600, color: '#F5F5F5', marginBottom: '.75rem' }}>{title}</div>
      {children}
    </div>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', fontSize: '.875rem', color: 'rgba(245,245,245,.7)' }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      {label}
    </label>
  )
}

function Field({ label, hint, children }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      {hint && <div style={{ fontSize: '.7rem', color: 'rgba(245,245,245,.35)', marginBottom: '.25rem' }}>{hint}</div>}
      {children}
    </div>
  )
}
