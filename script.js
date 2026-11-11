/*
  Mercado Acessível - script.js

  PARA ATIVAR O FORMULÁRIO DE CONTATO:
  escreva o e-mail do grupo entre as aspas da linha abaixo.
  Exemplo: const emailDoGrupo = "grupo@exemplo.com";
*/
var emailDoGrupo = "";

(function () {
    "use strict";

    var raiz = document.documentElement;

    /* ---------- Animação ao rolar ---------- */
    var blocos = document.querySelectorAll(".animar");

    if ("IntersectionObserver" in window) {
        document.body.classList.add("com-js");
        var observador = new IntersectionObserver(function (itens) {
            itens.forEach(function (item) {
                if (item.isIntersecting) {
                    item.target.classList.add("visivel");
                    observador.unobserve(item.target);
                }
            });
        });
        blocos.forEach(function (bloco) {
            observador.observe(bloco);
        });
    }

    /* ---------- Barra de acessibilidade ---------- */
    var PASSOS = [90, 100, 115, 130, 150];
    var passo = 1;
    var contraste = false;

    function ler(chave) {
        try { return window.localStorage.getItem(chave); } catch (e) { return null; }
    }

    function gravar(chave, valor) {
        try { window.localStorage.setItem(chave, valor); } catch (e) { /* sem armazenamento */ }
    }

    var salvoPasso = parseInt(ler("ma-fonte"), 10);
    if (salvoPasso >= 0 && salvoPasso < PASSOS.length) {
        passo = salvoPasso;
    }
    contraste = ler("ma-contraste") === "1";

    var barra = document.createElement("div");
    barra.className = "acessibilidade";
    barra.setAttribute("role", "region");
    barra.setAttribute("aria-label", "Ferramentas de acessibilidade");

    var rotulo = document.createElement("span");
    rotulo.className = "rotulo";
    rotulo.setAttribute("aria-hidden", "true");
    rotulo.textContent = "Acessibilidade:";

    function criarBotao(texto, descricao) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = texto;
        b.setAttribute("aria-label", descricao);
        return b;
    }

    var botaoMenos = criarBotao("A−", "Diminuir fonte");
    var botaoMais = criarBotao("A+", "Aumentar fonte");
    var botaoContraste = criarBotao("Alto contraste", "Alto contraste");

    var anuncio = document.createElement("p");
    anuncio.className = "sr-only";
    anuncio.setAttribute("role", "status");
    anuncio.setAttribute("aria-live", "polite");

    barra.appendChild(rotulo);
    barra.appendChild(botaoMenos);
    barra.appendChild(botaoMais);
    barra.appendChild(botaoContraste);
    barra.appendChild(anuncio);

    var cabecalho = document.querySelector(".cabecalho");
    if (cabecalho) {
        document.body.insertBefore(barra, cabecalho);
    } else {
        document.body.insertBefore(barra, document.body.firstChild);
    }

    function falar(texto) {
        anuncio.textContent = "";
        window.setTimeout(function () { anuncio.textContent = texto; }, 60);
    }

    function aplicar(avisar) {
        raiz.style.setProperty("--tam-fonte", PASSOS[passo] + "%");
        raiz.classList.toggle("alto-contraste", contraste);
        botaoContraste.setAttribute("aria-pressed", contraste ? "true" : "false");
        botaoMenos.disabled = passo === 0;
        botaoMais.disabled = passo === PASSOS.length - 1;
        gravar("ma-fonte", String(passo));
        gravar("ma-contraste", contraste ? "1" : "0");
        if (avisar) { falar(avisar); }
    }

    botaoMenos.addEventListener("click", function () {
        if (passo > 0) {
            passo -= 1;
            aplicar("Fonte diminuída para " + PASSOS[passo] + " por cento.");
        }
    });

    botaoMais.addEventListener("click", function () {
        if (passo < PASSOS.length - 1) {
            passo += 1;
            aplicar("Fonte aumentada para " + PASSOS[passo] + " por cento.");
        }
    });

    botaoContraste.addEventListener("click", function () {
        contraste = !contraste;
        aplicar(contraste ? "Alto contraste ativado." : "Alto contraste desativado.");
    });

    aplicar("");

    /* ---------- Pular para o conteúdo ---------- */
    var pular = document.querySelector(".pular-conteudo");
    var principal = document.getElementById("conteudo");
    if (pular && principal) {
        pular.addEventListener("click", function (evento) {
            evento.preventDefault();
            principal.focus();
            principal.scrollIntoView();
        });
    }

    /* ---------- Menu: página atual e foco ao navegar ---------- */
    var linksMenu = Array.prototype.slice.call(document.querySelectorAll(".navegacao a"));
    var secoesMenu = linksMenu.map(function (a) {
        return document.getElementById(a.getAttribute("href").slice(1));
    });

    function marcarAtual() {
        var atual = 0;
        var limite = window.innerHeight * 0.35;
        secoesMenu.forEach(function (secao, i) {
            if (secao && secao.getBoundingClientRect().top <= limite) { atual = i; }
        });
        if (window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 4) {
            atual = secoesMenu.length - 1;
        }
        linksMenu.forEach(function (a, i) {
            if (i === atual) {
                a.classList.add("ativo");
                a.setAttribute("aria-current", "location");
            } else {
                a.classList.remove("ativo");
                a.removeAttribute("aria-current");
            }
        });
    }

    var esperando = false;
    window.addEventListener("scroll", function () {
        if (esperando) { return; }
        esperando = true;
        window.requestAnimationFrame(function () { esperando = false; marcarAtual(); });
    }, { passive: true });
    window.addEventListener("resize", marcarAtual);
    marcarAtual();

    /* Ao usar um link interno, leva o foco ao título da seção (ajuda leitores de tela) */
    document.addEventListener("click", function (evento) {
        var link = evento.target.closest ? evento.target.closest('a[href^="#"]') : null;
        if (!link || link.classList.contains("pular-conteudo")) { return; }
        var alvo = document.getElementById(link.getAttribute("href").slice(1));
        if (!alvo) { return; }
        var titulo = alvo.querySelector("h1, h2, h3") || alvo;
        if (!titulo.hasAttribute("tabindex")) { titulo.setAttribute("tabindex", "-1"); }
        window.setTimeout(function () { titulo.focus({ preventScroll: true }); }, 50);
    });

    /* ---------- Formulário de contato ---------- */
    var formulario = document.getElementById("formulario-contato");

    if (formulario) {
        var aviso = document.getElementById("aviso-formulario");

        function mostrarAviso(texto) {
            aviso.textContent = "";
            window.setTimeout(function () { aviso.textContent = texto; }, 60);
        }

        function valor(id) {
            var campo = document.getElementById(id);
            return campo ? campo.value : "";
        }

        formulario.addEventListener("submit", function (evento) {
            evento.preventDefault();

            if (emailDoGrupo === "") {
                mostrarAviso("O envio por este formulário ainda não está ativo. Tente novamente mais tarde.");
                return;
            }

            var texto =
                "Nome: " + valor("nome") + "\n" +
                "E-mail: " + valor("email") + "\n" +
                "Telefone: " + valor("telefone") + "\n" +
                "Tipo: " + valor("tipo") + "\n\n" +
                valor("mensagem");

            window.location.href =
                "mailto:" + emailDoGrupo +
                "?subject=" + encodeURIComponent(valor("assunto")) +
                "&body=" + encodeURIComponent(texto);

            mostrarAviso("Se o e-mail não abriu, confira se há um aplicativo de e-mail no aparelho.");
        });
    }
})();
