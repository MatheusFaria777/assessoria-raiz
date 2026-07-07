import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { toast } from '../../lib/toast'

const DAYS = [
  { key: 'monday', label: 'Seg' }, { key: 'tuesday', label: 'Ter' },
  { key: 'wednesday', label: 'Qua' }, { key: 'thursday', label: 'Qui' },
  { key: 'friday', label: 'Sex' }, { key: 'saturday', label: 'Sáb' },
  { key: 'sunday', label: 'Dom' },
]

const PRIMARY_TYPES = new Set(['mensagem', 'lead', 'formulario'])

const EMPTY_ADSET = {
  label: '', adset_id: '', page_id: '', whatsapp: '',
  instagram_actor_id: '', store_name: '', store_description: '',
  store_address: '', store_phone: '', store_whatsapp_display: '',
  store_website: '', template_ad_id: '', lead_gen_form_id: '', active: true,
}

function parseDays(raw) {
  if (!raw) return []
  try { return JSON.parse(raw) } catch { return [] }
}

function parseGroupTabs(raw) {
  if (!raw) return {}
  try { return JSON.parse(raw) } catch { return {} }
}

// Mesma lógica do backend _detect_tipo
function detectGroup(name, groups) {
  if (!name.trim()) return null
  const lower = name.toLowerCase()
  let best = null, bestScore = 0
  for (const g of groups) {
    let kws = []
    try { kws = JSON.parse(g.keywords || '[]') } catch {}
    const tier = PRIMARY_TYPES.has(g.type) ? 2 : 1
    for (const kw of kws) {
      if (lower.includes(kw)) {
        const score = kw.length * tier
        if (score > bestScore) { bestScore = score; best = g }
      }
    }
  }
  return best
}

export default function ClientModal({ client, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: '', has_meta: false, meta_account_id: '', meta_access_token: '',
    has_google: false, google_customer_id: '',
    sheets_id: '', group_tabs: {}, report_days: [], campaign_group_ids: [],
    cadencia_ativa: true, cadencia_contexto: '',
  })
  const [adsets, setAdsets] = useState([])
  const [groups, setGroups] = useState([])
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('basico')
  const [testName, setTestName] = useState('')

  useEffect(() => {
    api.get('/api/campaign-groups/').then(setGroups).catch(() => {})
    if (client) {
      setForm({
        name: client.name || '',
        has_meta: client.has_meta || false,
        meta_account_id: client.meta_account_id || '',
        meta_access_token: '',
        has_google: client.has_google || false,
        google_customer_id: client.google_customer_id || '',
        sheets_id: client.sheets_id || '',
        group_tabs: parseGroupTabs(client.sheets_tabs),
        report_days: parseDays(client.report_days),
        campaign_group_ids: client.campaign_groups?.map(g => g.id) || [],
        cadencia_ativa: client.cadencia_ativa ?? true,
        cadencia_contexto: client.cadencia_contexto || '',
      })
      setAdsets(client.adsets?.map(a => ({ ...a })) || [])
    }
  }, [client])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleGroup = (g) => {
    const active = form.campaign_group_ids.includes(g.id)
    setForm(f => ({
      ...f,
      campaign_group_ids: active ? f.campaign_group_ids.filter(x => x !== g.id) : [...f.campaign_group_ids, g.id],
      group_tabs: active
        ? Object.fromEntries(Object.entries(f.group_tabs).filter(([k]) => k !== g.type))
        : f.group_tabs,
    }))
  }

  const toggleDay = (key) => {
    setForm(f => ({
      ...f,
      report_days: f.report_days.includes(key)
        ? f.report_days.filter(d => d !== key)
        : [...f.report_days, key],
    }))
  }

  // Adsets
  const addAdset = () => setAdsets(a => [...a, { ...EMPTY_ADSET, _new: Date.now() }])
  const removeAdset = (idx) => setAdsets(a => a.filter((_, i) => i !== idx))
  const setAdset = (idx, k, v) => setAdsets(a => a.map((x, i) => i === idx ? { ...x, [k]: v } : x))

  const save = async () => {
    if (!form.name.trim()) { toast('Nome é obrigatório', 'error'); return }
    setSaving(true)
    try {
      const sheetsTabsObj = {}
      for (const [type, tab] of Object.entries(form.group_tabs)) {
        if (tab?.trim()) sheetsTabsObj[type] = tab.trim()
      }

      // Mantém id para update in-place (preserva FK da upload_queue). Remove _new e client_id.
      const cleanAdsets = adsets.map(({ _new, client_id, ...rest }) => rest)

      const payload = {
        name: form.name,
        has_meta: form.has_meta,
        meta_account_id: form.meta_account_id,
        meta_access_token: form.meta_access_token || '',
        has_google: form.has_google,
        google_customer_id: form.google_customer_id,
        sheets_id: form.sheets_id,
        sheets_tabs: Object.keys(sheetsTabsObj).length ? JSON.stringify(sheetsTabsObj) : null,
        report_days: form.report_days.length ? JSON.stringify(form.report_days) : null,
        cadencia_ativa: form.cadencia_ativa,
        cadencia_contexto: form.cadencia_contexto || null,
        campaign_group_ids: form.campaign_group_ids,
        adsets: cleanAdsets,
      }

      if (client) {
        await api.put(`/api/clients/${client.id}`, payload)
        toast('Cliente atualizado')
      } else {
        await api.post('/api/clients/', payload)
        toast('Cliente criado')
      }
      onSaved()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const selectedGroups = groups.filter(g => form.campaign_group_ids.includes(g.id))
  const matchedGroup = detectGroup(testName, groups)

  const TABS = [
    { id: 'basico',    label: 'Dados' },
    { id: 'adsets',    label: `Conjuntos${adsets.length ? ` (${adsets.length})` : ''}` },
    { id: 'campanhas', label: 'Campanhas' },
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', marginTop: '.75rem' }}>
                  <Field label="Conta Meta (act_...)" hint="ID da conta de anúncios. Ex: act_123456789">
                    <input className="input" value={form.meta_account_id}
                      onChange={e => set('meta_account_id', e.target.value)} placeholder="act_123456789" />
                  </Field>
                  <Field label="Token de Acesso" hint="Deixe vazio para manter o token atual">
                    <input className="input" type="password" value={form.meta_access_token}
                      onChange={e => set('meta_access_token', e.target.value)}
                      placeholder="Deixe vazio para manter o atual" />
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

            <div>
              <label className="label" style={{ marginBottom: '.5rem' }}>Dias de Relatório Automático</label>
              <div style={{ display: 'flex', gap: '.375rem', flexWrap: 'wrap' }}>
                {DAYS.map(d => {
                  const active = form.report_days.includes(d.key)
                  return (
                    <button key={d.key} type="button" onClick={() => toggleDay(d.key)} style={{
                      padding: '.3rem .75rem', borderRadius: 999, border: '1px solid',
                      borderColor: active ? '#CBA135' : 'rgba(245,245,245,.2)',
                      background: active ? 'rgba(203,161,53,.2)' : 'transparent',
                      color: active ? '#CBA135' : 'rgba(245,245,245,.45)',
                      cursor: 'pointer', fontSize: '.8rem', fontWeight: active ? 600 : 400,
                    }}>
                      {d.label}
                    </button>
                  )
                })}
              </div>
              <div style={{ fontSize: '.72rem', color: 'rgba(245,245,245,.3)', marginTop: '.375rem' }}>
                Relatório gerado às 10h nos dias selecionados.
              </div>
            </div>

            <Section title="Cadência Semanal">
              <Toggle label="Ativo na cadência" checked={form.cadencia_ativa} onChange={v => set('cadencia_ativa', v)} />
              {form.cadencia_ativa && (
                <div style={{ marginTop: '.75rem' }}>
                  <Field label="Notas do cliente" hint="Contexto usado para personalizar as mensagens de segunda e quarta">
                    <textarea
                      className="input"
                      rows={3}
                      value={form.cadencia_contexto}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Grupos */}
            {groups.length > 0 && (
              <div>
                <label className="label" style={{ marginBottom: '.5rem' }}>Grupos de campanha associados</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.375rem' }}>
                  {groups.map(g => {
                    const active = form.campaign_group_ids.includes(g.id)
                    return (
                      <button key={g.id} type="button" onClick={() => toggleGroup(g)} style={{
                        padding: '.25rem .75rem', borderRadius: 999, border: `1px solid ${g.color}`,
                        background: active ? `${g.color}25` : 'transparent',
                        color: active ? g.color : 'rgba(245,245,245,.4)',
                        cursor: 'pointer', fontSize: '.75rem', fontWeight: active ? 600 : 400,
                      }}>
                        {g.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Testador de nomenclatura */}
            <div style={{ padding: '1rem', background: 'rgba(245,245,245,.04)', borderRadius: 8 }}>
              <label className="label" style={{ marginBottom: '.5rem' }}>
                Testador de nomenclatura
              </label>
              <div style={{ fontSize: '.75rem', color: 'rgba(245,245,245,.4)', marginBottom: '.75rem', lineHeight: 1.5 }}>
                Cole o nome exato de uma campanha para ver qual grupo o sistema identificaria.
              </div>
              <input className="input" value={testName} onChange={e => setTestName(e.target.value)}
                placeholder="Ex: [MKT] | Mensagem | Leads | Motocar | Nov25" />
              {testName.trim() && (
                <div style={{ marginTop: '.75rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                  {matchedGroup ? (
                    <>
                      <span style={{ fontSize: '.75rem', color: 'rgba(245,245,245,.4)' }}>Grupo identificado:</span>
                      <span style={{
                        padding: '.2rem .7rem', borderRadius: 999,
                        background: `${matchedGroup.color}25`, color: matchedGroup.color,
                        fontSize: '.8rem', fontWeight: 600, border: `1px solid ${matchedGroup.color}`,
                      }}>
                        {matchedGroup.name}
                      </span>
                      {!form.campaign_group_ids.includes(matchedGroup.id) && (
                        <span style={{ fontSize: '.72rem', color: '#c9745a' }}>
                          ⚠ esse grupo não está associado ao cliente
                        </span>
                      )}
                    </>
                  ) : (
                    <span style={{ fontSize: '.8rem', color: '#c9745a' }}>
                      Nenhum grupo identificado — a campanha seria ignorada nos relatórios.
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Keywords dos grupos selecionados */}
            {selectedGroups.length > 0 && (
              <div>
                <label className="label" style={{ marginBottom: '.5rem' }}>Palavras-chave por grupo</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                  {selectedGroups.map(g => {
                    let kws = []
                    try { kws = JSON.parse(g.keywords || '[]') } catch {}
                    return (
                      <div key={g.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '.75rem' }}>
                        <span style={{ minWidth: 140, fontSize: '.8rem', color: g.color, fontWeight: 600, paddingTop: 2 }}>
                          {g.name}
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.25rem' }}>
                          {kws.map(kw => (
                            <span key={kw} style={{
                              fontSize: '.7rem', padding: '.15rem .5rem', borderRadius: 4,
                              background: 'rgba(245,245,245,.08)', color: 'rgba(245,245,245,.6)',
                              fontFamily: 'monospace',
                            }}>
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div style={{ fontSize: '.72rem', color: 'rgba(245,245,245,.3)', marginTop: '.5rem' }}>
                  Para editar as palavras-chave, vá em Configurações → Grupos de Campanha.
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Planilha ── */}
        {tab === 'planilha' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Field label="ID da Planilha Google Sheets" hint="O ID fica na URL entre /d/ e /edit">
              <input className="input" value={form.sheets_id}
                onChange={e => set('sheets_id', e.target.value)}
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms" />
            </Field>

            {selectedGroups.length > 0 ? (
              <div>
                <label className="label" style={{ marginBottom: '.5rem' }}>Aba por grupo</label>
                <div style={{ fontSize: '.75rem', color: 'rgba(245,245,245,.4)', marginBottom: '.75rem', lineHeight: 1.5 }}>
                  Nome exato da aba no Google Sheets que receberá os dados de cada grupo. Deixe vazio para ignorar o grupo na sincronização.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                  {selectedGroups.map(g => (
                    <div key={g.id} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '.75rem', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: g.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '.875rem', color: 'rgba(245,245,245,.8)' }}>{g.name}</span>
                      </div>
                      <input className="input" style={{ fontSize: '.8rem' }}
                        value={form.group_tabs[g.type] || ''}
                        onChange={e => setForm(f => ({ ...f, group_tabs: { ...f.group_tabs, [g.type]: e.target.value } }))}
                        placeholder={`Nome da aba (ex: ${g.type.toUpperCase()})`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '.8rem', color: 'rgba(245,245,245,.3)', fontStyle: 'italic' }}>
                Selecione grupos de campanha na aba "Campanhas" para configurar as abas da planilha.
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

/* ── AdsetRow ─────────────────────────────────────────────────────────────── */
function AdsetRow({ adset, idx, onChange, onRemove }) {
  const [expanded, setExpanded] = useState(!adset.adset_id)

  return (
    <div style={{ border: '1px solid rgba(245,245,245,.12)', borderRadius: 8, overflow: 'hidden' }}>
      {/* Cabeçalho */}
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

      {/* Campos */}
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

          {/* Dados da loja (colapsáveis) */}
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
