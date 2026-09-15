/**
 * Mason Dixon Animal Emergency Hospital — site behavior.
 * ES module (deferred by default). Progressive enhancement on top of
 * working HTML/CSS; no build step.
 */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const desktop = window.matchMedia("(min-width: 1024px)");

/* ---------------------------------------------------------------
   Mobile nav toggle
   --------------------------------------------------------------- */
const initNav = () => {
  const toggle = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("[data-nav-menu]");
  if (!toggle || !menu) return;

  const setOpen = (open) => {
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };

  toggle.addEventListener("click", () => setOpen(!menu.classList.contains("is-open")));

  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
    }
  });

  desktop.addEventListener("change", (event) => {
    if (event.matches) setOpen(false);
  });
};

/* ---------------------------------------------------------------
   Dismissible emergency alert bar (remembered for the browser tab session)
   --------------------------------------------------------------- */
const initAlertBar = () => {
  const alertBar = document.querySelector("[data-alert-bar]");
  const closeBtn = document.querySelector("[data-alert-dismiss]");
  if (!alertBar || !closeBtn) return;
  const storageKey = "mdaeh-alert-dismissed";

  try {
    if (sessionStorage.getItem(storageKey) === "1") alertBar.hidden = true;
  } catch {
    /* sessionStorage unavailable (e.g. privacy mode) — alert just stays visible */
  }

  closeBtn.addEventListener("click", () => {
    alertBar.hidden = true;
    try { sessionStorage.setItem(storageKey, "1"); } catch { /* ignore */ }
  });
};

/* ---------------------------------------------------------------
   Sticky header shadow once the page scrolls
   --------------------------------------------------------------- */
const initHeaderScrollState = () => {
  const header = document.querySelector("[data-site-header]");
  if (!header) return;
  let ticking = false;

  const update = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 4);
    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }, { passive: true });

  update();
};

/* ---------------------------------------------------------------
   Load + scroll reveal animations (progressive enhancement)
   --------------------------------------------------------------- */
const initReveals = () => {
  // Reduced motion: the reveal styles don't apply anyway, so bail out.
  if (reduceMotion) return;

  // Stagger the children of each [data-reveal-stagger] group.
  const STEP = 80; // ms between siblings
  const CAP = 6;   // don't let long grids delay forever
  document.querySelectorAll("[data-reveal-stagger]").forEach((group) => {
    [...group.children].forEach((child, i) => {
      child.style.setProperty("--reveal-delay", `${Math.min(i, CAP) * STEP}ms`);
    });
  });

  // A rAF-throttled scroll check. Unlike IntersectionObserver this also
  // reveals elements that were scrolled PAST (top < 0) — so fast flicks,
  // End-key jumps, or deep-link anchors can never leave content hidden.
  let remaining = [...document.querySelectorAll("[data-reveal], [data-reveal-stagger]")];
  let ticking = false;

  const check = () => {
    ticking = false;
    const trigger = window.innerHeight * 0.9;
    remaining = remaining.filter((el) => {
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
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(check);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  // Re-check once images/fonts finish loading and the layout settles.
  window.addEventListener("load", onScroll);
  check(); // reveal whatever is already in view on load (the hero)
};

/* ---------------------------------------------------------------
   Team carousel — auto-scroll marquee with prev/next arrow controls.
   Takes over the CSS keyframe animation and drives scrollLeft so the
   arrows, hover-pause, and seamless loop all share one position model.
   --------------------------------------------------------------- */
const initTeamCarousel = () => {
  const marquee = document.querySelector("[data-marquee]");
  const track = marquee?.querySelector(".team-marquee__track");
  if (!marquee || !track) return;
  const prevBtn = document.querySelector("[data-marquee-prev]");
  const nextBtn = document.querySelector("[data-marquee-next]");

  // Hand off from the CSS animation to JS-driven scrolling.
  track.style.animation = "none";

  const stepAmount = () => {
    const card = track.querySelector(".team-card");
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap) || 0;
    return card ? card.getBoundingClientRect().width + gap : marquee.clientWidth * 0.8;
  };

  // The track holds two identical sets, so one set is exactly half its width.
  const halfWidth = () => track.scrollWidth / 2;

  let pos = 0;

  const apply = () => {
    const half = halfWidth();
    marquee.scrollLeft = half > 0 ? ((pos % half) + half) % half : pos;
  };

  /* Reduced motion: no auto-scroll or tweening. Arrows jump instantly. */
  if (reduceMotion) {
    prevBtn?.addEventListener("click", () => marquee.scrollBy({ left: -stepAmount() }));
    nextBtn?.addEventListener("click", () => marquee.scrollBy({ left: stepAmount() }));
    return;
  }

  const SPEED = 0.5; // px per frame (~30px/s at 60fps)
  let paused = false;
  let tweening = false;

  const tick = () => {
    if (!paused && !tweening) {
      const half = halfWidth();
      pos += SPEED;
      if (half > 0 && pos >= half) pos -= half;
      apply();
    }
    window.requestAnimationFrame(tick);
  };

  const animateBy = (delta) => {
    const startPos = pos;
    const duration = 450;
    let startTime = null;
    tweening = true;

    const frame = (t) => {
      if (startTime === null) startTime = t;
      const p = Math.min((t - startTime) / duration, 1);
      const ease = 0.5 - Math.cos(p * Math.PI) / 2; // easeInOutSine
      pos = startPos + delta * ease;
      apply();
      if (p < 1) {
        window.requestAnimationFrame(frame);
      } else {
        const half = halfWidth();
        if (half > 0) pos = ((pos % half) + half) % half;
        tweening = false;
      }
    };
    window.requestAnimationFrame(frame);
  };

  marquee.addEventListener("mouseenter", () => { paused = true; });
  marquee.addEventListener("mouseleave", () => { paused = false; });
  marquee.addEventListener("focusin", () => { paused = true; });
  marquee.addEventListener("focusout", () => { paused = false; });

  prevBtn?.addEventListener("click", () => animateBy(-stepAmount()));
  nextBtn?.addEventListener("click", () => animateBy(stepAmount()));

  window.requestAnimationFrame(tick);
};

initNav();
initAlertBar();
initHeaderScrollState();
initReveals();
initTeamCarousel();
