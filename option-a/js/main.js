/**
 * Mason Dixon Animal Emergency Hospital — Option A behavior.
 * ES module (deferred by default). Progressive enhancement on top of
 * working HTML/CSS; no build step.
 */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const desktop = window.matchMedia("(min-width: 1024px)");

/* ---------------------------------------------------------------
   Full-screen mobile nav
   --------------------------------------------------------------- */
const initNav = () => {
  const toggle = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("[data-nav-menu]");
  if (!toggle || !menu) return;

  const setOpen = (open) => {
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    document.body.classList.toggle("nav-open", open);
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
   Header shadow + sticky call bar once the page scrolls
   --------------------------------------------------------------- */
const initScrollState = () => {
  const header = document.querySelector("[data-site-header]");
  const callBar = document.querySelector("[data-call-bar]");
  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    header?.classList.toggle("is-scrolled", y > 8);
    callBar?.classList.toggle("is-visible", y > window.innerHeight * 0.6);
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
   Scroll reveals via IntersectionObserver
   --------------------------------------------------------------- */
const initReveals = () => {
  const targets = document.querySelectorAll("[data-reveal], [data-reveal-stagger], [data-reveal-side]");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const STEP = 70; // ms between siblings
  const CAP = 8;   // never delay a long grid forever
  document.querySelectorAll("[data-reveal-stagger]").forEach((group) => {
    [...group.children].forEach((child, i) => {
      child.style.setProperty("--reveal-delay", `${Math.min(i, CAP) * STEP}ms`);
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      // Also reveal anything already scrolled past (deep links, fast flicks)
      if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });

  targets.forEach((el) => observer.observe(el));
};

/* ---------------------------------------------------------------
   FAQ accordion (one open at a time, animated with grid rows)
   --------------------------------------------------------------- */
const initAccordion = () => {
  const root = document.querySelector("[data-accordion]");
  if (!root) return;
  const items = [...root.querySelectorAll(".accordion__item")];

  const setOpen = (item, open) => {
    item.classList.toggle("is-open", open);
    item.querySelector(".accordion__trigger").setAttribute("aria-expanded", String(open));
  };

  items.forEach((item) => {
    item.querySelector(".accordion__trigger").addEventListener("click", () => {
      const willOpen = !item.classList.contains("is-open");
      items.forEach((other) => { if (other !== item) setOpen(other, false); });
      setOpen(item, willOpen);
    });
  });

  // Open the first answer by default so the section never looks empty.
  if (items[0]) setOpen(items[0], true);
};

initNav();
initScrollState();
initReveals();
initAccordion();
