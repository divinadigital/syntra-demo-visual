// Demonstração estática do novo visual do Syntra: as telas foram capturadas do
// sistema com dados fictícios; este script só dá vida ao que é de visual.
(function () {
  var raiz = document.documentElement;

  // Tema: lembra a escolha entre as páginas; padrão = o do sistema operacional.
  var salvo = null;
  try { salvo = localStorage.getItem("syntra-demo-tema"); } catch (e) {}
  var tema = salvo || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  raiz.dataset.theme = tema;

  function rotularTema() {
    document.querySelectorAll("button.tema-toggle").forEach(function (b) {
      var escuro = raiz.dataset.theme === "dark";
      b.innerHTML = '<span aria-hidden="true">' + (escuro ? "☀️" : "🌙") + "</span> " + (escuro ? "Claro" : "Escuro");
      b.title = escuro ? "Mudar para o tema claro" : "Mudar para o tema escuro";
    });
  }

  function trocarTema(ev) {
    var novo = raiz.dataset.theme === "dark" ? "light" : "dark";
    var aplicar = function () { raiz.dataset.theme = novo; rotularTema(); };
    try { localStorage.setItem("syntra-demo-tema", novo); } catch (e) {}
    var semMov = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || semMov) return aplicar();
    var cx = ev.currentTarget.getBoundingClientRect();
    var x = ev.clientX || cx.left + cx.width / 2, y = ev.clientY || cx.top + cx.height / 2;
    var r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(aplicar).ready.then(function () {
      raiz.animate({ clipPath: ["circle(0px at " + x + "px " + y + "px)", "circle(" + r + "px at " + x + "px " + y + "px)"] },
        { duration: 600, easing: "cubic-bezier(.4,0,.2,1)", pseudoElement: "::view-transition-new(root)" });
    });
  }

  // Aviso curto para o que não faz parte da demonstração.
  var avisoT;
  function avisar(txt) {
    var a = document.getElementById("demo-aviso");
    if (!a) { a = document.createElement("div"); a.id = "demo-aviso"; a.setAttribute("role", "status"); document.body.appendChild(a); }
    a.textContent = txt; a.classList.add("on");
    clearTimeout(avisoT); avisoT = setTimeout(function () { a.classList.remove("on"); }, 2600);
  }

  document.addEventListener("DOMContentLoaded", function () {
    rotularTema();
    document.querySelectorAll("button.tema-toggle").forEach(function (b) { b.addEventListener("click", trocarTema); });

    // Zoom da tela.
    var z = null; try { z = localStorage.getItem("syntra-demo-zoom"); } catch (e) {}
    var sel = document.querySelector("select.zoom-sel");
    function aplicarZoom(v) { raiz.style.zoom = v === "100" ? "" : String(Number(v) / 100); }
    if (sel) {
      if (z) { sel.value = z; aplicarZoom(z); }
      sel.addEventListener("change", function () { aplicarZoom(sel.value); try { localStorage.setItem("syntra-demo-zoom", sel.value); } catch (e) {} });
    }

    // Grupos do menu abrem e fecham.
    document.querySelectorAll(".gm-toggle").forEach(function (t) {
      t.addEventListener("click", function () {
        var filhos = t.closest(".gm-grupo") && t.closest(".gm-grupo").querySelector(".gm-filhos");
        if (!filhos) return;
        var aberto = filhos.classList.toggle("abertos");
        t.setAttribute("aria-expanded", String(aberto));
        var seta = t.querySelector(".gm-seta"); if (seta) seta.classList.toggle("aberta", aberto);
      });
    });

    // Recolher/mostrar o menu.
    document.querySelectorAll(".menu-recolher-btn").forEach(function (b) { b.addEventListener("click", function () { document.body.classList.add("menu-recolhido"); }); });
    document.querySelectorAll(".menu-expandir-btn").forEach(function (b) { b.addEventListener("click", function () { document.body.classList.remove("menu-recolhido"); }); });

    // Busca do Manual (sem acento, enquanto digita).
    var busca = document.querySelector('.manual-indice input[type="search"]');
    if (busca) {
      var norm = function (s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); };
      busca.addEventListener("input", function () {
        var t = norm(busca.value.trim());
        document.querySelectorAll(".manual-secao").forEach(function (sec) {
          var vis = 0;
          sec.querySelectorAll(".manual-item").forEach(function (it) {
            var ok = !t || norm(it.textContent).indexOf(t) >= 0;
            it.style.display = ok ? "" : "none"; if (ok) vis++;
          });
          sec.style.display = vis ? "" : "none";
          var link = document.querySelector('.manual-indice nav a[href="#' + sec.id + '"]');
          if (link) { link.style.display = vis ? "" : "none"; var n = link.querySelector("small"); if (n) n.textContent = vis; }
        });
      });
    }

    // Links e botões fora da demonstração.
    document.addEventListener("click", function (e) {
      var a = e.target.closest("[data-fora-da-demo]");
      if (a) { e.preventDefault(); avisar("Esta tela não faz parte da demonstração do visual."); return; }
      var b = e.target.closest("button, input[type=submit]");
      if (b && !b.classList.contains("tema-toggle") && !b.classList.contains("gm-toggle") && !b.classList.contains("menu-recolher-btn") && !b.classList.contains("menu-expandir-btn") && !b.closest(".pac-busca")) {
        avisar("Demonstração só do visual: os botões não gravam nada.");
      }
    });

    // Selo fixo: deixa claro que é uma demonstração.
    var selo = document.createElement("div");
    selo.id = "demo-selo";
    selo.textContent = "Demonstração do novo visual · dados fictícios";
    document.body.appendChild(selo);
  });
})();
