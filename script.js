// ===============================
// PROJETO ECOLAVOURA - BIANCK
// Jogo + Quiz em JavaScript
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  // ===============================
  // ELEMENTOS DO JOGO
  // ===============================

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const pontuacaoElemento = document.getElementById("pontuacao");
  const saudeElemento = document.getElementById("saude");
  const tempoElemento = document.getElementById("tempo");
  const melhorPontuacaoElemento = document.getElementById("melhorPontuacao");
  const mensagemJogo = document.getElementById("mensagemJogo");

  const btnIniciar = document.getElementById("btnIniciarJogo");
const btnParar = document.getElementById("btnPararJogo");
const btnReiniciar = document.getElementById("btnReiniciarJogo");

  let jogoAtivo = false;
  let pontuacao = 0;
  let saude = 100;
  let tempo = 45;

  let melhorPontuacao = Number(localStorage.getItem("melhorPontuacaoEcoLavoura")) || 0;

  let itens = [];
  let teclas = {};
  let intervaloTempo = null;
  let intervaloItens = null;
  let animacaoId = null;

  const jogador = {
    x: canvas.width / 2 - 35,
    y: canvas.height - 75,
    largura: 70,
    altura: 50,
    velocidade: 8
  };

  const itensPositivos = [
    { emoji: "♻️", nome: "Reciclagem", pontos: 10 },
    { emoji: "💧", nome: "Água limpa", pontos: 8 },
    { emoji: "🌱", nome: "Muda", pontos: 12 },
    { emoji: "🐝", nome: "Polinizador", pontos: 15 }
  ];

  const itensNegativos = [
    { emoji: "🔥", nome: "Queimada", dano: 15 },
    { emoji: "☠️", nome: "Veneno", dano: 20 },
    { emoji: "🧪", nome: "Produto químico", dano: 15 },
    { emoji: "🛢️", nome: "Poluição", dano: 18 }
  ];

  // ===============================
  // FUNÇÕES DO JOGO
  // ===============================

  function atualizarPainel() {
    pontuacaoElemento.textContent = pontuacao;
    saudeElemento.textContent = saude;
    tempoElemento.textContent = tempo;
    melhorPontuacaoElemento.textContent = melhorPontuacao;
  }

  function salvarMelhorPontuacao() {
    if (pontuacao > melhorPontuacao) {
      melhorPontuacao = pontuacao;
      localStorage.setItem("melhorPontuacaoEcoLavoura", melhorPontuacao);
    }
  }

  function desenharCenario() {
    // Céu
    ctx.fillStyle = "#bbf7d0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sol
    ctx.beginPath();
    ctx.arc(80, 70, 38, 0, Math.PI * 2);
    ctx.fillStyle = "#facc15";
    ctx.fill();

    // Nuvens
    desenharNuvem(210, 70);
    desenharNuvem(680, 95);

    // Campo
    ctx.fillStyle = "#65a30d";
    ctx.fillRect(0, 250, canvas.width, 200);

    // Linhas da lavoura
    ctx.strokeStyle = "#3f6212";
    ctx.lineWidth = 4;

    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 130 - 120, canvas.height);
      ctx.lineTo(i * 110 + 80, 250);
      ctx.stroke();
    }

    // Cerca
    ctx.fillStyle = "#92400e";

    for (let x = 0; x < canvas.width; x += 90) {
      ctx.fillRect(x, 230, 12, 55);
    }

    ctx.fillRect(0, 245, canvas.width, 8);
  }

  function desenharNuvem(x, y) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.arc(x + 28, y - 10, 30, 0, Math.PI * 2);
    ctx.arc(x + 60, y, 25, 0, Math.PI * 2);
    ctx.fill();
  }

  function desenharJogador() {
    // Corpo do carrinho ecológico
    ctx.fillStyle = "#166534";
    ctx.fillRect(jogador.x + 10, jogador.y + 15, 50, 25);

    // Cabine
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(jogador.x + 25, jogador.y, 30, 25);

    // Rodas
    ctx.fillStyle = "#1f2937";
    ctx.beginPath();
    ctx.arc(jogador.x + 20, jogador.y + 45, 12, 0, Math.PI * 2);
    ctx.arc(jogador.x + 55, jogador.y + 45, 12, 0, Math.PI * 2);
    ctx.fill();

    // Símbolo sustentável
    ctx.font = "24px Arial";
    ctx.fillText("🌱", jogador.x + 24, jogador.y + 29);
  }

  function criarItem() {
    const tipoPositivo = Math.random() > 0.38;
    let base;

    if (tipoPositivo) {
      base = itensPositivos[Math.floor(Math.random() * itensPositivos.length)];
    } else {
      base = itensNegativos[Math.floor(Math.random() * itensNegativos.length)];
    }

    const item = {
      x: Math.random() * (canvas.width - 50) + 25,
      y: -40,
      tamanho: 38,
      velocidade: Math.random() * 2 + 2.2,
      positivo: tipoPositivo,
      ...base
    };

    itens.push(item);
  }

  function desenharItens() {
    ctx.font = "36px Arial";
    ctx.textAlign = "center";

    itens.forEach((item) => {
      ctx.fillText(item.emoji, item.x, item.y);
    });

    ctx.textAlign = "left";
  }

  function moverItens() {
    itens.forEach((item) => {
      item.y += item.velocidade;
    });

    itens = itens.filter((item) => item.y < canvas.height + 50);
  }

  function moverJogador() {
    if (teclas["ArrowLeft"] || teclas["a"] || teclas["A"]) {
      jogador.x -= jogador.velocidade;
    }

    if (teclas["ArrowRight"] || teclas["d"] || teclas["D"]) {
      jogador.x += jogador.velocidade;
    }

    if (jogador.x < 0) {
      jogador.x = 0;
    }

    if (jogador.x + jogador.largura > canvas.width) {
      jogador.x = canvas.width - jogador.largura;
    }
  }

  function verificarColisoes() {
    itens.forEach((item, index) => {
      const colidiu =
        item.x > jogador.x &&
        item.x < jogador.x + jogador.largura &&
        item.y > jogador.y &&
        item.y < jogador.y + jogador.altura;

      if (colidiu) {
        if (item.positivo) {
          pontuacao += item.pontos;
          mensagemJogo.textContent = `Boa! Você coletou ${item.nome} e ajudou a lavoura.`;
        } else {
          saude -= item.dano;

          if (saude < 0) {
            saude = 0;
          }

          mensagemJogo.textContent = `Cuidado! ${item.nome} prejudicou a lavoura.`;
        }

        itens.splice(index, 1);
        atualizarPainel();

        if (saude <= 0) {
          finalizarJogo("A saúde da lavoura chegou a zero.");
        }
      }
    });
  }

  function loopJogo() {
    if (!jogoAtivo) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    desenharCenario();
    moverJogador();
    moverItens();
    verificarColisoes();
    desenharItens();
    desenharJogador();

    animacaoId = requestAnimationFrame(loopJogo);
  }

  function iniciarJogo() {
    cancelarJogoAnterior();

    jogoAtivo = true;
    pontuacao = 0;
    saude = 100;
    tempo = 45;
    itens = [];

    jogador.x = canvas.width / 2 - jogador.largura / 2;

    atualizarPainel();

    mensagemJogo.textContent =
      "Use as setas do teclado, o mouse ou o toque na tela para mover o carrinho ecológico.";

    intervaloTempo = setInterval(() => {
      if (!jogoAtivo) return;

      tempo--;
      atualizarPainel();

      if (tempo <= 0) {
        finalizarJogo("Tempo encerrado.");
      }
    }, 1000);

    intervaloItens = setInterval(() => {
      if (jogoAtivo) {
        criarItem();
      }
    }, 750);

    loopJogo();
  }

  function finalizarJogo(motivo) {
    jogoAtivo = false;

    clearInterval(intervaloTempo);
    clearInterval(intervaloItens);
    cancelAnimationFrame(animacaoId);

    salvarMelhorPontuacao();
    atualizarPainel();

    let tituloFinal = "";
    let mensagemFinal = "";

    if (pontuacao >= 180 && saude >= 60) {
      tituloFinal = "🌟 Guardião da Lavoura";
      mensagemFinal = "Excelente! Você protegeu muito bem o campo e o meio ambiente.";
    } else if (pontuacao >= 90 && saude >= 30) {
      tituloFinal = "🌱 Protetor do Campo";
      mensagemFinal = "Bom trabalho! A lavoura foi protegida, mas ainda pode melhorar.";
    } else {
      tituloFinal = "⚠️ Lavoura em risco";
      mensagemFinal = "A lavoura precisa de mais cuidado. Tente novamente!";
    }

    mensagemJogo.textContent = `${motivo} Pontuação final: ${pontuacao}. ${mensagemFinal}`;

    desenharCenario();
    desenharJogador();

    ctx.fillStyle = "rgba(20, 83, 45, 0.88)";
    ctx.fillRect(100, 120, 700, 190);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Fim de jogo", canvas.width / 2, 165);

    ctx.font = "bold 26px Arial";
    ctx.fillText(tituloFinal, canvas.width / 2, 205);

    ctx.font = "22px Arial";
    ctx.fillText(`Pontuação: ${pontuacao}`, canvas.width / 2, 245);
    ctx.fillText(`Melhor pontuação: ${melhorPontuacao}`, canvas.width / 2, 278);

    ctx.textAlign = "left";
  }

  function cancelarJogoAnterior() {
    jogoAtivo = false;
    clearInterval(intervaloTempo);
    clearInterval(intervaloItens);
    cancelAnimationFrame(animacaoId);
  }
function pararJogo() {
  if (!jogoAtivo) {
    mensagemJogo.textContent = "O jogo ainda não foi iniciado.";
    return;
  }

  finalizarJogo("Jogo encerrado pelo jogador.");
}
  function reiniciarJogo() {
    iniciarJogo();
  }

  function desenharTelaInicial() {
    desenharCenario();

    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    ctx.fillRect(135, 110, 630, 210);

    ctx.strokeStyle = "#166534";
    ctx.lineWidth = 4;
    ctx.strokeRect(135, 110, 630, 210);

    ctx.fillStyle = "#14532d";
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "center";
    ctx.fillText("EcoLavoura", canvas.width / 2, 170);

    ctx.font = "22px Arial";
    ctx.fillText("Proteja a lavoura e cuide do futuro!", canvas.width / 2, 215);

    ctx.font = "18px Arial";
    ctx.fillText("Colete ♻️ 💧 🌱 🐝 e evite 🔥 ☠️ 🧪 🛢️", canvas.width / 2, 260);

    ctx.textAlign = "left";
  }

  // ===============================
  // CONTROLES DO JOGO
  // ===============================

  document.addEventListener("keydown", (evento) => {
    teclas[evento.key] = true;
  });

  document.addEventListener("keyup", (evento) => {
    teclas[evento.key] = false;
  });

  canvas.addEventListener("mousemove", (evento) => {
    if (!jogoAtivo) return;

    const retangulo = canvas.getBoundingClientRect();
    const escalaX = canvas.width / retangulo.width;
    const mouseX = (evento.clientX - retangulo.left) * escalaX;

    jogador.x = mouseX - jogador.largura / 2;
  });

  canvas.addEventListener(
    "touchmove",
    (evento) => {
      if (!jogoAtivo) return;

      evento.preventDefault();

      const toque = evento.touches[0];
      const retangulo = canvas.getBoundingClientRect();
      const escalaX = canvas.width / retangulo.width;
      const toqueX = (toque.clientX - retangulo.left) * escalaX;

      jogador.x = toqueX - jogador.largura / 2;
    },
    { passive: false }
  );

btnIniciar.addEventListener("click", iniciarJogo);
btnParar.addEventListener("click", pararJogo);
btnReiniciar.addEventListener("click", reiniciarJogo);

  desenharTelaInicial();
  atualizarPainel();

  // ===============================
  // QUIZ
  // ===============================

  const contadorPergunta = document.getElementById("contadorPergunta");
  const pontuacaoQuizElemento = document.getElementById("pontuacaoQuiz");
  const perguntaQuiz = document.getElementById("perguntaQuiz");
  const alternativasQuiz = document.getElementById("alternativasQuiz");
  const resultadoQuiz = document.getElementById("resultadoQuiz");
  const btnProximaPergunta = document.getElementById("btnProximaPergunta");

  const perguntas = [
    {
      pergunta: "Qual atitude ajuda a proteger o solo da lavoura?",
      alternativas: [
        "Jogar lixo no campo",
        "Preservar a cobertura vegetal",
        "Queimar resíduos",
        "Desperdiçar água"
      ],
      correta: 1
    },
    {
      pergunta: "Por que as abelhas são importantes para o campo?",
      alternativas: [
        "Porque prejudicam as plantas",
        "Porque aumentam a poluição",
        "Porque ajudam na polinização",
        "Porque secam o solo"
      ],
      correta: 2
    },
    {
      pergunta: "O que significa sustentabilidade?",
      alternativas: [
        "Usar os recursos naturais sem cuidado",
        "Produzir hoje sem prejudicar o futuro",
        "Desmatar para plantar mais",
        "Ignorar a natureza"
      ],
      correta: 1
    },
    {
      pergunta: "Qual prática ajuda a economizar água na agricultura?",
      alternativas: [
        "Irrigação consciente",
        "Vazamentos sem conserto",
        "Uso exagerado de água",
        "Jogar óleo no solo"
      ],
      correta: 0
    },
    {
      pergunta: "Qual item deve ser retirado corretamente do ambiente?",
      alternativas: [
        "Árvore nativa",
        "Abelha",
        "Lixo reciclável",
        "Água limpa"
      ],
      correta: 2
    }
  ];

  let perguntaAtual = -1;
  let pontosQuiz = 0;
  let respondeu = false;

  function atualizarTopoQuiz() {
    if (perguntaAtual < 0) {
      contadorPergunta.textContent = `Pergunta 1 de ${perguntas.length}`;
    } else {
      contadorPergunta.textContent = `Pergunta ${perguntaAtual + 1} de ${perguntas.length}`;
    }

    pontuacaoQuizElemento.textContent = `${pontosQuiz} pontos`;
  }

  function mostrarPergunta() {
    respondeu = false;
    resultadoQuiz.textContent = "";

    const dados = perguntas[perguntaAtual];

    perguntaQuiz.textContent = dados.pergunta;
    alternativasQuiz.innerHTML = "";

    dados.alternativas.forEach((alternativa, index) => {
      const botao = document.createElement("button");
      botao.textContent = alternativa;
      botao.type = "button";

      botao.addEventListener("click", () => responderPergunta(index));

      alternativasQuiz.appendChild(botao);
    });

    btnProximaPergunta.textContent = "Responder para continuar";
    btnProximaPergunta.disabled = true;

    atualizarTopoQuiz();
  }

  function responderPergunta(indiceEscolhido) {
    if (respondeu) return;

    respondeu = true;

    const dados = perguntas[perguntaAtual];
    const botoes = alternativasQuiz.querySelectorAll("button");

    botoes.forEach((botao, index) => {
      botao.disabled = true;

      if (index === dados.correta) {
        botao.classList.add("correta");
      }

      if (index === indiceEscolhido && index !== dados.correta) {
        botao.classList.add("errada");
      }
    });

    if (indiceEscolhido === dados.correta) {
      pontosQuiz += 20;
      resultadoQuiz.textContent = "Resposta correta! Você entende de sustentabilidade.";
    } else {
      resultadoQuiz.textContent = "Resposta incorreta. Observe a alternativa correta marcada em verde.";
    }

    pontuacaoQuizElemento.textContent = `${pontosQuiz} pontos`;
    btnProximaPergunta.disabled = false;

    if (perguntaAtual === perguntas.length - 1) {
      btnProximaPergunta.textContent = "Ver resultado final";
    } else {
      btnProximaPergunta.textContent = "Próxima pergunta";
    }
  }

  function proximaPergunta() {
    if (perguntaAtual === -1) {
      perguntaAtual = 0;
      pontosQuiz = 0;
      mostrarPergunta();
      return;
    }

    if (!respondeu) return;

    perguntaAtual++;

    if (perguntaAtual >= perguntas.length) {
      finalizarQuiz();
    } else {
      mostrarPergunta();
    }
  }

  function finalizarQuiz() {
    alternativasQuiz.innerHTML = "";

    contadorPergunta.textContent = "Quiz finalizado";
    pontuacaoQuizElemento.textContent = `${pontosQuiz} pontos`;

    let mensagem = "";

    if (pontosQuiz >= 80) {
      mensagem = "Parabéns! Você demonstrou ótimo conhecimento sobre sustentabilidade.";
    } else if (pontosQuiz >= 50) {
      mensagem = "Bom resultado! Continue aprendendo sobre o cuidado com o campo.";
    } else {
      mensagem = "Continue estudando! Pequenas atitudes ajudam a proteger o planeta.";
    }

    perguntaQuiz.textContent = `Resultado final: ${pontosQuiz} pontos.`;
    resultadoQuiz.textContent = mensagem;

    btnProximaPergunta.textContent = "Refazer quiz";

    perguntaAtual = -1;
    respondeu = false;
  }

  btnProximaPergunta.addEventListener("click", proximaPergunta);

  atualizarTopoQuiz();
});