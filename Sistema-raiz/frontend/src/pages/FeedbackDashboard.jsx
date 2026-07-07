import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { toast } from '../lib/toast'

const ANSWER_ORDER = [
  { key: 'tempo',             label: 'Tempo de cliente',           type: 'text' },
  { key: 'justPromotor',      label: 'O que mais agradou',         type: 'text' },
  { key: 'justDetrator',      label: 'O que não está bom',         type: 'text' },
  { key: 'atendimentoNota',   label: 'Nota do atendimento',        type: 'scale' },
  { key: 'atendimentoIssues', label: 'O que deixou a desejar',     type: 'array' },
  { key: 'mudarUmaCoisa',     label: 'O que mudaria no serviço',   type: 'text' },
  { key: 'sentirFalta',       label: 'O que sente falta',          type: 'text' },
  { key: 'entRelSemanal',     label: 'Relatório semanal',          type: 'scale' },
  { key: 'entRelMensal',      label: 'Relatório mensal',           type: 'scale' },
  { key: 'entReuniao',        label: 'Reunião de alinhamento',     type: 'scale' },
  { key: 'entTreinamento',    label: 'Treinamento comercial',      type: 'scale' },
  { key: 'indicacao',         label: 'Indicação',                  type: 'text' },
]

const COLORS = {
  card: 'rgba(245,245,245,.04)',
  border: 'rgba(245,245,245,.08)',
  gold: '#CBA135',
  white: '#F5F5F5',
  muted: 'rgba(245,245,245,.45)',
  green: '#4caf7d',
  yellow: '#e8b84b',
  red: '#e05252',
}

function npsColor(score) {
  if (score === null || score === undefined) return COLORS.muted
  if (score >= 9) return COLORS.green
  if (score >= 7) return COLORS.yellow
  return COLORS.red
}

function npsLabel(score) {
  if (score === null || score === undefined) return '—'
  if (score >= 9) return 'Promotor'
  if (score >= 7) return 'Neutro'
  return 'Detrator'
}

export default function FeedbackDashboard() {
  const [activeTab, setActiveTab] = useState('nps')  // 'nps' | 'gmn'
  const [view, setView] = useState('overview')   // 'overview' | 'client' | 'builder'
  const [overview, setOverview] = useState([])
  const [metrics, setMetrics]   = useState(null)
  const [gmbOverview, setGmbOverview] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [clientFeedbacks, setClientFeedbacks] = useState([])
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadOverview(); loadGmbOverview() }, [])

  async function loadGmbOverview() {
    try {
      const data = await api.get('/api/gmb/overview')
      setGmbOverview(data)
    } catch (e) { /* silencioso */ }
  }

  async function deleteNps(id) {
    if (!confirm('Excluir esta resposta?')) return
    try {
      await api.delete(`/api/feedback/response/${id}`)
      toast('Resposta excluída', 'success')
      if (selectedClient) {
        setClientFeedbacks(prev => prev.filter(f => f.id !== id))
      }
      loadOverview()
    } catch (e) { toast(e.message, 'error') }
  }

  async function deleteGmb(id) {
    if (!confirm('Excluir esta submissão?')) return
    try {
      await api.delete(`/api/gmb/submission/${id}`)
      toast('Submissão excluída', 'success')
      loadGmbOverview()
    } catch (e) { toast(e.message, 'error') }
  }

  async function loadOverview() {
    setLoading(true)
    try {
      const data = await api.get('/api/feedback/overview')
      setOverview(data.clients)
      setMetrics(data.metrics)
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  async function openClient(client) {
    setSelectedClient(client)
    setView('client')
    setSelectedFeedback(null)
    const data = await api.get(`/api/feedback/client/${client.client_id}`)
    setClientFeedbacks(data)
  }

  async function openBuilder() {
    setView('builder')
    const data = await api.get('/api/feedback/surveys')
    setSurveys(data)
  }

  async function generateInsights(clientId) {
    try {
      await api.post(`/api/feedback/client/${clientId}/insights`)
      toast('Insights em geração — aguarde alguns segundos', 'success')
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  function copyLink(slug) {
    const base = window.location.origin
    navigator.clipboard.writeText(`${base}/feedback?c=${slug}`)
    toast('Link copiado!', 'success')
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          {view !== 'overview' && (
            <button onClick={() => setView('overview')} style={backBtn}>← Voltar</button>
          )}
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: COLORS.white }}>
            {view === 'overview' && 'Formulários'}
            {view === 'client' && `${selectedClient?.client_name} — NPS`}
            {view === 'builder' && 'Editor de Formulário NPS'}
          </h1>
        </div>
        {view === 'overview' && activeTab === 'nps' && (
          <button onClick={openBuilder} style={btnSecondary}>Editar perguntas NPS</button>
        )}
        {view === 'client' && (
          <button onClick={() => generateInsights(selectedClient.client_id)} style={btnSecondary}>
            Gerar insights
          </button>
        )}
      </div>

      {/* Abas NPS / GMN */}
      {view === 'overview' && (
        <div style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 0 }}>
          {[['nps', '📊 NPS'], ['gmn', '📍 Google Meu Negócio']].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)}
              style={{ padding: '.625rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '.875rem', fontWeight: activeTab === id ? 600 : 400, color: activeTab === id ? COLORS.gold : COLORS.muted, borderBottom: `2px solid ${activeTab === id ? COLORS.gold : 'transparent'}`, marginBottom: -1, transition: 'all .15s' }}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Overview NPS */}
      {view === 'overview' && activeTab === 'nps' && (
        loading ? <p style={{ color: COLORS.muted }}>Carregando...</p> : (
          <>
            {/* Banner de métricas globais */}
            {metrics && metrics.total_responses > 0 && (
              <div style={{ ...card, marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '.375rem' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 700, color: npsColor(metrics.nps_global_avg), lineHeight: 1 }}>
                    {metrics.nps_global_avg ?? '—'}
                  </span>
                  <span style={{ fontSize: '.75rem', color: COLORS.muted }}>/10 NPS geral</span>
                </div>
                <div style={{ width: 1, height: 32, background: COLORS.border }} />
                <Stat label="Responderam" value={`${metrics.clients_responded} de ${metrics.clients_total}`} />
                <Stat label="Taxa" value={`${metrics.response_rate}%`} />
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontSize: '.68rem', color: COLORS.muted, marginBottom: '.375rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>Distribuição</div>
                  <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', gap: 2 }}>
                    {metrics.pct_promotores > 0 && <div style={{ flex: metrics.pct_promotores, background: COLORS.green, borderRadius: 4 }} />}
                    {metrics.pct_neutros > 0 && <div style={{ flex: metrics.pct_neutros, background: COLORS.yellow, borderRadius: 4 }} />}
                    {metrics.pct_detratores > 0 && <div style={{ flex: metrics.pct_detratores, background: COLORS.red, borderRadius: 4 }} />}
                  </div>
                  <div style={{ display: 'flex', gap: '.75rem', marginTop: '.375rem' }}>
                    <span style={{ fontSize: '.68rem', color: COLORS.green }}>{metrics.pct_promotores}% prom.</span>
                    <span style={{ fontSize: '.68rem', color: COLORS.yellow }}>{metrics.pct_neutros}% neutr.</span>
                    <span style={{ fontSize: '.68rem', color: COLORS.red }}>{metrics.pct_detratores}% detr.</span>
                  </div>
                </div>
              </div>
            )}

            {/* Grid de clientes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {overview.map(c => {
                const hasResponse = c.has_responded
                return (
                  <div key={c.client_id}
                    style={{ ...card, opacity: hasResponse ? 1 : 0.55, cursor: hasResponse ? 'pointer' : 'default', transition: 'border .15s, opacity .15s' }}
                    onClick={() => hasResponse && openClient(c)}
                    onMouseEnter={e => { if (hasResponse) e.currentTarget.style.borderColor = 'rgba(245,245,245,.2)' }}
                    onMouseLeave={e => { if (hasResponse) e.currentTarget.style.borderColor = COLORS.border }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.75rem' }}>
                      <span style={{ fontSize: '.9rem', fontWeight: 600, color: COLORS.white }}>{c.client_name}</span>
                      {hasResponse ? (
                        <span style={{ fontSize: '.7rem', padding: '2px 8px', borderRadius: 99, background: `${npsColor(c.nps_avg)}22`, color: npsColor(c.nps_avg), fontWeight: 600 }}>
                          {npsLabel(c.nps_avg)}
                        </span>
                      ) : (
                        <span style={{ fontSize: '.7rem', padding: '2px 8px', borderRadius: 99, background: 'rgba(245,245,245,.08)', color: COLORS.muted, fontWeight: 600 }}>
                          Aguardando
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1rem' }}>
                      <Stat label="NPS médio" value={c.nps_avg !== null ? c.nps_avg : '—'} color={hasResponse ? npsColor(c.nps_avg) : COLORS.muted} />
                      <Stat label="Respostas" value={c.response_count} />
                      <Stat label="Último" value={c.last_period ? c.last_period.replace('-', '/') : '—'} />
                    </div>
                    {c.feedback_slug && (
                      <button onClick={e => { e.stopPropagation(); copyLink(c.feedback_slug) }} style={btnSmall}>
                        Copiar link
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )
      )}

      {/* Overview GMN */}
      {view === 'overview' && activeTab === 'gmn' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {gmbOverview.map(c => (
              <div key={c.client_id} style={{ ...card, opacity: c.submitted ? 1 : 0.55 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.75rem' }}>
                  <span style={{ fontSize: '.9rem', fontWeight: 600, color: COLORS.white }}>{c.client_name}</span>
                  <span style={{ fontSize: '.7rem', padding: '2px 8px', borderRadius: 99, fontWeight: 600,
                    background: c.submitted ? 'rgba(76,175,125,.15)' : 'rgba(245,245,245,.08)',
                    color: c.submitted ? COLORS.green : COLORS.muted }}>
                    {c.submitted ? `✓ Preencheu` : 'Aguardando'}
                  </span>
                </div>
                {c.submitted && (
                  <div style={{ marginBottom: '.75rem' }}>
                    {c.submissions.map(s => (
                      <GmbSubmissionCard key={s.id} s={s} onDelete={() => deleteGmb(s.id)} />
                    ))}
                  </div>
                )}
                {c.feedback_slug && (
                  <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/gmb?c=${c.feedback_slug}`); toast('Link copiado!', 'success') }} style={btnSmall}>
                    Copiar link GMN
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Client detail */}
      {view === 'client' && (
        <div>
          {clientFeedbacks.length === 0 ? (
            <p style={{ color: COLORS.muted }}>Nenhuma resposta registrada.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {clientFeedbacks.map(f => (
                <div key={f.id} style={card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '.5rem' }}>
                    <div>
                      <span style={{ fontSize: '.9rem', fontWeight: 600, color: COLORS.white }}>
                        {f.respondent_name || 'Anônimo'} · {f.period?.replace('-', '/')}
                      </span>
                      <br />
                      <span style={{ fontSize: '.8rem', color: COLORS.muted }}>
                        {new Date(f.submitted_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <button onClick={() => deleteNps(f.id)} style={{ ...btnSmall, color: COLORS.red, borderColor: 'rgba(224,82,82,.3)', fontSize: '.72rem' }} title="Excluir resposta">✕ Excluir</button>
                    <div style={{
                      fontSize: '1.5rem', fontWeight: 700, color: npsColor(f.nps_score),
                      lineHeight: 1,
                    }}>
                      {f.nps_score !== null && f.nps_score !== undefined ? f.nps_score : '—'}
                      <span style={{ fontSize: '.75rem', color: COLORS.muted }}>/10</span>
                    </div>
                  </div>

                  {/* Respostas */}
                  {f.answers && Object.keys(f.answers).length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '.75rem', color: COLORS.gold, fontWeight: 600, marginBottom: '.5rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>Respostas</p>
                      {ANSWER_ORDER.map(({ key, label, type }) => {
                        const val = f.answers[key]
                        if (!val || val === '' || (Array.isArray(val) && val.length === 0)) return null
                        return (
                          <div key={key} style={{ marginBottom: '.625rem' }}>
                            <span style={{ fontSize: '.72rem', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>{label}</span>
                            {type === 'scale' ? (
                              <p style={{ fontSize: '.875rem', color: COLORS.white, marginTop: 2 }}>{val}/5</p>
                            ) : Array.isArray(val) ? (
                              <p style={{ fontSize: '.875rem', color: COLORS.white, marginTop: 2 }}>{val.join(', ')}</p>
                            ) : (
                              <p style={{ fontSize: '.875rem', color: COLORS.white, marginTop: 2, lineHeight: 1.5 }}>{val}</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Insights */}
                  {f.ai_summary && (
                    <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: '1rem', marginTop: '.5rem' }}>
                      <p style={{ fontSize: '.75rem', color: COLORS.gold, fontWeight: 600, marginBottom: '.75rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                        Insights gerados por IA
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <InsightBlock title="Pontos positivos" items={f.ai_summary.pontos_fortes} color={COLORS.green} />
                        <InsightBlock title="Pontos de atenção" items={f.ai_summary.pontos_de_dor} color={COLORS.red} />
                      </div>
                      {f.ai_summary.itens_de_acao?.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <p style={{ fontSize: '.8rem', color: COLORS.white, fontWeight: 600, marginBottom: '.5rem' }}>Itens de ação</p>
                          {f.ai_summary.itens_de_acao.map((a, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '.5rem', marginBottom: '.375rem' }}>
                              <span style={{
                                fontSize: '.65rem', padding: '2px 6px', borderRadius: 4,
                                background: a.prioridade === 'alta' ? `${COLORS.red}22` : a.prioridade === 'média' ? `${COLORS.yellow}22` : 'rgba(245,245,245,.08)',
                                color: a.prioridade === 'alta' ? COLORS.red : a.prioridade === 'média' ? COLORS.yellow : COLORS.muted,
                                fontWeight: 600, flexShrink: 0, marginTop: 2,
                              }}>{a.prioridade}</span>
                              <span style={{ fontSize: '.875rem', color: COLORS.white }}>{a.acao}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {f.ai_summary.followup_whatsapp && (
                        <div style={{ background: 'rgba(245,245,245,.04)', borderRadius: 8, padding: '.75rem' }}>
                          <p style={{ fontSize: '.75rem', color: COLORS.muted, marginBottom: '.375rem' }}>Sugestão de follow-up</p>
                          <p style={{ fontSize: '.875rem', color: COLORS.white, lineHeight: 1.5 }}>{f.ai_summary.followup_whatsapp}</p>
                          <button
                            onClick={() => { navigator.clipboard.writeText(f.ai_summary.followup_whatsapp); toast('Copiado!', 'success') }}
                            style={{ ...btnSmall, marginTop: '.5rem' }}
                          >Copiar</button>
                        </div>
                      )}
                    </div>
                  )}

                  {!f.ai_summary && (
                    <p style={{ fontSize: '.8rem', color: COLORS.muted, marginTop: '.5rem' }}>
                      Insights ainda não gerados. Clique em "Gerar insights" acima.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Survey Builder */}
      {view === 'builder' && (
        <SurveyBuilder surveys={surveys} onRefresh={async () => {
          const data = await api.get('/api/feedback/surveys')
          setSurveys(data)
        }} />
      )}
    </div>
  )
}

function SurveyBuilder({ surveys, onRefresh }) {
  const [editing, setEditing] = useState(null)  // survey being edited
  const [saving, setSaving] = useState(false)

  const activeSurvey = surveys.find(s => s.is_active)

  async function activate(id) {
    await api.post(`/api/feedback/surveys/${id}/activate`)
    toast('Formulário ativado', 'success')
    onRefresh()
  }

  async function save() {
    setSaving(true)
    try {
      if (editing.id) {
        await api.put(`/api/feedback/surveys/${editing.id}`, { name: editing.name, questions: editing.questions })
      } else {
        await api.post('/api/feedback/surveys', { name: editing.name, questions: editing.questions })
      }
      toast('Salvo com sucesso', 'success')
      setEditing(null)
      onRefresh()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  function addQuestion(survey) {
    const newQ = { id: `q_${Date.now()}`, type: 'textarea', label: '', required: false }
    setEditing({ ...survey, questions: [...survey.questions, newQ] })
  }

  function updateQuestion(survey, idx, field, value) {
    const qs = survey.questions.map((q, i) => i === idx ? { ...q, [field]: value } : q)
    setEditing({ ...survey, questions: qs })
  }

  function removeQuestion(survey, idx) {
    setEditing({ ...survey, questions: survey.questions.filter((_, i) => i !== idx) })
  }

  function moveQuestion(survey, idx, dir) {
    const qs = [...survey.questions]
    const swap = idx + dir
    if (swap < 0 || swap >= qs.length) return
    ;[qs[idx], qs[swap]] = [qs[swap], qs[idx]]
    setEditing({ ...survey, questions: qs })
  }

  if (editing) return (
    <div>
      <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <button onClick={() => setEditing(null)} style={backBtn}>← Cancelar</button>
        <input
          value={editing.name}
          onChange={e => setEditing({ ...editing, name: e.target.value })}
          style={{ ...input, flex: 1, maxWidth: 320 }}
          placeholder="Nome do formulário"
        />
        <button onClick={save} disabled={saving} style={btnPrimary}>{saving ? 'Salvando...' : 'Salvar'}</button>
      </div>

      {editing.questions.map((q, idx) => (
        <div key={q.id} style={{ ...card, marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <input
                value={q.label}
                onChange={e => updateQuestion(editing, idx, 'label', e.target.value)}
                placeholder="Texto da pergunta"
                style={{ ...input, marginBottom: '.5rem' }}
              />
              <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                <select value={q.type} onChange={e => updateQuestion(editing, idx, 'type', e.target.value)} style={selectStyle}>
                  <option value="nps">NPS (0–10)</option>
                  <option value="textarea">Texto longo</option>
                  <option value="text">Texto curto</option>
                  <option value="select">Seleção</option>
                </select>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.8rem', color: COLORS.muted, cursor: 'pointer' }}>
                  <input type="checkbox" checked={!!q.required} onChange={e => updateQuestion(editing, idx, 'required', e.target.checked)} />
                  Obrigatória
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.8rem', color: COLORS.muted, cursor: 'pointer' }}>
                  <input type="checkbox" checked={!!q.is_nps} onChange={e => updateQuestion(editing, idx, 'is_nps', e.target.checked)} />
                  É a pergunta de NPS
                </label>
              </div>
              <div style={{ marginTop: '.5rem' }}>
                <input
                  value={q.show_if ? JSON.stringify(q.show_if) : ''}
                  onChange={e => {
                    try { updateQuestion(editing, idx, 'show_if', e.target.value ? JSON.parse(e.target.value) : null) } catch {}
                  }}
                  placeholder='Condicional (JSON): {"field":"nps","operator":"lte","value":8}'
                  style={{ ...input, fontSize: '.78rem', color: COLORS.muted }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <button onClick={() => moveQuestion(editing, idx, -1)} style={iconBtn} title="Subir">↑</button>
              <button onClick={() => moveQuestion(editing, idx, 1)} style={iconBtn} title="Descer">↓</button>
              <button onClick={() => removeQuestion(editing, idx)} style={{ ...iconBtn, color: COLORS.red }} title="Remover">×</button>
            </div>
          </div>
        </div>
      ))}
      <button onClick={() => addQuestion(editing)} style={btnSecondary}>+ Adicionar pergunta</button>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button onClick={() => setEditing({ id: null, name: 'Novo formulário', questions: [] })} style={btnSecondary}>
          + Novo formulário
        </button>
      </div>
      {surveys.map(s => (
        <div key={s.id} style={{ ...card, marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.75rem' }}>
            <div>
              <span style={{ fontSize: '.95rem', fontWeight: 600, color: COLORS.white }}>{s.name}</span>
              {s.is_active && <span style={{ marginLeft: '.5rem', fontSize: '.7rem', color: COLORS.green, fontWeight: 600 }}>● ATIVO</span>}
            </div>
            <div style={{ display: 'flex', gap: '.5rem' }}>
              <button onClick={() => setEditing({ ...s })} style={btnSmall}>Editar</button>
              {!s.is_active && <button onClick={() => activate(s.id)} style={btnSmall}>Ativar</button>}
            </div>
          </div>
          <p style={{ fontSize: '.8rem', color: COLORS.muted }}>{s.questions.length} pergunta(s)</p>
        </div>
      ))}
    </div>
  )
}

function InsightBlock({ title, items, color }) {
  if (!items?.length) return null
  return (
    <div>
      <p style={{ fontSize: '.75rem', color, fontWeight: 600, marginBottom: '.375rem' }}>{title}</p>
      {items.map((item, i) => (
        <p key={i} style={{ fontSize: '.8rem', color: COLORS.white, lineHeight: 1.5, marginBottom: '.25rem' }}>· {item}</p>
      ))}
    </div>
  )
}

const GMB_LABELS = {
  responsavel: 'Responsável', telefone: 'Telefone', endereco: 'Endereço',
  areas_cobertura: 'Áreas de cobertura', empreendedor: 'Empreendedor', data_abertura: 'Abertura',
  instagram: 'Instagram', site: 'Site', facebook: 'Facebook',
  dias_funcionamento: 'Dias de funcionamento', horario: 'Horário', horario_feriados: 'Horário feriados',
  acessibilidade: 'Acessibilidade', estacionamento: 'Estacionamento', pagamentos: 'Pagamentos',
  descricao: 'Descrição', servicos: 'Serviços/produtos', faq: 'Perguntas frequentes',
}

function GmbSubmissionCard({ s, onDelete }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: 'rgba(245,245,245,.04)', borderRadius: 8, marginBottom: '.5rem', border: `1px solid ${COLORS.border}` }}>
      <div style={{ padding: '.625rem .75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '.85rem', color: COLORS.white, fontWeight: 500 }}>{s.company_name || s.respondent_name}</div>
          <div style={{ fontSize: '.72rem', color: COLORS.muted }}>{new Date(s.submitted_at).toLocaleDateString('pt-BR')}</div>
        </div>
        <div style={{ display: 'flex', gap: '.375rem' }}>
          <button onClick={() => setOpen(o => !o)} style={btnSmall}>{open ? 'Fechar' : 'Ver respostas'}</button>
          {s.drive_folder_url && (
            <a href={s.drive_folder_url} target="_blank" rel="noreferrer"
              style={{ ...btnSmall, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, color: '#4caf7d', borderColor: 'rgba(76,175,125,.3)' }}>
              📁 Pasta no Drive</a>
          )}
          <button onClick={onDelete} style={{ ...btnSmall, color: COLORS.red, borderColor: 'rgba(224,82,82,.3)' }}>✕</button>
        </div>
      </div>
      {open && s.form_data && (
        <div style={{ padding: '.75rem', borderTop: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
          {Object.entries(s.form_data).filter(([k]) => k !== 'nome_empresa').map(([key, val]) => {
            if (!val || (Array.isArray(val) && val.length === 0)) return null
            const label = GMB_LABELS[key] || key
            const display = Array.isArray(val) ? val.join(', ') : val
            return (
              <div key={key}>
                <div style={{ fontSize: '.68rem', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: '.82rem', color: COLORS.white, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{display}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: '1rem', fontWeight: 700, color: color || COLORS.white }}>{value}</div>
      <div style={{ fontSize: '.68rem', color: COLORS.muted }}>{label}</div>
    </div>
  )
}

const card = {
  background: COLORS.card, borderRadius: 10, padding: '1.25rem',
  border: `1px solid ${COLORS.border}`,
}
const backBtn = {
  background: 'transparent', border: `1px solid ${COLORS.border}`, borderRadius: 6,
  color: COLORS.muted, fontSize: '.8rem', padding: '.35rem .75rem', cursor: 'pointer',
}
const btnSecondary = {
  background: 'rgba(245,245,245,.06)', border: `1px solid ${COLORS.border}`, borderRadius: 7,
  color: COLORS.white, fontSize: '.8rem', padding: '.45rem .9rem', cursor: 'pointer',
}
const btnPrimary = {
  background: COLORS.gold, border: 'none', borderRadius: 7,
  color: '#1a1a1a', fontSize: '.8rem', fontWeight: 700, padding: '.45rem .9rem', cursor: 'pointer',
}
const btnSmall = {
  background: 'rgba(245,245,245,.06)', border: `1px solid ${COLORS.border}`, borderRadius: 6,
  color: COLORS.muted, fontSize: '.75rem', padding: '.3rem .65rem', cursor: 'pointer',
}
const iconBtn = {
  background: 'transparent', border: `1px solid ${COLORS.border}`, borderRadius: 5,
  color: COLORS.muted, fontSize: '.8rem', width: 28, height: 28, cursor: 'pointer', padding: 0,
}
const input = {
  width: '100%', padding: '.6rem .75rem', borderRadius: 7, border: `1px solid ${COLORS.border}`,
  background: 'rgba(245,245,245,.05)', color: COLORS.white, fontSize: '.85rem',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
}
const selectStyle = {
  padding: '.35rem .6rem', borderRadius: 6, border: `1px solid ${COLORS.border}`,
  background: 'rgba(245,245,245,.05)', color: COLORS.white, fontSize: '.78rem', cursor: 'pointer',
}
