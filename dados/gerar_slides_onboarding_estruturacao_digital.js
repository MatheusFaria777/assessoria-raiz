// Gerador de slides de onboarding em HTML — Assessoria Raiz
// Caminho "Estruturação Digital" (produto pontual, diferente de gestão de tráfego recorrente).
// Deck mais enxuto que o onboarding padrão: sem os slides de "erros comuns",
// foco em mostrar o que o cliente vai ter e depois entrar nas perguntas de negócio.
//
// Nunca usar travessão (—) em nenhum texto gerado aqui. Trocar por vírgula, ponto,
// dois pontos, parênteses ou "·" (separador estrutural). Regra de estilo da Raiz.

const fs = require("fs");
const path = require("path");

// ---- Dados do cliente (adaptar a cada novo onboarding) ----
const NOME_EMPRESA = "Audi Fonseca";
const NOME_RESPONSAVEL = "Audimar";
const CIDADE = "Caxias do Sul, RS";
const OUT = "Clientes/audi-fonseca/Entregaveis/onboard-slides.html";

// ---- Identidade visual Raiz (fixa, nunca usar cores do cliente) ----
const COR_FUNDO = "#1E3D34";
const COR_TEXTO = "#F5F5F5";
const COR_DESTAQUE = "#CBA135";
const COR_CARD = "#254337";
const COR_BORDA = "#356050";
const COR_TRANS_FUNDO = "#CBA135";
const COR_TRANS_TEXTO = "#1E3D34";

// ---- Imagens embutidas como base64 ----
const IMGS_DIR = path.join(__dirname, "../Clientes/.claude/skills/onboarding/referencias");
function imgBase64(filename) {
  return `data:image/png;base64,${fs.readFileSync(path.join(IMGS_DIR, filename)).toString("base64")}`;
}
const IMG_GRUPO_WHATSAPP = imgBase64("grupo-whatsapp.png");
const IMG_PASTA_DRIVE = imgBase64("print-drive.png");
const IMG_PACK_RAIZ = imgBase64("packraiz.png");

const slides = [
  // 1 — Abertura
  `
  <section class="slide slide-abertura">
    <p class="kicker">Onboarding · ${NOME_EMPRESA}</p>
    <h1>Hoje a gente define<br>as regras do jogo</h1>
  </section>`,

  // 2 — Como funciona essa reunião (2 partes, mais simples que o onboarding padrão)
  `
  <section class="slide">
    <p class="kicker">Como funciona essa reunião</p>
    <h2>O roteiro de hoje</h2>
    <div class="grid grid-2">
      <div class="card">
        <span class="num">1</span>
        <h3>O que você vai ter</h3>
        <p>Tudo que faz parte da estruturação digital, direitinho.</p>
      </div>
      <div class="card">
        <span class="num">2</span>
        <h3>Seu negócio</h3>
        <p>Perguntas pra já seguir com a implementação certinha.</p>
      </div>
    </div>
  </section>`,

  // 3 — CAJ
  `
  <section class="slide">
    <p class="kicker">Como a gente se comunica</p>
    <h2>Café · Almoço · Janta</h2>
    <p class="intro">Você vai ter suporte direto pelo nosso grupo no WhatsApp durante todo o período do projeto. A gente organiza as respostas em janelas fixas pra te dar previsibilidade e não deixar nada passar.</p>
    <div class="grid grid-3">
      <div class="card center">
        <span class="emoji">☕</span>
        <h3>Café</h3>
        <p>Janela da manhã</p>
      </div>
      <div class="card center">
        <span class="emoji">🍽️</span>
        <h3>Almoço</h3>
        <p>Janela do meio-dia</p>
      </div>
      <div class="card center">
        <span class="emoji">🌙</span>
        <h3>Janta</h3>
        <p>Janela do fim do dia</p>
      </div>
    </div>
    <p class="nota">Pode mandar mensagem a qualquer hora. Se cair fora dessas janelas, respondemos na próxima.</p>
  </section>`,

  // 4 — Onde tudo mora: grupo do WhatsApp + Pack Raiz
  `
  <section class="slide slide-print-full">
    <p class="kicker">Onde tudo mora</p>
    <h2>O grupo do WhatsApp</h2>
    <div class="print-duo">
      <img class="print-duo-img" src="${IMG_GRUPO_WHATSAPP}" alt="Print do grupo do WhatsApp">
      <img class="print-duo-img" src="${IMG_PACK_RAIZ}" alt="Print do Pack Raiz">
    </div>
  </section>`,

  // 5 — Onde tudo mora: pasta do Drive
  `
  <section class="slide slide-print-full">
    <p class="kicker">Onde tudo mora</p>
    <h2>A pasta do Drive</h2>
    <img class="print-img-full" src="${IMG_PASTA_DRIVE}" alt="Print da pasta do Drive organizada em subpastas">
  </section>`,

  // 6 — Reestruturação digital do perfil + treinamento comercial
  `
  <section class="slide">
    <p class="kicker">Pilar 1</p>
    <h2>Sua imagem no digital</h2>
    <p class="intro">A gente reestrutura o que já existe no seu perfil, do jeito que atrai mais gente certa:</p>
    <div class="grid grid-4">
      <div class="card center"><span class="num">1</span><h3>Capa de destaque</h3><p>organização visual dos destaques</p></div>
      <div class="card center"><span class="num">2</span><h3>Logo</h3><p>melhorada pra identidade mais forte</p></div>
      <div class="card center"><span class="num">3</span><h3>Como tirar foto</h3><p>direcionamento prático de ângulo e luz</p></div>
      <div class="card center"><span class="num">4</span><h3>Treinamento comercial</h3><p>com o Lucas, como levar o lead do WhatsApp pra visita</p></div>
    </div>
  </section>`,

  // 7 — Estruturação de campanhas
  `
  <section class="slide">
    <p class="kicker">Pilar 2</p>
    <h2>Estruturação de campanhas</h2>
    <p class="intro">A gente monta tudo do zero com a mesma configuração que usamos nos clientes que já vendem com tráfego:</p>
    <div class="grid grid-3">
      <div class="card center"><span class="num">1</span><h3>Campanhas no ar</h3><p>estrutura completa no Meta Ads</p></div>
      <div class="card center"><span class="num">2</span><h3>Suporte de 30 dias</h3><p>acompanhamento depois das campanhas rodando</p></div>
      <div class="card center"><span class="num">3</span><h3>Aula de consultoria</h3><p>como manter tudo rodando sozinho</p></div>
    </div>
  </section>`,

  // 8 — O que a aula de consultoria ensina
  `
  <section class="slide slide-erro">
    <p class="kicker erro-tag">Ao final dos 30 dias</p>
    <h2>Você vai aprender a manter isso rodando</h2>
    <p class="intro">Com menos de 30 minutos do seu mês, você vai saber fazer:</p>
    <ol class="etapas">
      <li><strong>Subir carro novo</strong>, usando o Pack Raiz pra montar o anúncio rápido</li>
      <li><strong>Descrição, título e mensagem padrão</strong> de cada anúncio</li>
      <li><strong>Pausar carro</strong> quando vender ou sair do estoque</li>
      <li><strong>Mexer em localização</strong>, pra ajustar a região do anúncio</li>
      <li><strong>Mexer em verba</strong>, subindo ou reduzindo investimento</li>
      <li class="destaque"><strong>Principais métricas</strong> que você precisa olhar pra saber se está indo bem</li>
    </ol>
  </section>`,

  // 9 — Além das campanhas: GMN + banco de referências
  `
  <section class="slide">
    <p class="kicker">Pilar 3 e 4</p>
    <h2>Além das campanhas</h2>
    <div class="grid grid-2">
      <div class="card">
        <h3>Google Meu Negócio</h3>
        <p>Criação e otimização da sua ficha, pra você aparecer quando alguém pesquisar consultor automotivo na sua região.</p>
      </div>
      <div class="card">
        <h3>Banco de referências</h3>
        <p>Acesso vitalício aos anúncios que já geraram venda em outros clientes: foto, vídeo, descrição. Sempre que bater dúvida de como fazer, é só consultar.</p>
      </div>
    </div>
  </section>`,

  // 10 — Próximos passos
  `
  <section class="slide">
    <p class="kicker">Próximos passos</p>
    <h2>O caminho daqui pra frente</h2>
    <div class="timeline">
      <div class="timeline-item">
        <span class="timeline-icone">📄</span>
        <p class="timeline-texto"><strong>Assinatura</strong> do contrato</p>
      </div>
      <div class="timeline-item">
        <span class="timeline-icone">💻</span>
        <p class="timeline-texto"><strong>Onboarding</strong> essa conversa de hoje</p>
      </div>
      <div class="timeline-item">
        <span class="timeline-icone">⚙️</span>
        <p class="timeline-texto"><strong>Estruturação</strong> perfil, campanhas e GMN</p>
      </div>
      <div class="timeline-item">
        <span class="timeline-icone">🏁</span>
        <p class="timeline-texto"><strong>Campanhas no ar</strong> + 30 dias de suporte</p>
      </div>
      <div class="timeline-item destaque">
        <span class="timeline-icone">🎓</span>
        <p class="timeline-texto"><strong>Aula final</strong> e você assume sozinho</p>
      </div>
    </div>
  </section>`,

  // 11 — Transição
  `
  <section class="slide slide-transicao">
    <h1>Agora vamos falar<br>do seu negócio</h1>
    <p class="lead">Algumas perguntas pra entender teu negócio a fundo e já seguir com a implementação.</p>
  </section>`,
];

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Onboarding · ${NOME_EMPRESA}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,500;9..144,600&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --fundo: ${COR_FUNDO};
    --texto: ${COR_TEXTO};
    --destaque: ${COR_DESTAQUE};
    --card: ${COR_CARD};
    --borda: ${COR_BORDA};
    --trans-fundo: ${COR_TRANS_FUNDO};
    --trans-texto: ${COR_TRANS_TEXTO};
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    font-family: 'Inter', sans-serif;
    font-weight: 300;
    background: #000;
    color: var(--texto);
    overflow: hidden;
  }
  .deck {
    position: relative;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .stage {
    position: relative;
    width: min(100vw, 177.78vh);
    height: min(100vh, 56.25vw);
    background: var(--fundo);
    overflow: hidden;
    box-shadow: 0 0 80px rgba(0,0,0,0.5);
  }
  .slide {
    position: absolute;
    inset: 0;
    display: none;
    flex-direction: column;
    justify-content: center;
    padding: clamp(28px, 6vw, 90px);
  }
  .slide.active { display: flex; }
  .slide.slide-transicao { background: var(--trans-fundo); color: var(--trans-texto); }

  .kicker {
    font-family: 'Inter', sans-serif;
    font-size: clamp(11px, 1.1vw, 14px);
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--destaque);
    margin-bottom: clamp(10px, 1.6vw, 18px);
    font-weight: 500;
  }
  .slide-transicao .kicker { color: var(--trans-texto); }

  h1 {
    font-family: 'Fraunces', serif;
    font-weight: 600;
    font-size: clamp(34px, 6vw, 64px);
    line-height: 1.08;
    letter-spacing: -1px;
  }
  h2 {
    font-family: 'Fraunces', serif;
    font-weight: 500;
    font-size: clamp(26px, 4.2vw, 44px);
    line-height: 1.12;
    letter-spacing: -0.5px;
    margin-bottom: clamp(14px, 2vw, 22px);
  }
  h3 {
    font-family: 'Fraunces', serif;
    font-weight: 500;
    font-size: clamp(16px, 1.6vw, 21px);
    margin-bottom: 8px;
    color: var(--destaque);
  }
  .lead {
    font-size: clamp(15px, 1.6vw, 20px);
    color: var(--destaque);
    margin-top: clamp(16px, 2.4vw, 28px);
    max-width: 60ch;
  }
  .slide-transicao .lead { color: var(--trans-texto); opacity: 0.75; }
  .intro {
    font-size: clamp(14px, 1.5vw, 18px);
    line-height: 1.6;
    max-width: 78ch;
    margin-bottom: clamp(18px, 2.6vw, 30px);
    color: var(--texto);
    opacity: 0.92;
  }
  .nota {
    font-size: clamp(12px, 1.15vw, 14px);
    color: var(--destaque);
    margin-top: clamp(16px, 2.4vw, 26px);
    max-width: 80ch;
    line-height: 1.5;
  }
  p { line-height: 1.6; font-size: clamp(13px, 1.4vw, 17px); }
  strong { color: var(--destaque); font-weight: 500; }

  .grid { display: grid; gap: clamp(10px, 1.4vw, 18px); }
  .grid-2 { grid-template-columns: repeat(2, 1fr); }
  .grid-3 { grid-template-columns: repeat(3, 1fr); }
  .grid-4 { grid-template-columns: repeat(4, 1fr); }

  .card {
    background: var(--card);
    border: 1px solid var(--borda);
    border-radius: 10px;
    padding: clamp(16px, 2vw, 26px);
  }
  .card.center { text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .card p { margin: 0; opacity: 0.9; }
  .card .emoji { font-size: clamp(28px, 3.6vw, 44px); margin-bottom: 10px; }
  .card .num {
    display: inline-flex; align-items: center; justify-content: center;
    width: clamp(26px, 2.6vw, 34px); height: clamp(26px, 2.6vw, 34px);
    border-radius: 50%; background: var(--destaque); color: var(--fundo);
    font-weight: 600; font-size: clamp(13px, 1.3vw, 16px); margin-bottom: 10px;
  }

  .etapas { list-style: none; counter-reset: etapa; max-width: 90ch; }
  .etapas li {
    counter-increment: etapa;
    position: relative;
    padding: clamp(10px, 1.3vw, 14px) clamp(16px, 2vw, 22px) clamp(10px, 1.3vw, 14px) clamp(46px, 4vw, 56px);
    margin-bottom: clamp(7px, 1vw, 10px);
    background: var(--card);
    border: 1px solid var(--borda);
    border-radius: 8px;
    font-size: clamp(13px, 1.35vw, 16px);
  }
  .etapas li::before {
    content: counter(etapa);
    position: absolute;
    left: clamp(14px, 1.6vw, 20px);
    top: 50%;
    transform: translateY(-50%);
    font-family: 'Fraunces', serif;
    font-weight: 600;
    color: var(--destaque);
    font-size: clamp(15px, 1.6vw, 19px);
  }
  .etapas li.destaque {
    background: var(--destaque);
    border-color: var(--destaque);
    color: var(--fundo);
  }
  .etapas li.destaque::before { color: var(--fundo); }
  .etapas li.destaque strong { color: var(--fundo); }

  .erro-tag { color: var(--destaque); }

  .slide-abertura h1 { max-width: 16ch; }

  .print-duo {
    display: flex;
    gap: clamp(14px, 2vw, 28px);
    justify-content: center;
    align-items: center;
    margin-top: clamp(14px, 2vw, 22px);
  }
  .print-duo-img {
    max-height: 62vh;
    max-width: 48%;
    border-radius: 14px;
    border: 1px solid var(--borda);
    box-shadow: 0 16px 50px rgba(0,0,0,0.4);
    object-fit: contain;
  }
  .slide-print-full { align-items: center; }
  .slide-print-full .kicker, .slide-print-full h2 { text-align: center; }
  .print-img-full {
    max-height: 68vh;
    max-width: 100%;
    border-radius: 12px;
    border: 1px solid var(--borda);
    box-shadow: 0 20px 60px rgba(0,0,0,0.45);
    object-fit: contain;
  }

  .timeline {
    position: relative;
    display: flex;
    justify-content: space-between;
    margin-top: clamp(30px, 5vw, 60px);
    padding: 0 clamp(6px, 1.4vw, 16px);
  }
  .timeline::before {
    content: "";
    position: absolute;
    top: clamp(20px, 2.6vw, 28px);
    left: 4%;
    right: 4%;
    height: 1px;
    background: var(--borda);
  }
  .timeline-item {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .timeline-icone {
    width: clamp(40px, 4.4vw, 56px);
    height: clamp(40px, 4.4vw, 56px);
    border-radius: 50%;
    background: var(--card);
    border: 1px solid var(--borda);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: clamp(18px, 2vw, 26px);
    margin-bottom: clamp(10px, 1.6vw, 16px);
    z-index: 1;
  }
  .timeline-item.destaque .timeline-icone { background: var(--destaque); border-color: var(--destaque); }
  .timeline-texto { font-size: clamp(11px, 1.1vw, 14px); max-width: 16ch; opacity: 0.92; }
  .timeline-texto strong { display: block; color: var(--destaque); margin-bottom: 2px; }

  .nav {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 18px;
    background: rgba(0,0,0,0.45);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 999px;
    padding: 8px 18px;
    backdrop-filter: blur(6px);
    z-index: 10;
  }
  .nav button {
    background: none;
    border: none;
    color: var(--texto);
    font-size: 18px;
    cursor: pointer;
    width: 32px; height: 32px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s;
  }
  .nav button:hover { background: rgba(255,255,255,0.12); }
  .nav .counter {
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    letter-spacing: 1px;
    color: var(--texto);
    opacity: 0.7;
    min-width: 50px;
    text-align: center;
  }
</style>
</head>
<body>
  <div class="deck">
    <div class="stage" id="stage">
      ${slides.map((s, i) => s.replace('<section class="slide', `<section data-index="${i}" class="slide${i === 0 ? " active" : ""}`)).join("\n")}
    </div>
  </div>

  <div class="nav">
    <button id="prev" aria-label="Slide anterior">‹</button>
    <span class="counter"><span id="current">1</span> / ${slides.length}</span>
    <button id="next" aria-label="Próximo slide">›</button>
  </div>

  <script>
    const slides = document.querySelectorAll('.slide');
    const counter = document.getElementById('current');
    let idx = 0;

    function go(n) {
      slides[idx].classList.remove('active');
      idx = (n + slides.length) % slides.length;
      slides[idx].classList.add('active');
      counter.textContent = idx + 1;
    }

    document.getElementById('prev').addEventListener('click', () => go(idx - 1));
    document.getElementById('next').addEventListener('click', () => go(idx + 1));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') go(idx + 1);
      if (e.key === 'ArrowLeft') go(idx - 1);
    });
  </script>
</body>
</html>
`;

fs.writeFileSync(OUT, html, "utf-8");
console.log(`Slides HTML gerados em: ${OUT}`);
