/**
 * Mason Dixon Animal Emergency Hospital — site behavior.
 * No build step: progressive enhancement on top of working HTML/CSS.
 */
(function () {
  "use strict";

  /* ---------------------------------------------------------------
     Mobile nav toggle
     --------------------------------------------------------------- */
  function initNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) return;

    function closeMenu() {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    function openMenu() {
      menu.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
    }

    toggle.addEventListener("click", function () {
      var isOpen = menu.classList.contains("is-open");
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menu.classList.contains("is-open")) {
        closeMenu();
        toggle.focus();
      }
    });

    var mobileBreakpoint = window.matchMedia("(min-width: 1024px)");
    mobileBreakpoint.addEventListener("change", function (event) {
      if (event.matches) closeMenu();
    });
  }

  /* ---------------------------------------------------------------
     Dismissible emergency alert bar (remembered for the browser tab session)
     --------------------------------------------------------------- */
  function initAlertBar() {
    var alertBar = document.querySelector("[data-alert-bar]");
    var closeBtn = document.querySelector("[data-alert-dismiss]");
    if (!alertBar || !closeBtn) return;

    var storageKey = "mdaeh-alert-dismissed";

    try {
      if (sessionStorage.getItem(storageKey) === "1") {
        alertBar.hidden = true;
      }
    } catch (err) {
      /* sessionStorage unavailable (e.g. privacy mode) — alert just stays visible */
    }

    closeBtn.addEventListener("click", function () {
      alertBar.hidden = true;
      try {
        sessionStorage.setItem(storageKey, "1");
      } catch (err) {
        /* ignore */
      }
    });
  }

  /* ---------------------------------------------------------------
     Sticky header shadow once the page scrolls
     --------------------------------------------------------------- */
  function initHeaderScrollState() {
    var header = document.querySelector("[data-site-header]");
    if (!header) return;

    var ticking = false;

    function update() {
      header.classList.toggle("is-scrolled", window.scrollY > 4);
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );

    update();
  }

  /* ---------------------------------------------------------------
     Load + scroll reveal animations (progressive enhancement)
     --------------------------------------------------------------- */
  function initReveals() {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Reduced motion: the reveal styles don't apply anyway, so bail out.
    if (reduce) return;

    // Stagger the children of each [data-reveal-stagger] group.
    var STEP = 80; // ms between siblings
    var CAP = 6; // don't let long grids delay forever
    document.querySelectorAll("[data-reveal-stagger]").forEach(function (group) {
      var kids = group.children;
      for (var i = 0; i < kids.length; i++) {
        kids[i].style.setProperty("--reveal-delay", Math.min(i, CAP) * STEP + "ms");
      }
    });

    // A rAF-throttled scroll check. Unlike IntersectionObserver this also
    // reveals elements that were scrolled PAST (top < 0) — so fast flicks,
    // End-key jumps, or deep-link anchors can never leave content hidden.
    var remaining = Array.prototype.slice.call(
      document.querySelectorAll("[data-reveal], [data-reveal-stagger]")
    );
    var ticking = false;

    function check() {
      ticking = false;
      var trigger = window.innerHeight * 0.9;
      remaining = remaining.filter(function (el) {
        if (el.getBoundingClientRect().top < trigger) {
          el.classList.add("is-visible");
          return false;
        }
        return true;
      });
      if (!remaining.length) {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      }
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(check);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // Re-check once images/fonts finish loading and the layout settles.
    window.addEventListener("load", onScroll);
    check(); // reveal whatever is already in view on load (the hero)
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initAlertBar();
    initHeaderScrollState();
    initReveals();
  });
})();
