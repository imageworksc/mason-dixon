/**
 * Mason Dixon Animal Emergency Hospital — Option B behavior.
 * Progressive enhancement on top of working HTML/CSS. No build step.
 */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------
     Full-screen mobile nav
     --------------------------------------------------------------- */
  function initNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) return;

    function setOpen(open) {
      menu.classList.toggle("is-open", open);
      menu.setAttribute("aria-hidden", String(!open));
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
      document.body.classList.toggle("nav-open", open);
    }

    toggle.addEventListener("click", function () {
      setOpen(!menu.classList.contains("is-open"));
    });
    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menu.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia("(min-width: 1024px)").addEventListener("change", function (event) {
      if (event.matches) setOpen(false);
    });
  }

  /* ---------------------------------------------------------------
     Dismissible alert ticker (remembered for the tab session)
     --------------------------------------------------------------- */
  function initAlertBar() {
    var bar = document.querySelector("[data-alert-bar]");
    var close = document.querySelector("[data-alert-dismiss]");
    if (!bar || !close) return;
    var key = "mdaeh-alert-dismissed";

    try {
      if (sessionStorage.getItem(key) === "1") bar.hidden = true;
    } catch (err) { /* storage unavailable — keep the bar visible */ }

    close.addEventListener("click", function () {
      bar.hidden = true;
      try { sessionStorage.setItem(key, "1"); } catch (err) { /* ignore */ }
    });
  }

  /* ---------------------------------------------------------------
     Scroll-driven state: solid header, sticky call bar, parallax band.
     One rAF-throttled listener for all three.
     --------------------------------------------------------------- */
  function initScrollState() {
    var header = document.querySelector("[data-site-header]");
    var callBar = document.querySelector("[data-call-bar]");
    var band = document.querySelector("[data-parallax]");
    var bandImg = band ? band.querySelector("img") : null;
    var desktop = window.matchMedia("(min-width: 1024px)");
    var ticking = false;

    function update() {
      var y = window.scrollY;
      if (header) header.classList.toggle("is-scrolled", y > 24);
      if (callBar) callBar.classList.toggle("is-visible", y > window.innerHeight * 0.6);

      if (bandImg && !reduceMotion && desktop.matches) {
        var rect = band.getBoundingClientRect();
        var vh = window.innerHeight;
        if (rect.bottom > 0 && rect.top < vh) {
          // -1 (band entering from bottom) … +1 (band leaving at top)
          var progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
          bandImg.style.setProperty("--parallax", (progress * -8).toFixed(2) + "%");
        }
      } else if (bandImg) {
        bandImg.style.removeProperty("--parallax");
      }
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  /* ---------------------------------------------------------------
     Scroll reveals via IntersectionObserver
     --------------------------------------------------------------- */
  function initReveals() {
    var targets = document.querySelectorAll("[data-reveal], [data-reveal-stagger], [data-reveal-side]");

    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var STEP = 70;
    var CAP = 8;
    document.querySelectorAll("[data-reveal-stagger]").forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (child, i) {
        child.style.setProperty("--reveal-delay", Math.min(i, CAP) * STEP + "ms");
      });
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------------------------------------------------------
     Team spotlight — native scroll-snap + prev/next (below desktop)
     --------------------------------------------------------------- */
  function initCarousel() {
    var carousel = document.querySelector("[data-carousel]");
    if (!carousel) return;
    var prev = document.querySelector("[data-carousel-prev]");
    var next = document.querySelector("[data-carousel-next]");

    function step() {
      var card = carousel.querySelector(".spot");
      var gap = parseFloat(getComputedStyle(carousel.querySelector(".spotlight__track")).columnGap) || 0;
      return card ? card.getBoundingClientRect().width + gap : carousel.clientWidth * 0.8;
    }
    function scrollByStep(dir) {
      carousel.scrollBy({ left: dir * step(), behavior: reduceMotion ? "auto" : "smooth" });
    }

    if (prev) prev.addEventListener("click", function () { scrollByStep(-1); });
    if (next) next.addEventListener("click", function () { scrollByStep(1); });
  }

  /* ---------------------------------------------------------------
     FAQ accordion (one open at a time, animated with grid rows)
     --------------------------------------------------------------- */
  function initAccordion() {
    var root = document.querySelector("[data-accordion]");
    if (!root) return;
    var items = Array.prototype.slice.call(root.querySelectorAll(".accordion__item"));

    function setOpen(item, open) {
      item.classList.toggle("is-open", open);
      item.querySelector(".accordion__trigger").setAttribute("aria-expanded", String(open));
    }

    items.forEach(function (item) {
      item.querySelector(".accordion__trigger").addEventListener("click", function () {
        var willOpen = !item.classList.contains("is-open");
        items.forEach(function (other) { if (other !== item) setOpen(other, false); });
        setOpen(item, willOpen);
      });
    });

    if (items[0]) setOpen(items[0], true);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initAlertBar();
    initScrollState();
    initReveals();
    initCarousel();
    initAccordion();
  });
})();
