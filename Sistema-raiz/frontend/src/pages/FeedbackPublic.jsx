import { useState, useEffect } from 'react'

const T = {
  bg:       '#1d2b27',
  bg2:      '#233331',
  card:     '#2a3b37',
  card2:    '#324642',
  line:     '#3d524d',
  lineSoft: '#34453f',
  cream:    '#f3e6bd',
  muted:    '#a9b8b0',
  dim:      '#7c8e85',
  gold:     '#d4b87a',
  red:      '#c9745a',
  green:    '#8fb37a',
  serif:    '"Cormorant Garamond", Georgia, serif',
  sans:     '"Manrope", -apple-system, sans-serif',
  mono:     '"JetBrains Mono", ui-monospace, monospace',
}

const npsColor = n => n == null ? T.dim : n <= 6 ? T.red : n <= 8 ? T.gold : T.green

const buildSteps = nps => [
  'welcome', 'identification', 'nps',
  nps != null && nps <= 7 ? 'detrator' : 'promotor',
  'deliverables', 'service', 'final', 'thanks',
]

const STEP_META = {
  welcome:        { num: null, total: 6, label: 'Início' },
  identification: { num: 1,   total: 6, label: 'Quem é você' },
  nps:            { num: 2,   total: 6, label: 'NPS' },
  detrator:       { num: 3,   total: 6, label: 'Justificativa' },
  promotor:       { num: 3,   total: 6, label: 'Justificativa' },
  deliverables:   { num: 4,   total: 6, label: 'Entregáveis' },
  service:        { num: 5,   total: 6, label: 'Atendimento' },
  final:          { num: 6,   total: 6, label: 'Finais' },
  thanks:         { num: null, total: 6, label: 'Concluído' },
}

const QUOTES = {
  welcome:        { eyebrow: 'Assessoria Raiz',  line: 'Cuidamos da raiz para a árvore florescer.' },
  identification: { eyebrow: 'Antes de tudo',    line: 'Quem está do outro lado importa.' },
  nps:            { eyebrow: 'Sua nota',          line: 'Uma só pergunta. Muita verdade.' },
  detrator:       { eyebrow: 'Honestidade',       line: 'O que dói pra você, dói pra gente. Vamos consertar.' },
  promotor:       { eyebrow: 'Confiança',         line: 'Continuar fazendo bem feito é um trabalho diário.' },
  deliverables:   { eyebrow: 'Entregáveis',       line: 'Cada entrega só vale se você usa pra decidir.' },
  service:        { eyebrow: 'Atendimento',       line: 'Estar perto é parte do serviço.' },
  final:          { eyebrow: 'Última parada',     line: 'O que você mudaria? Diz aí.' },
  thanks:         { eyebrow: 'Gratidão',          line: 'Obrigado — sua resposta vai mover decisões.' },
}

function validate(step, d) {
  if (step === 'identification') {
    if (!d.nome || d.nome.trim().length < 2) return 'Informe seu nome.'
    if (!d.tempo) return 'Selecione há quanto tempo você é cliente.'
  }
  if (step === 'nps' && d.nps == null) return 'Escolha uma nota de 0 a 10.'
  if (step === 'detrator' && (!d.justDetrator || d.justDetrator.trim().length < 5))
    return 'Conta pra gente — qualquer detalhe ajuda.'
  if (step === 'promotor' && (!d.justPromotor || d.justPromotor.trim().length < 5))
    return 'Conta pra gente o que tem funcionado.'
  if (step === 'deliverables') {
    if (!d.entRelSemanal || !d.entRelMensal || !d.entReuniao || !d.entTreinamento)
      return 'Avalie todos os entregáveis antes de continuar.'
  }
  if (step === 'service') {
    if (!d.atendimentoNota) return 'Dê uma nota ao atendimento.'
    if (d.atendimentoIssues.length === 0 && !d.atendimentoOutro)
      return 'Marque ao menos uma opção (ou "Nada a reclamar").'
  }
  return null
}

export default function FeedbackPublic({ slug }) {
  const [clientName, setClientName] = useState('')
  const [loadError, setLoadError]   = useState(null)
  const [loading, setLoading]       = useState(true)
  const [data, setData] = useState({
    nome: '', tempo: null,
    nps: null,
    justDetrator: '', justPromotor: '', indicacao: '',
    entRelSemanal: null, entRelMensal: null, entReuniao: null, entTreinamento: null,
    atendimentoNota: null, atendimentoIssues: [], atendimentoOutro: '',
    mudarUmaCoisa: '', sentirFalta: '',
  })
  const [stepIdx, setStepIdx]       = useState(0)
  const [error, setError]           = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    document.body.style.background = '#1d2b27'
    document.body.style.minHeight  = '100vh'
  }, [])

  useEffect(() => {
    if (!slug) { setLoadError('Link inválido.'); setLoading(false); return }
    fetch(`/api/feedback/form/${slug}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setClientName(d.client_name); setLoading(false) })
      .catch(() => { setLoadError('Formulário não encontrado.'); setLoading(false) })
  }, [slug])

  const steps   = buildSteps(data.nps)
  const stepKey = steps[stepIdx]
  const update  = patch => { setData(d => ({ ...d, ...patch })); setError(null) }

  const goNext = async () => {
    const err = validate(stepKey, data)
    if (err) { setError(err); return }
    setError(null)
    if (stepKey === 'final') {
      setSubmitting(true)
      try {
        const res = await fetch(`/api/feedback/submit/${slug}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ respondent_name: data.nome || null, answers: data }),
        })
        if (!res.ok) throw new Error()
        setStepIdx(i => i + 1)
      } catch {
        setError('Erro ao enviar. Verifique sua conexão e tente novamente.')
      } finally {
        setSubmitting(false)
      }
      return
    }
    setStepIdx(i => Math.min(i + 1, steps.length - 1))
    window.scrollTo(0, 0)
  }

  const goBack = () => {
    setError(null)
    setStepIdx(i => Math.max(i - 1, 0))
    window.scrollTo(0, 0)
  }

  if (loading)   return <Screen><p style={{ color: T.muted, fontFamily: T.sans }}>Carregando…</p></Screen>
  if (loadError) return <Screen><p style={{ color: T.red,  fontFamily: T.sans }}>{loadError}</p></Screen>

  const isWelcome = stepKey === 'welcome'
  const isThanks  = stepKey === 'thanks'
  const q         = QUOTES[stepKey] || QUOTES.welcome

  return (
    <div className="pub-layout">
      {/* Painel lateral — só desktop */}
      <div className="pub-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <LogoMark size={48} />
          <div>
            <div style={{ fontFamily: T.serif, fontSize: 22, color: T.cream, lineHeight: 1 }}>RAIZ</div>
            <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: T.dim, marginTop: 4 }}>Assessoria</div>
          </div>
        </div>

        <div>
          <div style={eyebrow}>{q.eyebrow}</div>
          <div style={{ fontFamily: T.serif, fontSize: 'clamp(26px,2.5vw,34px)', lineHeight: 1.18, fontStyle: 'italic', color: T.cream, maxWidth: 360 }}>
            "{q.line}"
          </div>
        </div>

        <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.dim, display: 'flex', justifyContent: 'space-between' }}>
          <span>Pesquisa NPS</span><span>v · 2026</span>
        </div>
      </div>

      {/* Área do formulário */}
      <div className="pub-form-area">
        <div className="pub-form-inner">
          {/* Logo mobile */}
          {!isThanks && (
            <div className="pub-mobile-logo">
              <LogoMark size={34} />
              <span style={{ fontFamily: T.serif, fontSize: 18, color: T.cream }}>RAIZ</span>
              <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: T.dim }}>Assessoria</span>
            </div>
          )}

          {!isWelcome && !isThanks && <ProgressRail stepKey={stepKey} />}

          {stepKey === 'welcome'        && <WelcomeScreen clientName={clientName} onStart={goNext} />}
          {stepKey === 'identification' && <IdentificationScreen data={data} update={update} />}
          {stepKey === 'nps'            && <NPSScreen data={data} update={update} />}
          {stepKey === 'detrator'       && <DetractorScreen data={data} update={update} />}
          {stepKey === 'promotor'       && <PromoterScreen data={data} update={update} />}
          {stepKey === 'deliverables'   && <DeliverablesScreen data={data} update={update} />}
          {stepKey === 'service'        && <ServiceScreen data={data} update={update} />}
          {stepKey === 'final'          && <FinalScreen data={data} update={update} />}
          {stepKey === 'thanks'         && <ThankYouScreen data={data} />}

          {!isWelcome && !isThanks && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 36, paddingTop: 24, borderTop: `1px solid ${T.lineSoft}`, gap: 16, flexWrap: 'wrap' }}>
              <GhostBtn onClick={goBack}>← Voltar</GhostBtn>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {error && <span style={{ fontFamily: T.mono, fontSize: 12, color: T.red, maxWidth: 240, textAlign: 'right' }}>↳ {error}</span>}
                <PrimaryBtn onClick={goNext} disabled={submitting}>
                  {submitting ? 'Enviando…' : stepKey === 'final' ? 'Enviar respostas →' : 'Continuar →'}
                </PrimaryBtn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Screens ────────────────────────────────────────────────────────────── */

function WelcomeScreen({ clientName, onStart }) {
  return (
    <div style={{ fontFamily: T.sans }}>
      <div style={eyebrow}>Pesquisa de satisfação · 2026</div>
      <h1 style={{ fontFamily: T.serif, fontSize: 'clamp(36px,5vw,52px)', lineHeight: 1.05, margin: '0 0 20px', fontWeight: 500, color: T.cream }}>
        Sua opinião é a base do<br/>
        <em style={{ color: T.gold, fontStyle: 'italic' }}>que cultivamos.</em>
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.6, color: T.muted, maxWidth: 520, marginBottom: 32 }}>
        {clientName && <><strong style={{ color: T.cream }}>{clientName}</strong>, essa</>} pesquisa leva menos de{' '}
        <strong style={{ color: T.cream }}>3 minutos</strong> e nos ajuda a entender o que está funcionando e o que podemos melhorar no seu atendimento.
      </p>
      <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', padding: '16px 0', borderTop: `1px solid ${T.lineSoft}`, borderBottom: `1px solid ${T.lineSoft}`, marginBottom: 32 }}>
        <MetaItem label="Duração" value="3 min" />
        <MetaItem label="Perguntas" value="12" />
      </div>
      <PrimaryBtn onClick={onStart}>Começar a pesquisa →</PrimaryBtn>
    </div>
  )
}

function IdentificationScreen({ data, update }) {
  return (
    <div>
      <SH eyebrow="Seção 1 · Quem é você" title="Antes de começar"
        desc="Uma pergunta só pra conseguirmos relacionar sua resposta ao atendimento." />
      <Field label="Seu nome" required>
        <TInput value={data.nome} onChange={v => update({ nome: v })} placeholder="Nome e sobrenome" />
      </Field>
      <Field label="Há quanto tempo você é nosso cliente?" required>
        <RadioList
          options={['Menos de 1 mês', '1 a 3 meses', '3 a 6 meses', 'Mais de 6 meses', 'Mais de 12 meses']}
          value={data.tempo} onChange={v => update({ tempo: v })}
        />
      </Field>
    </div>
  )
}

function NPSScreen({ data, update }) {
  return (
    <div>
      <SH eyebrow="Seção 2 · NPS" title="A pergunta de ouro"
        desc="Em uma escala de 0 a 10, qual a probabilidade de você recomendar nossos serviços para um amigo ou colega?" />
      <Field label="Sua nota" required hint="0 = Nada provável · 10 = Extremamente provável">
        <NPSScale value={data.nps} onChange={v => update({ nps: v })} />
      </Field>
    </div>
  )
}

function DetractorScreen({ data, update }) {
  return (
    <div>
      <SH eyebrow="Seção 3 · Justificativa"
        title={<>Conta pra gente o que <em style={{ color: T.red, fontStyle: 'italic' }}>não</em> está bom.</>}
        desc="Sua resposta vai direto para a nossa esteira de melhoria. Quanto mais específico, melhor." />
      <Field label="O que te levou a dar essa nota?" required>
        <TArea value={data.justDetrator} onChange={v => update({ justDetrator: v })}
          placeholder="Pode ser sobre prazo, comunicação, resultado, qualidade do material, qualquer coisa…" rows={6} />
      </Field>
    </div>
  )
}

function PromoterScreen({ data, update }) {
  return (
    <div>
      <SH eyebrow="Seção 3 · Justificativa"
        title={<>Que bom que está dando <em style={{ color: T.green, fontStyle: 'italic' }}>certo.</em></>}
        desc="Conta o que mais te agradou — isso nos ajuda a continuar fazendo bem feito." />
      <Field label="O que te levou a dar essa nota?" required>
        <TArea value={data.justPromotor} onChange={v => update({ justPromotor: v })}
          placeholder="O que tem funcionado bem pra você?" rows={5} />
      </Field>
      <Field label="Você conhece algum empresário que poderia se beneficiar do nosso serviço?"
        hint="Opcional — se quiser nos indicar alguém, deixa o nome e contato.">
        <TArea value={data.indicacao} onChange={v => update({ indicacao: v })}
          placeholder="Nome · contato · um pouco do contexto" rows={3} />
      </Field>
    </div>
  )
}

function DeliverablesScreen({ data, update }) {
  const items = [
    { key: 'entRelSemanal',  label: 'Relatório semanal de performance' },
    { key: 'entRelMensal',   label: 'Relatório mensal consolidado' },
    { key: 'entReuniao',     label: 'Reunião mensal de alinhamento' },
    { key: 'entTreinamento', label: 'Treinamento comercial' },
  ]
  return (
    <div>
      <SH eyebrow="Seção 4 · Entregáveis" title="O que está te ajudando a decidir?"
        desc="Para cada item abaixo, avalie o quanto ele te ajuda a entender e tomar decisões no seu negócio." />
      {items.map(it => (
        <Field key={it.key} label={it.label} required>
          <Scale5 value={data[it.key]} onChange={v => update({ [it.key]: v })} leftLabel="Não ajuda nada" rightLabel="Essencial pra mim" />
        </Field>
      ))}
    </div>
  )
}

function ServiceScreen({ data, update }) {
  const issues = [
    'Tempo de resposta nas mensagens',
    'Clareza nas explicações',
    'Proatividade (avisos e sugestões sem eu precisar perguntar)',
    'Disponibilidade nos momentos que precisei',
    'Nada a reclamar',
  ]
  return (
    <div>
      <SH eyebrow="Seção 5 · Atendimento" title="Como tem sido falar com a gente?" />
      <Field label="Como você avalia nosso atendimento no geral?" required>
        <Scale5 value={data.atendimentoNota} onChange={v => update({ atendimentoNota: v })} leftLabel="Muito ruim" rightLabel="Excelente" />
      </Field>
      <Field label="Se houve algo que deixou a desejar no atendimento, o que foi?" required hint="Pode marcar mais de um.">
        <MultiCheck options={issues} value={data.atendimentoIssues}
          onChange={v => update({ atendimentoIssues: v })}
          allowOther otherValue={data.atendimentoOutro}
          onOtherChange={v => update({ atendimentoOutro: v })} />
      </Field>
    </div>
  )
}

function FinalScreen({ data, update }) {
  return (
    <div>
      <SH eyebrow="Seção 6 · Perguntas finais" title="Última pergunta, prometido."
        desc="Suas respostas vão moldar o que a gente vai mudar nos próximos meses." />
      <Field label="Se você pudesse mudar uma coisa no nosso serviço hoje, o que seria?">
        <TArea value={data.mudarUmaCoisa} onChange={v => update({ mudarUmaCoisa: v })}
          placeholder="Pode ser pequeno ou grande — escreve do jeito que vier." rows={4} />
      </Field>
      <Field label="Tem algum tipo de informação, relatório ou suporte que você sente falta hoje?">
        <TArea value={data.sentirFalta} onChange={v => update({ sentirFalta: v })}
          placeholder="Algo que ajudaria você a decidir melhor, e que hoje a gente não entrega?" rows={4} />
      </Field>
    </div>
  )
}

function ThankYouScreen({ data }) {
  const nps = data.nps
  const bucket = nps == null ? null : nps <= 6 ? 'detrator' : nps <= 8 ? 'neutro' : 'promotor'
  const copy = {
    detrator: 'Sua nota indica que temos coisas a melhorar — e isso é exatamente o que vamos atacar.',
    neutro:   'Sua nota nos diz que estamos no caminho, mas tem espaço pra crescer junto com você.',
    promotor: 'Sua nota nos motiva a continuar entregando com cuidado — obrigado pela confiança.',
  }
  return (
    <div style={{ textAlign: 'center', padding: '20px 0', fontFamily: T.sans }}>
      <div style={{ width: 64, height: 64, margin: '0 auto 28px', borderRadius: '50%', background: 'rgba(212,184,122,.15)', border: `1px solid ${T.gold}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
          <path d="M6 14.5L11.5 20L22 8.5" stroke={T.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={eyebrow}>Recebido com cuidado</div>
      <h1 style={{ fontFamily: T.serif, fontSize: 'clamp(32px,4.5vw,48px)', lineHeight: 1.1, margin: '0 0 18px', fontWeight: 500, color: T.cream }}>
        Obrigado{data.nome ? `, ${data.nome.split(' ')[0]}` : ' pelo seu tempo'}.
      </h1>
      <p style={{ color: T.muted, fontSize: 16, lineHeight: 1.6, maxWidth: 460, margin: '0 auto 28px' }}>
        {bucket ? copy[bucket] : 'Suas respostas foram registradas — vamos lê-las com calma.'}
      </p>
      {nps != null && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, padding: '14px 22px', background: T.card, border: `1px solid ${T.line}`, borderRadius: 999, marginBottom: 28 }}>
          <span style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.dim }}>Sua nota</span>
          <span style={{ fontFamily: T.serif, fontSize: 28, color: npsColor(nps), lineHeight: 1, fontWeight: 600 }}>{nps}</span>
        </div>
      )}
      {nps != null && nps >= 8 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ color: T.muted, fontSize: 14, marginBottom: 12 }}>
            Que tal deixar uma avaliação no Google também? Leva menos de 1 minuto.
          </p>
          <a href="https://g.page/r/CZRm83qzLiGkEBM/review" target="_blank" rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, background: T.gold, color: '#1d2b27', fontFamily: T.sans, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
            ⭐ Avaliar no Google
          </a>
        </div>
      )}
    </div>
  )
}

/* ─── Controls ───────────────────────────────────────────────────────────── */

function SH({ eyebrow: ey, title, desc }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={eyebrow}>{ey}</div>
      <h2 style={{ fontFamily: T.serif, fontSize: 'clamp(26px,3.5vw,36px)', lineHeight: 1.1, margin: '0 0 10px', fontWeight: 500, color: T.cream }}>{title}</h2>
      {desc && <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.55, margin: 0, maxWidth: 560, fontFamily: T.sans }}>{desc}</p>}
    </div>
  )
}

function Field({ label, required, hint, children }) {
  return (
    <label style={{ display: 'block', marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8, fontSize: 15, fontWeight: 500, color: T.cream, fontFamily: T.sans }}>
        <span>{label}</span>
        {required && <span style={{ color: T.gold, fontSize: 13 }}>*</span>}
      </div>
      {hint && <div style={{ color: T.muted, fontSize: 13, marginBottom: 10, lineHeight: 1.45, fontFamily: T.sans }}>{hint}</div>}
      {children}
    </label>
  )
}

function TInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', padding: '14px 16px', background: T.card, border: `1px solid ${T.line}`, borderRadius: 12, color: T.cream, fontSize: 16, outline: 'none', fontFamily: T.sans, boxSizing: 'border-box', WebkitAppearance: 'none' }}
      onFocus={e => { e.target.style.borderColor = T.gold; e.target.style.background = T.card2 }}
      onBlur={e  => { e.target.style.borderColor = T.line; e.target.style.background = T.card }}
    />
  )
}

function TArea({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea value={value || ''} rows={rows} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', padding: '14px 16px', background: T.card, border: `1px solid ${T.line}`, borderRadius: 12, color: T.cream, fontSize: 16, outline: 'none', resize: 'vertical', minHeight: 100, lineHeight: 1.55, fontFamily: T.sans, boxSizing: 'border-box', WebkitAppearance: 'none' }}
      onFocus={e => { e.target.style.borderColor = T.gold; e.target.style.background = T.card2 }}
      onBlur={e  => { e.target.style.borderColor = T.line; e.target.style.background = T.card }}
    />
  )
}

function RadioList({ options, value, onChange }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {options.map(opt => {
        const sel = value === opt
        return (
          <button key={opt} type="button" onClick={() => onChange(opt)}
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: sel ? 'rgba(212,184,122,.10)' : T.card, border: `1px solid ${sel ? T.gold : T.line}`, borderRadius: 12, color: T.cream, fontSize: 15, cursor: 'pointer', textAlign: 'left', fontFamily: T.sans, minHeight: 52, WebkitAppearance: 'none', touchAction: 'manipulation' }}>
            <span style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${sel ? T.gold : T.dim}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {sel && <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.gold, display: 'block' }} />}
            </span>
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function MultiCheck({ options, value, onChange, allowOther, otherValue, onOtherChange }) {
  const toggle = opt => onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt])
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {options.map(opt => {
        const sel = value.includes(opt)
        return (
          <button key={opt} type="button" onClick={() => toggle(opt)}
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: sel ? 'rgba(212,184,122,.10)' : T.card, border: `1px solid ${sel ? T.gold : T.line}`, borderRadius: 12, color: T.cream, fontSize: 15, cursor: 'pointer', textAlign: 'left', fontFamily: T.sans, minHeight: 52, WebkitAppearance: 'none', touchAction: 'manipulation' }}>
            <span style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${sel ? T.gold : T.dim}`, background: sel ? T.gold : 'transparent', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {sel && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6.5L4.8 9L10 3.5" stroke="#1d2b27" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </span>
            {opt}
          </button>
        )
      })}
      {allowOther && (
        <div style={{ padding: '12px 16px', background: T.card, border: `1px solid ${otherValue ? T.gold : T.line}`, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${otherValue ? T.gold : T.dim}`, background: otherValue ? T.gold : 'transparent', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            {otherValue && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6.5L4.8 9L10 3.5" stroke="#1d2b27" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </span>
          <span style={{ color: T.muted, fontSize: 14, fontFamily: T.sans }}>Outro:</span>
          <input type="text" value={otherValue || ''} onChange={e => onOtherChange(e.target.value)} placeholder="descreva…"
            style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: `1px solid ${T.line}`, color: T.cream, fontSize: 16, padding: '4px 2px', outline: 'none', fontFamily: T.sans, WebkitAppearance: 'none' }} />
        </div>
      )}
    </div>
  )
}

function Scale5({ value, onChange, leftLabel, rightLabel }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        {[1,2,3,4,5].map(n => {
          const sel = value === n
          return (
            <button key={n} type="button" onClick={() => onChange(n)}
              style={{ flex: 1, aspectRatio: '1/1', maxHeight: 60, background: sel ? T.gold : T.card, border: `1px solid ${sel ? T.gold : T.line}`, borderRadius: 12, color: sel ? T.bg : T.cream, fontFamily: T.serif, fontSize: 22, fontWeight: 500, cursor: 'pointer', WebkitAppearance: 'none', touchAction: 'manipulation', minHeight: 52 }}>
              {n}
            </button>
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: T.mono, fontSize: 10.5, letterSpacing: '0.06em', color: T.dim, textTransform: 'uppercase' }}>
        <span>{leftLabel}</span><span>{rightLabel}</span>
      </div>
    </div>
  )
}

function NPSScale({ value, onChange }) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(11,1fr)', gap: 5, marginBottom: 8 }}>
        {Array.from({ length: 11 }, (_, n) => {
          const sel = value === n
          const c   = n <= 6 ? T.red : n <= 8 ? T.gold : T.green
          return (
            <button key={n} type="button" onClick={() => onChange(n)}
              style={{ aspectRatio: '1/1', background: sel ? c : T.card, border: `1px solid ${sel ? c : T.line}`, borderRadius: 8, color: sel ? T.bg : T.cream, fontFamily: T.serif, fontSize: 18, fontWeight: 500, cursor: 'pointer', WebkitAppearance: 'none', touchAction: 'manipulation', minHeight: 44 }}>
              {n}
            </button>
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: T.mono, fontSize: 10.5, letterSpacing: '0.06em', color: T.dim, textTransform: 'uppercase' }}>
        <span>Nada provável</span><span>Extremamente provável</span>
      </div>
    </div>
  )
}

function ProgressRail({ stepKey }) {
  const meta = STEP_META[stepKey]
  if (!meta?.num) return null
  const pct = (meta.num / meta.total) * 100
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: T.mono, fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.dim, marginBottom: 10 }}>
        <span>Seção {meta.num} de {meta.total} · {meta.label}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div style={{ height: 2, background: T.lineSoft, borderRadius: 2 }}>
        <div style={{ height: '100%', width: pct + '%', background: T.gold, borderRadius: 2 }} />
      </div>
    </div>
  )
}

function MetaItem({ label, value }) {
  return (
    <div>
      <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: T.dim, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: T.serif, fontSize: 18, color: T.cream }}>{value}</div>
    </div>
  )
}

function PrimaryBtn({ children, onClick, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      style={{ padding: '14px 28px', background: disabled ? T.card : T.cream, color: disabled ? T.dim : T.bg, border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: T.sans, minHeight: 52, WebkitAppearance: 'none', touchAction: 'manipulation' }}>
      {children}
    </button>
  )
}

function GhostBtn({ children, onClick }) {
  return (
    <button type="button" onClick={onClick}
      style={{ padding: '14px 22px', background: 'transparent', color: T.muted, border: `1px solid ${T.line}`, borderRadius: 12, fontSize: 15, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: T.sans, minHeight: 52, WebkitAppearance: 'none', touchAction: 'manipulation' }}>
      {children}
    </button>
  )
}

function Screen({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {children}
    </div>
  )
}

function LogoMark({ size }) {
  return (
    <div style={{ width: size, height: size, borderRadius: Math.round(size * 0.18), flexShrink: 0, background: '#233331', border: '1px solid #34453f' }} />
  )
}

const eyebrow = {
  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
  fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
  color: '#d4b87a', marginBottom: 14, display: 'block',
}
