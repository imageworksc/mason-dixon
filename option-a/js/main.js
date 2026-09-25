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
   Scroll-driven state: header shadow, sticky call bar, and the
   why-us photo band's parallax. One rAF-throttled listener for all.
   --------------------------------------------------------------- */
const initScrollState = () => {
  const header = document.querySelector("[data-site-header]");
  const callBar = document.querySelector("[data-call-bar]");
  const payPill = document.querySelector("[data-pay-pill]");
  const band = document.querySelector("[data-parallax]");
  const bandImg = band?.querySelector("img") ?? null;
  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    header?.classList.toggle("is-scrolled", y > 8);
    const pastHero = y > window.innerHeight * 0.6;
    callBar?.classList.toggle("is-visible", pastHero);
    payPill?.classList.toggle("is-raised", pastHero);

    if (bandImg && !reduceMotion && desktop.matches) {
      const rect = band.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom > 0 && rect.top < vh) {
        // -1 (band entering from bottom) … +1 (band leaving at top)
        const progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
        bandImg.style.setProperty("--parallax", `${(progress * -8).toFixed(2)}%`);
      }
    } else if (bandImg) {
      bandImg.style.removeProperty("--parallax");
    }
    ticking = false;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
};

/* ---------------------------------------------------------------
   Financing badge — on screen from the start, after a short beat so
   it reads as arriving rather than being part of the first paint.
   --------------------------------------------------------------- */
const initPayPill = () => {
  const pill = document.querySelector("[data-pay-pill]");
  if (!pill) return;
  const show = () => pill.classList.add("is-visible");
  if (reduceMotion) show();
  else window.setTimeout(show, 600);
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
   Team spotlight — native scroll-snap + prev/next (below desktop)
   --------------------------------------------------------------- */
const initCarousel = () => {
  const carousel = document.querySelector("[data-carousel]");
  if (!carousel) return;
  const prev = document.querySelector("[data-carousel-prev]");
  const next = document.querySelector("[data-carousel-next]");

  const step = () => {
    const card = carousel.querySelector(".spot");
    const gap = parseFloat(getComputedStyle(carousel.querySelector(".spotlight__track")).columnGap) || 0;
    return card ? card.getBoundingClientRect().width + gap : carousel.clientWidth * 0.8;
  };
  const scrollByStep = (dir) => {
    carousel.scrollBy({ left: dir * step(), behavior: reduceMotion ? "auto" : "smooth" });
  };

  prev?.addEventListener("click", () => scrollByStep(-1));
  next?.addEventListener("click", () => scrollByStep(1));
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

/* ---------------------------------------------------------------
   Hero background video — never plays for reduced-motion users and
   pauses while the hero is off-screen to save CPU/battery.
   --------------------------------------------------------------- */
const initHeroVideo = () => {
  const video = document.querySelector("[data-hero-video]");
  if (!video) return;

  if (reduceMotion) {
    video.removeAttribute("autoplay");
    video.pause();
    return;
  }

  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) video.play().catch(() => {});
    else video.pause();
  }, { threshold: 0.1 });
  observer.observe(video);
};

initNav();
initHeroVideo();
initScrollState();
initPayPill();
initReveals();
initCarousel();
initAccordion();
