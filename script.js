/* -------------------------------------------------------------
   Inicialização robusta:
   - "ready()" funciona independente de o script estar no <head>
     ou no fim do <body> (não depende de DOMContentLoaded já ter
     disparado ou não).
   - Quiz e motion (IntersectionObserver) são inicializados em
     funções separadas, cada uma com seu próprio try/catch, para
     que um erro em uma nunca impeça a outra de rodar.
------------------------------------------------------------- */
function ready(fn){
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
}

function initQuiz(){
  var perguntas = [
    {
      pergunta: "O que significa 'economia circular', o conceito por trás do EcoDove?",
      opcoes: [
        "Comprar produtos novos sempre que possível",
        "Reaproveitar algo que já existe para que ele renda mais, gerando menos resíduo",
        "Usar apenas embalagens de vidro"
      ],
      correta: 1,
      explicacao: "Pegar algo que já existe — como uma barra de sabão — e fazer com que ele renda muito mais é a base da economia circular."
    },
    {
      pergunta: "Qual é o principal produto reaproveitado no projeto EcoDove?",
      opcoes: [
        "Garrafas de vidro",
        "Sabonete em barra",
        "Papel"
      ],
      correta: 1,
      explicacao: "O EcoDove transforma sabonete em barra em sabonete líquido, rendendo muito mais produto."
    },
    {
      pergunta: "Além do sabonete, o que mais o EcoDove reaproveita?",
      opcoes: [
        "Embalagens plásticas",
        "Pilhas usadas",
        "Roupas velhas"
      ],
      correta: 0,
      explicacao: "As embalagens plásticas usadas para envasar o produto final também são reaproveitadas, reduzindo o descarte."
    }
  ];

  var indiceAtual = 0;
  var acertos = 0;
  var respondida = false;

  var elProgresso = document.getElementById('quiz-progresso');
  var elPergunta = document.getElementById('quiz-pergunta');
  var elOpcoes = document.getElementById('quiz-opcoes');
  var elFeedback = document.getElementById('quiz-feedback');
  var elProximo = document.getElementById('quiz-proximo');
  var elJogo = document.getElementById('quiz-jogo');
  var elResultado = document.getElementById('quiz-resultado');
  var elResultadoTitulo = document.getElementById('quiz-resultado-titulo');
  var elResultadoTexto = document.getElementById('quiz-resultado-texto');
  var elReiniciar = document.getElementById('quiz-reiniciar');

  /* Se algum elemento do quiz não existir no DOM, encerra aqui sem
     lançar erro — o resto da página (motion, links etc.) continua
     funcionando normalmente. */
  if (!elProgresso || !elPergunta || !elOpcoes || !elFeedback || !elProximo ||
      !elJogo || !elResultado || !elResultadoTitulo || !elResultadoTexto || !elReiniciar){
    return;
  }

  var reduzMovimento = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var DURACAO_FADE = reduzMovimento ? 0 : 220;

  function renderPergunta(){
    respondida = false;
    var p = perguntas[indiceAtual];
    elProgresso.textContent = 'Pergunta ' + (indiceAtual + 1) + ' de ' + perguntas.length;
    elPergunta.textContent = p.pergunta;
    elFeedback.textContent = '';
    elProximo.style.display = 'none';
    elOpcoes.innerHTML = '';

    p.opcoes.forEach(function(opcaoTexto, i){
      var btn = document.createElement('button');
      btn.className = 'quiz-opcao';
      btn.textContent = opcaoTexto;
      btn.addEventListener('click', function(){
        if (respondida) return;
        respondida = true;
        var botoes = elOpcoes.querySelectorAll('.quiz-opcao');
        botoes.forEach(function(b){ b.disabled = true; });

        if (i === p.correta){
          btn.classList.add('certa');
          acertos++;
          elFeedback.textContent = 'Certo — ' + p.explicacao;
        } else {
          btn.classList.add('errada');
          botoes[p.correta].classList.add('certa');
          elFeedback.textContent = 'Quase — ' + p.explicacao;
        }
        elProximo.style.display = 'inline-block';
      });
      elOpcoes.appendChild(btn);
    });
  }

  function trocarComFade(callback){
    elJogo.style.opacity = 0;
    setTimeout(function(){
      callback();
      elJogo.style.opacity = 1;
    }, DURACAO_FADE);
  }

  elProximo.addEventListener('click', function(){
    indiceAtual++;
    if (indiceAtual < perguntas.length){
      trocarComFade(renderPergunta);
    } else {
      elJogo.style.opacity = 0;
      setTimeout(function(){
        elJogo.style.display = 'none';
        elResultado.style.display = 'block';
        elResultado.style.opacity = 0;
        elResultadoTitulo.textContent = acertos + ' de ' + perguntas.length + ' acertos';
        if (acertos === perguntas.length){
          elResultadoTexto.textContent = 'Você entendeu bem os conceitos do EcoDove.';
        } else if (acertos > 0){
          elResultadoTexto.textContent = 'Bom resultado — vale reler as seções acima para reforçar.';
        } else {
          elResultadoTexto.textContent = 'Vale a pena reler a página para conhecer melhor o projeto.';
        }
        requestAnimationFrame(function(){ elResultado.style.opacity = 1; });
      }, DURACAO_FADE);
    }
  });

  elReiniciar.addEventListener('click', function(){
    elResultado.style.opacity = 0;
    setTimeout(function(){
      indiceAtual = 0;
      acertos = 0;
      elResultado.style.display = 'none';
      elJogo.style.display = 'block';
      elJogo.style.opacity = 0;
      renderPergunta();
      requestAnimationFrame(function(){ elJogo.style.opacity = 1; });
    }, DURACAO_FADE);
  });

  renderPergunta();
}

function initMotion(){
  var reduzMovimento = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var alvos = document.querySelectorAll('.reveal, .reveal-scale, .reveal-vitoria');

  if (!alvos.length) return;

  /* Reduced motion: mostra tudo de uma vez, sem observer, sem transição. */
  if (reduzMovimento){
    alvos.forEach(function(el){ el.classList.add('visible'); });
    return;
  }

  /* Sem suporte a IntersectionObserver: mostra tudo de uma vez
     (o CSS de base já garante que nada fica invisível mesmo sem isso). */
  if (!('IntersectionObserver' in window)){
    alvos.forEach(function(el){ el.classList.add('visible'); });
    return;
  }

  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (!entry.isIntersecting) return;
      var alvo = entry.target;
      /* Dois requestAnimationFrame garantem que o navegador pinte o
         estado inicial (opacidade 0) antes de iniciar a transição —
         sem isso, elementos já visíveis no carregamento (comum em
         telas grandes de desktop) pulam direto para o estado final
         sem transição perceptível. */
      requestAnimationFrame(function(){
        requestAnimationFrame(function(){
          alvo.classList.add('visible');
        });
      });
      observer.unobserve(alvo);
    });
  }, { threshold:0.1, rootMargin:'0px 0px -10% 0px' });

  alvos.forEach(function(el){ observer.observe(el); });
}

ready(function(){
  try { initQuiz(); }
  catch (erro) { console.error('EcoDove: falha ao iniciar o quiz.', erro); }

  try { initMotion(); }
  catch (erro) {
    console.error('EcoDove: falha ao iniciar as animações — conteúdo permanece visível normalmente.', erro);
    /* Fallback de segurança: se algo inesperado quebrar o motion,
       garante que nada fique preso em opacidade 0. */
    document.querySelectorAll('.reveal, .reveal-scale, .reveal-vitoria').forEach(function(el){
      el.classList.add('visible');
    });
  }
});
