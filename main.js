(function () {
  "use strict";

  var B = window.__BRAND__ || {};
  var hoverCapable = window.matchMedia("(hover: hover)").matches;

  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---------- Splash ---------- */
  function initSplash() {
    var splash = $("[data-splash]");
    if (!splash) return;
    var hide = function () { splash.classList.add("is-out"); };
    if (document.readyState === "complete") setTimeout(hide, 500);
    else window.addEventListener("load", function () { setTimeout(hide, 350); });
    setTimeout(hide, 4000);
  }

  /* ---------- Nav: hide on scroll down, indicator, current section ---------- */
  function initNav() {
    var nav = $("[data-nav]");
    if (!nav) return;
    var lastY = window.scrollY;
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      var menuOpen = document.body.classList.contains("menu-open");
      var locked = Date.now() < (window.__navLockUntil || 0);
      if (!menuOpen) {
        var hidden = !locked && y > lastY && y > 400;
        nav.classList.toggle("is-hidden", hidden);
        document.documentElement.classList.toggle("nav-is-hidden", hidden);
      }
      lastY = y;
    }, { passive: true });

    var links = $$(".nav-links a");
    var indicator = $(".nav-indicator");
    function moveTo(a) {
      if (!indicator || !a) { if (indicator) indicator.style.opacity = "0"; return; }
      indicator.style.width = a.offsetWidth + "px";
      indicator.style.transform = "translateX(" + a.offsetLeft + "px)";
      indicator.style.opacity = "1";
    }
    var current = null;
    links.forEach(function (a) {
      a.addEventListener("mouseover", function () { moveTo(a); });
    });
    var wrap = $(".nav-links");
    if (wrap) wrap.addEventListener("mouseout", function (e) {
      if (!wrap.contains(e.relatedTarget)) moveTo(current);
    });

    var sections = links.map(function (a) { return $(a.getAttribute("href")); }).filter(Boolean);
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var id = "#" + en.target.id;
          links.forEach(function (a) {
            var on = a.getAttribute("href") === id;
            a.classList.toggle("is-current", on);
            if (on) current = a;
          });
          moveTo(current);
        });
      }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
      sections.forEach(function (s) { io.observe(s); });
    }
  }

  /* ---------- Mobile menu ---------- */
  function initMenu() {
    var btn = $("[data-burger]");
    var menu = $("[data-menu]");
    if (!btn || !menu) return;
    function setOpen(open) {
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      document.body.classList.toggle("menu-open", open);
      if (open) {
        var nav = $("[data-nav]");
        if (nav) nav.classList.remove("is-hidden");
        menu.hidden = false;
        requestAnimationFrame(function () { menu.classList.add("is-open"); });
        document.body.style.overflow = "hidden";
      } else {
        menu.classList.remove("is-open");
        document.body.style.overflow = "";
        setTimeout(function () { if (!menu.classList.contains("is-open")) menu.hidden = true; }, 350);
      }
    }
    btn.addEventListener("click", function () { setOpen(btn.getAttribute("aria-expanded") !== "true"); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && document.body.classList.contains("menu-open")) setOpen(false); });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveals() {
    var els = $$(".reveal:not([data-split])");
    if (!("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("is-visible"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var siblings = el.parentElement ? $$(":scope > .reveal", el.parentElement) : [];
        var idx = Math.max(0, siblings.indexOf(el));
        el.style.transitionDelay = Math.min(idx * 80, 320) + "ms";
        el.classList.add("is-visible");
        io.unobserve(el);
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { io.observe(el); });
    setTimeout(function () {
      $$(".reveal:not(.is-visible)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-visible");
      });
    }, 6000);
  }

  /* ---------- Count up ---------- */
  function initCounters() {
    var els = $$("[data-count]");
    if (!els.length || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, end = parseInt(el.getAttribute("data-count"), 10) || 0, t0 = null;
        io.unobserve(el);
        function step(t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / 1400, 1);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.01 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Services tabs (ARIA tabs pattern) ---------- */
  function initTabs() {
    $$("[data-tabs]").forEach(function (root) {
      if (root.dataset.bound) return;
      root.dataset.bound = "1";
      var tabs = $$('[role="tab"]', root);
      function select(tab, focus) {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute("aria-selected", String(on));
          t.tabIndex = on ? 0 : -1;
          var panel = document.getElementById(t.getAttribute("aria-controls"));
          if (!panel) return;
          panel.hidden = !on;
          panel.classList.toggle("is-active", on);
        });
        if (focus) tab.focus({ preventScroll: true });
        var list = tab.parentElement;
        if (window.matchMedia("(max-width: 960px)").matches && list) {
          // centrar el chip dentro de la barra horizontal sin mover la página
          list.scrollTo({ left: tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2, behavior: "smooth" });
        }
        bringPanelIntoView();
      }
      // Si el panel quedó fuera de vista (p. ej. al elegir un servicio de abajo), lo acerca suavemente
      function bringPanelIntoView() {
        var panels = $(".svc-panels", root);
        var list = $(".svc-list", root);
        if (!panels) return;
        var mobile = window.matchMedia("(max-width: 960px)").matches;
        var nav = $("[data-nav]");
        // mismo valor que usa el CSS para el "top" sticky de la lista
        var navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 84;
        var offset = mobile && list ? navH + 4 + list.offsetHeight + 12 : navH + 24;
        var top = panels.getBoundingClientRect().top;
        if (top >= offset - 4 && top < window.innerHeight * 0.45) return;
        window.__navLockUntil = Date.now() + 1200;
        if (nav) { nav.classList.remove("is-hidden"); document.documentElement.classList.remove("nav-is-hidden"); }
        window.scrollTo({
          top: top + window.scrollY - offset,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
        });
      }
      tabs.forEach(function (tab, i) {
        tab.addEventListener("click", function () { select(tab, false); });
        tab.addEventListener("keydown", function (e) {
          var k = e.key, n = null;
          if (k === "ArrowDown" || k === "ArrowRight") n = tabs[(i + 1) % tabs.length];
          if (k === "ArrowUp" || k === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
          if (k === "Home") n = tabs[0];
          if (k === "End") n = tabs[tabs.length - 1];
          if (n) { e.preventDefault(); select(n, true); }
        });
      });
    });
  }

  /* ---------- Care plan ---------- */
  var CARE = {
    perro: {
      joven: {
        vacunas: "Esquema inicial desde las 6–8 semanas, con refuerzos cada 3–4 semanas hasta completar. Antirrábica a partir de los 3 meses.",
        parasitos: "Cada 15 días hasta los 3 meses y luego mensual hasta los 6 meses. Control de pulgas y garrapatas desde el inicio.",
        chequeos: "Una visita con cada vacuna para vigilar crecimiento, dientes de leche y socialización.",
        nutricion: "Alimento de crecimiento, 3 a 4 raciones al día. Nada de huesos cocidos ni comida condimentada.",
        nota: "Buen momento para hablar de esterilización: suele recomendarse antes del año."
      },
      adulto: {
        vacunas: "Refuerzo anual de la vacuna múltiple y la antirrábica.",
        parasitos: "Desparasitación interna cada 3 meses y protección externa continua contra pulgas y garrapatas.",
        chequeos: "Un chequeo completo al año, con revisión dental y de peso.",
        nutricion: "Alimento de mantenimiento en 2 raciones. Los premios no deberían pasar del 10 % de lo que come al día.",
        nota: "Si tu perro sale mucho al parque o convive con otros, pregunta por vacunas adicionales."
      },
      senior: {
        vacunas: "Mantener el refuerzo anual; la protección sigue siendo importante con la edad.",
        parasitos: "Cada 3 meses, con productos ajustados a su peso y condición.",
        chequeos: "Cada 6 meses, con exámenes de sangre para vigilar riñón, hígado y corazón.",
        nutricion: "Dieta senior, más fácil de digerir y con apoyo articular. Vigila cambios de peso.",
        nota: "Rigidez al levantarse, más sed o cansancio son señales para adelantar la visita."
      }
    },
    gato: {
      joven: {
        vacunas: "Triple felina desde las 8 semanas con refuerzos cada 3–4 semanas. Antirrábica a partir de los 3 meses.",
        parasitos: "Cada 15 días hasta los 3 meses y luego mensual hasta los 6 meses, interna y externa.",
        chequeos: "Una visita con cada vacuna. Es el momento de acostumbrarlo al guacal.",
        nutricion: "Alimento para gatitos, en varias porciones pequeñas al día, con agua fresca siempre disponible.",
        nota: "La esterilización temprana previene marcaje, celos y escapes."
      },
      adulto: {
        vacunas: "Refuerzo anual de la triple felina y la antirrábica, incluso si no sale de casa.",
        parasitos: "Cada 3 meses. Los gatos de apartamento también se contagian por zapatos y otras mascotas.",
        chequeos: "Un chequeo al año. Los gatos esconden el dolor; la revisión detecta lo que no muestran.",
        nutricion: "Controla el peso: los gatos esterilizados tienden a engordar. Fomenta que tome agua.",
        nota: "Vómitos frecuentes de bolas de pelo no son normales; cuéntanos en consulta."
      },
      senior: {
        vacunas: "Mantener el refuerzo anual según su estado de salud.",
        parasitos: "Cada 3 meses, con productos suaves y dosis ajustadas.",
        chequeos: "Cada 6 meses, con exámenes de riñón y tiroides, frecuentes en gatos mayores.",
        nutricion: "Dietas senior o renales según indicación. Comida húmeda ayuda a su hidratación.",
        nota: "Más sed, más orina o pérdida de peso son motivos para venir pronto."
      }
    }
  };

  function initCare() {
    var root = $("[data-care]");
    if (!root || root.dataset.bound) return;
    root.dataset.bound = "1";
    var board = $(".care-board", root);
    var seg = $(".seg", root);
    var state = { species: "perro", stage: "joven" };

    function render() {
      var data = CARE[state.species][state.stage];
      board.classList.add("is-swapping");
      setTimeout(function () {
        $$("[data-care-field]", root).forEach(function (el) {
          var k = el.getAttribute("data-care-field");
          if (data[k]) el.textContent = data[k];
        });
        board.classList.remove("is-swapping");
      }, 220);
    }
    function wire(selector, key) {
      var btns = $$(selector, root);
      btns.forEach(function (b, i) {
        b.addEventListener("click", function () {
          btns.forEach(function (o) {
            var on = o === b;
            o.classList.toggle("is-on", on);
            o.setAttribute("aria-checked", String(on));
          });
          state[key] = b.getAttribute("data-" + key);
          if (key === "species" && seg) seg.setAttribute("data-pos", String(i));
          var stageLabels = $$("[data-stage] b", root);
          if (key === "species" && stageLabels[0]) stageLabels[0].textContent = state.species === "gato" ? "Gatito" : "Cachorro";
          render();
        });
      });
    }
    wire("[data-species]", "species");
    wire("[data-stage]", "stage");
  }

  /* ---------- Opening hours + live status ---------- */
  function fmt(h) {
    var hh = Math.floor(h), mm = Math.round((h - hh) * 60);
    var suffix = hh >= 12 ? "p. m." : "a. m.";
    var h12 = hh % 12 === 0 ? 12 : hh % 12;
    return h12 + ":" + (mm < 10 ? "0" : "") + mm + " " + suffix;
  }
  function bogotaNow() {
    // Pereira está en UTC-5 todo el año (sin horario de verano)
    var d = new Date();
    var utc = d.getTime() + d.getTimezoneOffset() * 60000;
    return new Date(utc - 5 * 3600000);
  }
  var DAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

  function initHours() {
    var hours = B.hours;
    if (!hours) return;
    var now = bogotaNow();
    var day = now.getDay();
    var h = now.getHours() + now.getMinutes() / 60;
    var today = hours[day];
    var open = today && h >= today[0] && h < today[1];
    var title, sub;

    if (open) {
      title = "Abierto ahora";
      sub = "Hoy atendemos hasta las " + fmt(today[1]);
    } else {
      var nd = day, nextOpen;
      if (today && h < today[0]) { nextOpen = today[0]; }
      else { nd = (day + 1) % 7; nextOpen = hours[nd][0]; }
      title = "Cerrado en este momento";
      sub = "Abrimos " + (nd === day ? "hoy" : (nd === (day + 1) % 7 ? "mañana" : "el " + DAYS[nd])) + " a las " + fmt(nextOpen);
    }

    $$("[data-status-title]").forEach(function (el) { el.textContent = title; });
    $$("[data-status-sub]").forEach(function (el) { el.textContent = sub; });
    $$("[data-live-dot]").forEach(function (el) { el.classList.toggle("is-closed", !open); });
    $$("[data-status-box]").forEach(function (el) { el.classList.toggle("is-closed", !open); });
    var row = $('[data-hours] tr[data-day="' + day + '"]');
    if (row) row.classList.add("is-today");
  }

  /* ---------- Dialogs ---------- */
  function initDialogs() {
    $$("[data-dialog-open]").forEach(function (btn) {
      if (btn.dataset.bound) return;
      btn.dataset.bound = "1";
      btn.addEventListener("click", function () {
        var d = document.getElementById(btn.getAttribute("data-dialog-open"));
        if (!d) return;
        if (typeof d.showModal === "function") { d.showModal(); document.body.style.overflow = "hidden"; }
        else d.setAttribute("open", "");
      });
    });
    $$("dialog.modal").forEach(function (d) {
      if (d.dataset.bound) return;
      d.dataset.bound = "1";
      d.addEventListener("close", function () { document.body.style.overflow = ""; });
      d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
      $$("[data-dialog-close]", d).forEach(function (b) {
        b.addEventListener("click", function () { if (d.close) d.close(); else d.removeAttribute("open"); });
      });
    });
  }

  /* ---------- Gallery filter ---------- */
  function initGallery() {
    var items = $$("[data-gallery] .g-item");
    var btns = $$("[data-filter]");
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        var f = b.getAttribute("data-filter");
        btns.forEach(function (o) { var on = o === b; o.classList.toggle("is-on", on); o.setAttribute("aria-pressed", String(on)); });
        items.forEach(function (it) {
          var match = f === "todos" || it.getAttribute("data-kind") === f;
          if (match) { it.classList.remove("is-hidden"); requestAnimationFrame(function () { it.classList.remove("is-dim"); }); }
          else {
            it.classList.add("is-dim");
            setTimeout(function () { if (it.classList.contains("is-dim")) it.classList.add("is-hidden"); }, 380);
          }
        });
      });
    });
  }

  /* ---------- Tilt (pointer devices only) ---------- */
  function initTilt() {
    if (!hoverCapable) return;
    $$(".tilt").forEach(function (card) {
      if (card.dataset.tilt) return;
      card.dataset.tilt = "1";
      card.style.transition = "transform .5s cubic-bezier(.16,1,.3,1), opacity .9s cubic-bezier(.16,1,.3,1)";
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(900px) rotateX(" + (-y * 6) + "deg) rotateY(" + (x * 6) + "deg) translateY(-3px)";
      });
      card.addEventListener("mouseout", function (e) {
        if (!card.contains(e.relatedTarget)) card.style.transform = "";
      });
    });
  }

  /* ---------- Magnetic CTAs ---------- */
  function initMagnetic() {
    if (!hoverCapable) return;
    $$(".magnetic").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        el.style.transform = "translate(" + x * 0.2 + "px," + y * 0.3 + "px)";
      });
      el.addEventListener("mouseout", function (e) {
        if (!el.contains(e.relatedTarget)) el.style.transform = "";
      });
    });
  }

  /* ---------- Hero parallax (GSAP, subtle) ---------- */
  function initParallax() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    var img = $(".hero-photo img");
    if (img) {
      gsap.to(img, { yPercent: 8, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.5 } });
    }
    var cta = $(".cta-bg");
    if (cta) {
      gsap.fromTo(cta, { scale: 1.12 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".cta-card", start: "top bottom", end: "bottom top", scrub: 0.5 } });
    }
  }

  function initYear() {
    var y = $("[data-year]");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function boot() {
    safe(initSplash, "initSplash");
    safe(initNav, "initNav");
    safe(initMenu, "initMenu");
    safe(initReveals, "initReveals");
    safe(initCounters, "initCounters");
    safe(initTabs, "initTabs");
    safe(initCare, "initCare");
    safe(initHours, "initHours");
    safe(initDialogs, "initDialogs");
    safe(initGallery, "initGallery");
    safe(initTilt, "initTilt");
    safe(initMagnetic, "initMagnetic");
    safe(initParallax, "initParallax");
    safe(initYear, "initYear");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
