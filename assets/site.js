/* Midgard Survivors Guides — theme, language, sidebar scrollspy, mobile menu. No dependencies. */
(function () {
  var root = document.documentElement;
  var LABEL = { en: ["Dark", "Light"], pt: ["Escuro", "Claro"], es: ["Oscuro", "Claro"], zh: ["深色", "淺色"] };
  var cur = root.getAttribute("data-lang-default") || "en";

  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  /* theme */
  function paintTheme() {
    var b = document.getElementById("themebtn"); if (!b) return;
    var d = root.classList.contains("dark");
    b.setAttribute("aria-pressed", d ? "true" : "false");
    var t = b.querySelector(".t"); if (t) t.textContent = (LABEL[cur] || LABEL.en)[d ? 1 : 0];
  }
  window.toggleTheme = function () { var d = root.classList.toggle("dark"); store("theme", d ? "dark" : "light"); paintTheme(); };

  /* language (only on pages with .lang blocks) */
  var blocks = document.querySelectorAll(".lang");
  window.setLang = function (l) {
    if (!blocks.length || !document.getElementById("lang-" + l)) return;
    cur = l;
    blocks.forEach(function (e) { e.classList.toggle("on", e.id === "lang-" + l); });
    document.querySelectorAll("[data-l]").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.l === l ? "true" : "false"); });
    root.lang = document.getElementById("lang-" + l).getAttribute("lang");
    store("lang", l); paintTheme(); spy();
  };
  if (blocks.length) {
    var q = (location.search.match(/[?&]lang=(en|pt|es|zh)/) || location.hash.match(/^#(en|pt|es|zh)$/) || [])[1];
    var l = q || read("lang");
    if (!l) { var n = (navigator.language || "en").toLowerCase(); l = n.indexOf("pt") === 0 ? "pt" : n.indexOf("es") === 0 ? "es" : n.indexOf("zh") === 0 ? "zh" : "en"; }
    setLang(l);
  }
  paintTheme();

  /* mobile menu */
  var mb = document.getElementById("menubtn");
  if (mb) mb.addEventListener("click", function () {
    var h = document.querySelector(".site-header"); var o = h.classList.toggle("open"); mb.setAttribute("aria-expanded", o ? "true" : "false");
  });

  /* sidebar scrollspy */
  var observer = null;
  function spy() {
    if (observer) observer.disconnect();
    var scope = document.querySelector(".lang.on") || document.querySelector(".guide");
    if (!scope || !("IntersectionObserver" in window)) return;
    var links = scope.querySelectorAll(".toc a[href^='#']");
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    if (links.length && !scope.querySelector(".toc a.active")) links[0].classList.add("active");
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("active"); });
        var a = map[e.target.id]; if (!a) return;
        a.classList.add("active");
        var bar = a.parentElement; if (bar && bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: a.offsetLeft - 40, behavior: "smooth" });
      });
    }, { rootMargin: "-25% 0px -65% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) observer.observe(s); });
  }
  spy();

  /* collapsible sections: click the red title bar to fold a window */
  function setOpen(sec, open) {
    sec.classList.toggle("collapsed", !open);
    var h = sec.querySelector(":scope > h2"); if (h) h.setAttribute("aria-expanded", open ? "true" : "false");
  }
  document.querySelectorAll("section[id] > h2").forEach(function (h) {
    var sec = h.parentElement;
    h.classList.add("toggle"); h.setAttribute("role", "button"); h.setAttribute("tabindex", "0"); h.setAttribute("aria-expanded", "true");
    h.addEventListener("click", function () { setOpen(sec, sec.classList.contains("collapsed")); });
    h.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(sec, sec.classList.contains("collapsed")); }
    });
  });
  /* a menu link to a folded section opens it first */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest(".toc a[href^='#']"); if (!a) return;
    var s = document.getElementById(a.getAttribute("href").slice(1));
    if (s && s.classList.contains("collapsed")) setOpen(s, true);
  });
})();
