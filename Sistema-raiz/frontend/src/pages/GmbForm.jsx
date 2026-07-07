import { useState, useEffect } from 'react'

const T = {
  bg: '#1d2b27', card: '#2a3b37', card2: '#324642',
  line: '#3d524d', lineSoft: '#34453f', cream: '#f3e6bd',
  muted: '#a9b8b0', dim: '#7c8e85', gold: '#d4b87a',
  red: '#c9745a', green: '#8fb37a',
  serif: '"Cormorant Garamond", Georgia, serif',
  sans: '"Manrope", -apple-system, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
}

const DIAS      = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
const PAGAMENTOS = ['Pix', 'Cartão de crédito', 'Cartão de débito', 'Dinheiro', 'Boleto', 'Transferência bancária', 'Cheque']

const STEPS = [
  { id: 'identificacao', label: 'Identificação',    num: 1 },
  { id: 'digital',       label: 'Presença digital', num: 2 },
  { id: 'funcionamento', label: 'Funcionamento',    num: 3 },
  { id: 'estrutura',     label: 'Estrutura',        num: 4 },
  { id: 'conteudo',      label: 'Conteúdo',         num: 5 },
]

const EMPTY = {
  nome_empresa: '', responsavel: '', telefone: '', endereco: '', areas_cobertura: '',
  empreendedor: '', data_abertura: '', instagram: '', site: '', facebook: '',
  dias_funcionamento: [], horario: '', horario_feriados: '',
  acessibilidade: '', estacionamento: '',
  pagamentos: [], descricao: '', servicos: '', faq: '',
}

function validate(step, d) {
  if (step === 'identificacao') {
    if (!d.nome_empresa.trim())    return 'Informe o nome da empresa.'
    if (!d.responsavel.trim())     return 'Informe o nome do responsável.'
    if (!d.telefone.trim())        return 'Informe o telefone comercial.'
    if (!d.endereco.trim())        return 'Informe o endereço.'
    if (!d.areas_cobertura.trim()) return 'Informe as áreas de cobertura.'
    if (!d.empreendedor)           return 'Selecione uma opção sobre tipo de empresa.'
    if (!d.data_abertura.trim())   return 'Informe a data de abertura.'
  }
  if (step === 'digital') {
    if (!d.instagram.trim()) return 'Informe o perfil do Instagram.'
    if (!d.facebook.trim())  return 'Informe o link do Facebook.'
  }
  if (step === 'funcionamento') {
    if (d.dias_funcionamento.length === 0) return 'Selecione ao menos um dia de funcionamento.'
    if (!d.horario.trim())                 return 'Informe o horário de funcionamento.'
    if (!d.horario_feriados.trim())        return 'Informe o horário em feriados.'
  }
  if (step === 'estrutura') {
    if (!d.acessibilidade)            return 'Selecione a opção de acessibilidade.'
    if (!d.estacionamento)            return 'Selecione a opção de estacionamento.'
    if (d.pagamentos.length === 0)    return 'Selecione ao menos um método de pagamento.'
  }
  if (step === 'conteudo') {
    if (!d.descricao.trim()) return 'Preencha a descrição da empresa.'
    if (!d.servicos.trim())  return 'Liste os serviços/produtos.'
    if (!d.faq.trim())       return 'Preencha as perguntas frequentes.'
  }
  return null
}

export default function GmbForm({ slug }) {
  const [clientName, setClientName] = useState('')
  const [loadError, setLoadError]   = useState(null)
  const [loading, setLoading]       = useState(true)
  const [stepIdx, setStepIdx]       = useState(0)
  const [data, setData]             = useState(EMPTY)
  const [error, setError]           = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [driveFolderUrl, setDriveFolderUrl] = useState(null)
  const [logo, setLogo]   = useState(null)
  const [fotos, setFotos] = useState([])

  useEffect(() => {
    if (!slug) { setLoadError('Link inválido.'); setLoading(false); return }
    fetch(`/api/gmb/info/${slug}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setClientName(d.client_name); setLoading(false) })
      .catch(() => { setLoadError('Formulário não encontrado.'); setLoading(false) })
  }, [slug])

  useEffect(() => {
    document.body.style.background = '#1d2b27'
  }, [])

  const up = patch => { setData(d => ({ ...d, ...patch })); setError(null) }
  const toggleArr = (key, val) => {
    setData(d => ({
      ...d,
      [key]: d[key].includes(val) ? d[key].filter(x => x !== val) : [...d[key], val],
    }))
    setError(null)
  }

  const stepKey = STEPS[stepIdx].id
  const isLast  = stepIdx === STEPS.length - 1

  async function goNext() {
    const err = validate(stepKey, data)
    if (err) { setError(err); return }
    setError(null)

    if (isLast) {
      setSubmitting(true)
      try {
        const fd = new FormData()
        Object.entries(data).forEach(([k, v]) => {
          fd.append(k, Array.isArray(v) ? JSON.stringify(v) : v)
        })
        const res = await fetch(`/api/gmb/submit/${slug}`, { method: 'POST', body: fd })
        if (!res.ok) throw new Error()
        const json = await res.json()
        setDriveFolderUrl(json.drive_folder_url)
        setSubmitted(true)
      } catch {
        setError('Erro ao enviar. Verifique sua conexão e tente novamente.')
      } finally {
        setSubmitting(false)
      }
      return
    }

    setStepIdx(i => i + 1)
    window.scrollTo(0, 0)
  }

  function goBack() {
    setError(null)
    setStepIdx(i => Math.max(i - 1, 0))
    window.scrollTo(0, 0)
  }

  if (loading)   return <Screen><p style={{ color: T.muted, fontFamily: T.sans }}>Carregando…</p></Screen>
  if (loadError) return <Screen><p style={{ color: T.red, fontFamily: T.sans }}>{loadError}</p></Screen>

  if (submitted) return (
    <Screen>
      <div style={{ maxWidth: 560, width: '100%', textAlign: 'center', fontFamily: T.sans }}>
        <div style={{ width: 64, height: 64, margin: '0 auto 24px', borderRadius: '50%', background: 'rgba(212,184,122,.15)', border: `1px solid ${T.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <path d="M6 14.5L11.5 20L22 8.5" stroke={T.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={eyebrow}>Recebido com sucesso</div>
        <h1 style={{ fontFamily: T.serif, fontSize: 'clamp(28px,4vw,40px)', color: T.cream, margin: '0 0 16px', fontWeight: 500 }}>
          Obrigado, {data.responsavel.split(' ')[0]}!
        </h1>
        <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
          Suas informações foram recebidas. Para finalizar, precisamos da logo e das fotos da <strong style={{ color: T.cream }}>{data.nome_empresa}</strong>.
        </p>
        {driveFolderUrl && (
          <div style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 12, padding: '1.5rem', marginBottom: 24, textAlign: 'left' }}>
            <div style={eyebrow}>Último passo</div>
            <p style={{ color: T.cream, fontSize: 15, lineHeight: 1.6, margin: '0 0 16px' }}>
              Criamos uma pasta no Google Drive especialmente para você. Acesse ela e envie:
            </p>
            <ul style={{ color: T.muted, fontSize: 14, lineHeight: 2, margin: '0 0 20px', paddingLeft: 20 }}>
              <li>Logo da empresa <span style={{ color: T.dim }}>(PNG ou JPG)</span></li>
              <li>Fotos da fachada, interior, produtos ou equipe</li>
            </ul>
            <a href={driveFolderUrl} target="_blank" rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 24px', borderRadius: 12, background: T.gold, color: '#1d2b27', fontFamily: T.sans, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
              📁 Abrir pasta no Google Drive
            </a>
          </div>
        )}
        <p style={{ color: T.dim, fontSize: 13, lineHeight: 1.5 }}>
          Se precisar de ajuda, entre em contato com a Assessoria Raiz.
        </p>
      </div>
    </Screen>
  )

  const pct = ((stepIdx + 1) / STEPS.length) * 100

  const content = (
    <div style={{ width: '100%', maxWidth: 560, fontFamily: T.sans }}>
      {/* Logo mobile */}
      <div className="raiz-gmb-mobile-logo" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <LogoMark size={32} />
        <span style={{ fontFamily: T.serif, fontSize: 18, color: T.cream }}>RAIZ</span>
        <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: T.dim }}>Assessoria</span>
      </div>

      {/* Progresso */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: T.mono, fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.dim, marginBottom: 10 }}>
          <span>Seção {STEPS[stepIdx].num} de {STEPS.length} · {STEPS[stepIdx].label}</span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div style={{ height: 3, background: T.lineSoft, borderRadius: 2 }}>
          <div style={{ height: '100%', width: pct + '%', background: T.gold, borderRadius: 2 }} />
        </div>
      </div>

      {/* Seções */}
      {stepKey === 'identificacao' && <StepIdentificacao data={data} up={up} clientName={clientName} />}
      {stepKey === 'digital'       && <StepDigital data={data} up={up} />}
      {stepKey === 'funcionamento' && <StepFuncionamento data={data} up={up} toggleArr={toggleArr} />}
      {stepKey === 'estrutura'     && <StepEstrutura data={data} up={up} toggleArr={toggleArr} />}
      {stepKey === 'conteudo'      && <StepConteudo data={data} up={up} />}
      {stepKey === 'arquivos'      && <StepArquivos logo={logo} setLogo={setLogo} fotos={fotos} setFotos={setFotos} />}

      {/* Navegação */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 36, paddingTop: 24, borderTop: `1px solid ${T.lineSoft}`, gap: 16, flexWrap: 'wrap' }}>
        <GhostBtn onClick={goBack}>← Voltar</GhostBtn>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {error && <span style={{ fontFamily: T.mono, fontSize: 12, color: T.red, maxWidth: 240, textAlign: 'right' }}>↳ {error}</span>}
          <PrimaryBtn onClick={goNext} disabled={submitting}>
            {submitting ? 'Enviando…' : isLast ? 'Enviar formulário →' : 'Continuar →'}
          </PrimaryBtn>
        </div>
      </div>
    </div>
  )

  const QUOTES = {
    identificacao: 'Cada detalhe conta na primeira impressão digital.',
    digital: 'Onde você está online é onde seus clientes te encontram.',
    funcionamento: 'Disponibilidade é parte da experiência do cliente.',
    estrutura: 'Acessibilidade é respeito. Estrutura é profissionalismo.',
    conteudo: 'O que você diz define quem você é.',
  }

  return (
    <div className="raiz-gmb-layout">
      {/* Painel lateral — só desktop */}
      <div className="raiz-gmb-panel">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
            <LogoMark size={36} />
            <span style={{ fontFamily: T.serif, fontSize: 20, color: T.cream }}>RAIZ</span>
            <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: T.dim }}>Assessoria</span>
          </div>
          <div style={eyebrow}>Onboarding Google Meu Negócio</div>
          <h2 style={{ fontFamily: T.serif, fontSize: 32, color: T.cream, fontWeight: 500, lineHeight: 1.2, margin: '12px 0 0' }}>
            {STEPS[stepIdx].label}
          </h2>
        </div>
        <div>
          {QUOTES[stepKey] && (
            <blockquote style={{ borderLeft: `2px solid ${T.gold}`, paddingLeft: 16, margin: 0 }}>
              <p style={{ fontFamily: T.serif, fontSize: 18, color: T.muted, fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
                "{QUOTES[stepKey]}"
              </p>
            </blockquote>
          )}
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {STEPS.map((s, i) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, background: i < stepIdx ? T.gold : i === stepIdx ? 'rgba(212,184,122,.2)' : 'transparent', border: `1px solid ${i <= stepIdx ? T.gold : T.lineSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
                  {i < stepIdx  && <span style={{ color: '#1d2b27', fontWeight: 700 }}>✓</span>}
                  {i === stepIdx && <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.gold, display: 'block' }} />}
                </div>
                <span style={{ fontSize: 13, color: i === stepIdx ? T.cream : i < stepIdx ? T.gold : T.dim, fontFamily: T.sans }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="raiz-gmb-form">
        {content}
      </div>
    </div>
  )
}

/* ─── Steps ─────────────────────────────────────────────────────────────── */

function StepIdentificacao({ data, up, clientName }) {
  return (
    <div>
      <SH eyebrow="Seção 1 · Identificação" title="Sobre a empresa"
        desc={`Informações básicas sobre ${clientName || 'sua empresa'}.`} />
      <F label="Nome da empresa" required><TI value={data.nome_empresa} onChange={v => up({ nome_empresa: v })} placeholder="Nome completo como aparece no registro" /></F>
      <F label="Nome do responsável" required><TI value={data.responsavel} onChange={v => up({ responsavel: v })} placeholder="Nome e sobrenome" /></F>
      <F label="Telefone comercial" required><TI value={data.telefone} onChange={v => up({ telefone: v })} placeholder="(00) 00000-0000" type="tel" /></F>
      <F label="Endereço completo" required><TI value={data.endereco} onChange={v => up({ endereco: v })} placeholder="Rua, número, bairro, cidade, estado, CEP" /></F>
      <F label="Áreas de cobertura" required hint="Bairros, cidades ou regiões que a empresa atende">
        <TA value={data.areas_cobertura} onChange={v => up({ areas_cobertura: v })} placeholder="Ex: Caxias do Sul, Flores da Cunha, São Marcos..." rows={3} />
      </F>
      <F label="A empresa se identifica como de empreendedores?" required>
        <RadioGroup options={['Sim', 'Não']} value={data.empreendedor} onChange={v => up({ empreendedor: v })} />
      </F>
      <F label="Data de abertura/inauguração" required><TI value={data.data_abertura} onChange={v => up({ data_abertura: v })} placeholder="DD/MM/AAAA" /></F>
    </div>
  )
}

function StepDigital({ data, up }) {
  return (
    <div>
      <SH eyebrow="Seção 2 · Presença digital" title="Onde você está online" />
      <F label="Instagram (@ ou link do perfil)" required><TI value={data.instagram} onChange={v => up({ instagram: v })} placeholder="@suaempresa ou instagram.com/suaempresa" /></F>
      <F label="Site" hint="Opcional"><TI value={data.site} onChange={v => up({ site: v })} placeholder="www.seusite.com.br" /></F>
      <F label="Facebook (link da página)" required><TI value={data.facebook} onChange={v => up({ facebook: v })} placeholder="facebook.com/suaempresa" /></F>
    </div>
  )
}

function StepFuncionamento({ data, up, toggleArr }) {
  return (
    <div>
      <SH eyebrow="Seção 3 · Funcionamento" title="Quando você está disponível" />
      <F label="Dias de funcionamento" required>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {DIAS.map(d => {
            const sel = data.dias_funcionamento.includes(d)
            return (
              <button key={d} type="button" onClick={() => toggleArr('dias_funcionamento', d)}
                style={{ padding: '10px 16px', borderRadius: 99, border: `1px solid ${sel ? T.gold : T.line}`, background: sel ? 'rgba(212,184,122,.12)' : T.card, color: sel ? T.gold : T.muted, fontSize: 14, cursor: 'pointer', fontFamily: T.sans, minHeight: 44, WebkitAppearance: 'none', touchAction: 'manipulation' }}>
                {d}
              </button>
            )
          })}
        </div>
      </F>
      <F label="Horário de funcionamento" required><TI value={data.horario} onChange={v => up({ horario: v })} placeholder="Ex: 08h às 18h" /></F>
      <F label="Horário em feriados" required><TI value={data.horario_feriados} onChange={v => up({ horario_feriados: v })} placeholder="Ex: Fechado / 09h às 13h" /></F>
    </div>
  )
}

function StepEstrutura({ data, up, toggleArr }) {
  return (
    <div>
      <SH eyebrow="Seção 4 · Estrutura" title="Como é sua estrutura física" />
      <F label="A empresa possui acessibilidade?" required>
        <RadioGroup options={['Sim, tem', 'Não tem']} value={data.acessibilidade} onChange={v => up({ acessibilidade: v })} />
      </F>
      <F label="A empresa possui estacionamento?" required>
        <RadioGroup
          options={['Sim, estacionamento próprio gratuito', 'Sim, estacionamento gratuito na rua', 'Sim, estacionamento próprio pago', 'Não possui']}
          value={data.estacionamento} onChange={v => up({ estacionamento: v })}
        />
      </F>
      <F label="Métodos de pagamento aceitos" required hint="Selecione todos que se aplicam">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PAGAMENTOS.map(p => {
            const sel = data.pagamentos.includes(p)
            return (
              <button key={p} type="button" onClick={() => toggleArr('pagamentos', p)}
                style={{ padding: '10px 16px', borderRadius: 99, border: `1px solid ${sel ? T.gold : T.line}`, background: sel ? 'rgba(212,184,122,.12)' : T.card, color: sel ? T.gold : T.muted, fontSize: 14, cursor: 'pointer', fontFamily: T.sans, minHeight: 44, WebkitAppearance: 'none', touchAction: 'manipulation' }}>
                {p}
              </button>
            )
          })}
        </div>
      </F>
    </div>
  )
}

function StepConteudo({ data, up }) {
  return (
    <div>
      <SH eyebrow="Seção 5 · Conteúdo" title="O que você quer comunicar" />
      <F label="Descrição da empresa" required hint="Conte o que a empresa faz, seus diferenciais e para quem serve">
        <TA value={data.descricao} onChange={v => up({ descricao: v })} placeholder="Descreva sua empresa com o máximo de detalhes possível..." rows={5} />
      </F>
      <F label="Lista de todos os serviços/produtos" required hint="Um por linha ou separados por vírgula">
        <TA value={data.servicos} onChange={v => up({ servicos: v })} placeholder="Ex: Venda de veículos seminovos, Financiamento, Consórcio..." rows={4} />
      </F>
      <F label="10 principais perguntas frequentes (com respostas)" required hint="Escreva a pergunta e a resposta logo abaixo, e assim por diante">
        <TA value={data.faq} onChange={v => up({ faq: v })} placeholder={"P: Vocês financiam?\nR: Sim, trabalhamos com os principais bancos...\n\nP: Qual o horário?\nR: ..."} rows={12} />
      </F>
    </div>
  )
}

function StepArquivos({ logo, setLogo, fotos, setFotos }) {
  return (
    <div>
      <SH eyebrow="Seção 6 · Arquivos" title="Imagens da empresa" desc="Essas imagens estarão visíveis para o público no Google." />
      <F label="Logo da empresa" required hint="Formato PNG ou JPG.">
        <FileDropZone accept="image/*" multiple={false} files={logo ? [logo] : []}
          onChange={files => setLogo(files[0] || null)} label="Toque aqui para enviar a logo" />
      </F>
      <F label="Fotos da empresa" hint="Fachada, interior, produtos, equipe. Quanto mais, melhor.">
        <FileDropZone accept="image/*" multiple={true} files={fotos}
          onChange={files => setFotos(Array.from(files))} label="Toque aqui para enviar as fotos" />
      </F>
    </div>
  )
}

/* ─── Controls ──────────────────────────────────────────────────────────── */

function SH({ eyebrow: ey, title, desc }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={eyebrow}>{ey}</div>
      <h2 style={{ fontFamily: T.serif, fontSize: 'clamp(24px,3vw,34px)', lineHeight: 1.1, margin: '0 0 10px', fontWeight: 500, color: T.cream }}>{title}</h2>
      {desc && <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.55, margin: 0 }}>{desc}</p>}
    </div>
  )
}

function F({ label, required, hint, children }) {
  return (
    <label style={{ display: 'block', marginBottom: 26 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8, fontSize: 15, fontWeight: 500, color: T.cream, fontFamily: T.sans }}>
        <span>{label}</span>
        {required && <span style={{ color: T.gold, fontSize: 13 }}>*</span>}
      </div>
      {hint && <div style={{ color: T.muted, fontSize: 13, marginBottom: 8, lineHeight: 1.45 }}>{hint}</div>}
      {children}
    </label>
  )
}

function TI({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', padding: '14px 16px', background: T.card, border: `1px solid ${T.line}`, borderRadius: 12, color: T.cream, fontSize: 16, outline: 'none', fontFamily: T.sans, boxSizing: 'border-box', WebkitAppearance: 'none' }}
      onFocus={e => { e.target.style.borderColor = T.gold }}
      onBlur={e  => { e.target.style.borderColor = T.line }}
    />
  )
}

function TA({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea value={value || ''} rows={rows} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', padding: '14px 16px', background: T.card, border: `1px solid ${T.line}`, borderRadius: 12, color: T.cream, fontSize: 16, outline: 'none', resize: 'vertical', minHeight: 100, lineHeight: 1.55, fontFamily: T.sans, boxSizing: 'border-box', WebkitAppearance: 'none' }}
      onFocus={e => { e.target.style.borderColor = T.gold }}
      onBlur={e  => { e.target.style.borderColor = T.line }}
    />
  )
}

function RadioGroup({ options, value, onChange }) {
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

function FileDropZone({ accept, multiple, files, onChange, label }) {
  return (
    <div>
      <label style={{ display: 'block', padding: '24px 16px', background: T.card, border: `1px dashed ${T.line}`, borderRadius: 12, cursor: 'pointer', textAlign: 'center' }}>
        <input type="file" accept={accept} multiple={multiple} onChange={e => onChange(multiple ? e.target.files : e.target.files)} style={{ display: 'none' }} />
        <div style={{ color: T.muted, fontFamily: T.sans, fontSize: 15 }}>{label}</div>
        <div style={{ color: T.dim, fontFamily: T.mono, fontSize: 11, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {accept === 'image/*' ? 'PNG, JPG, WEBP' : accept}
        </div>
      </label>
      {files && files.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {Array.from(files).map((f, i) => (
            <span key={i} style={{ fontSize: 12, color: T.green, background: 'rgba(143,179,122,.12)', padding: '4px 10px', borderRadius: 99, fontFamily: T.mono }}>
              ✓ {f.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function PrimaryBtn({ children, onClick, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      style={{ padding: '14px 28px', background: disabled ? T.card : T.cream, color: disabled ? T.dim : '#1d2b27', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: T.sans, minHeight: 52, WebkitAppearance: 'none', touchAction: 'manipulation' }}>
      {children}
    </button>
  )
}

function GhostBtn({ children, onClick }) {
  return (
    <button type="button" onClick={onClick}
      style={{ padding: '14px 22px', background: 'transparent', color: T.muted, border: `1px solid ${T.line}`, borderRadius: 12, fontSize: 15, cursor: 'pointer', fontFamily: T.sans, minHeight: 52, WebkitAppearance: 'none', touchAction: 'manipulation' }}>
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
    <div style={{ width: size, height: size, borderRadius: Math.round(size * 0.18), background: '#233331', border: '1px solid #34453f', flexShrink: 0 }} />
  )
}

const eyebrow = {
  fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 11,
  letterSpacing: '0.18em', textTransform: 'uppercase', color: '#d4b87a', marginBottom: 14, display: 'block',
}
