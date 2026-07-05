/* ============================================================
   AJLA & ENIS — POZIVNICA ZA VJENČANJE
   ------------------------------------------------------------
   ✏️  PODEŠAVANJA — najvažnije podatke mijenjate OVDJE.
   (Tekstove koji se prikazuju na kartici — imena, datum,
   vrijeme, lokaciju, rok za RSVP — mijenjate u index.html,
   označeni su komentarima "✏️".)
   ============================================================ */
const CONFIG = {
  // ✏️ DATUM I VRIJEME VJENČANJA — za odbrojavanje (GGGG-MM-DDTHH:MM:SS)
  weddingDate: "2026-09-04T17:00:00",

  // ✏️ WHATSAPP BROJ — AJLA (međunarodni format, bez "+" i bez razmaka)
  ajlaWhatsApp: "38762612886",

  // ✏️ WHATSAPP BROJ — ENIS (međunarodni format, bez "+" i bez razmaka)
  enisWhatsApp: "38762971485",

  // ✏️ WHATSAPP PORUKA — AJLA (unaprijed ispisana poruka)
  ajlaMessage: "Pozdrav Ajla, potvrđujem dolazak na vjenčanje.",

  // ✏️ WHATSAPP PORUKA — ENIS (unaprijed ispisana poruka)
  enisMessage: "Pozdrav Enise, potvrđujem dolazak na vjenčanje.",

  // ✏️ LOKACIJA ZA GOOGLE MAPS (naziv koji se pretražuje na mapi)
  mapsQuery: "Hotel Austria & Bosnia",
};

/* ============================================================
   Ispod ove linije ništa ne morate mijenjati.
   ============================================================ */

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------
   1. LINKOVI — WhatsApp RSVP i Google Maps
   ------------------------------------------------------------ */
function setupLinks() {
  const wa = (num, msg) => `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;

  document.getElementById("rsvp-ajla").href = wa(CONFIG.ajlaWhatsApp, CONFIG.ajlaMessage);
  document.getElementById("rsvp-enis").href = wa(CONFIG.enisWhatsApp, CONFIG.enisMessage);

  document.getElementById("maps-btn").href =
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.mapsQuery)}`;
}

/* ------------------------------------------------------------
   2. ODBROJAVANJE do vjenčanja
   ------------------------------------------------------------ */
function setupCountdown() {
  const target = new Date(CONFIG.weddingDate).getTime();
  const el = {
    days:  document.getElementById("cd-days"),
    hours: document.getElementById("cd-hours"),
    mins:  document.getElementById("cd-mins"),
    secs:  document.getElementById("cd-secs"),
  };
  const pad = (n) => String(n).padStart(2, "0");

  function tick() {
    const diff = Math.max(0, target - Date.now());
    const s = Math.floor(diff / 1000);
    el.days.textContent  = pad(Math.floor(s / 86400));
    el.hours.textContent = pad(Math.floor((s % 86400) / 3600));
    el.mins.textContent  = pad(Math.floor((s % 3600) / 60));
    el.secs.textContent  = pad(s % 60);
  }

  tick();
  setInterval(tick, 1000);
}

/* ------------------------------------------------------------
   3. KOVERTA — otvara se ISKLJUČIVO na klik/dodir gosta
   ------------------------------------------------------------ */
const stage = document.getElementById("reveal-stage");
let envelopeOpened = false;
let mainRevealed = false;

/* Redoslijed otvaranja nakon klika:
   pečat nestaje → preklop se otvara → papir izlazi → pozivnica */
const OPEN_STEPS = [
  [0,    "unsealed"],
  [500,  "open"],
  [1600, "out"],
  [2800, "done"],
];

function openEnvelope() {
  if (envelopeOpened) return;
  envelopeOpened = true;
  stage.style.cursor = "default";

  if (reducedMotion) {
    OPEN_STEPS.forEach(([, cls]) => stage.classList.add(cls));
    revealMain();
    return;
  }

  OPEN_STEPS.forEach(([t, cls]) => {
    setTimeout(() => {
      stage.classList.add(cls);
      if (cls === "done") revealMain();
    }, t);
  });
}

stage.addEventListener("click", openEnvelope);
stage.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    openEnvelope();
  }
});

/* ------------------------------------------------------------
   4. PRIKAZ POZIVNICE — papir klizi iz koverte i otkriva se
      odozgo prema dolje (clip-path), zatim stepenasti fade-in
   ------------------------------------------------------------ */
function revealMain() {
  if (mainRevealed) return;
  mainRevealed = true;

  document.body.classList.add("revealed");

  // Stepenasto pojavljivanje elemenata (data-delay u HTML-u određuje redoslijed)
  document.querySelectorAll(".fade").forEach((elem) => {
    const step = parseInt(elem.dataset.delay || "0", 10);
    elem.style.transitionDelay = reducedMotion ? "0s" : `${0.45 + step * 0.14}s`;
    // requestAnimationFrame osigurava da tranzicija krene tek nakon iscrtavanja
    requestAnimationFrame(() => elem.classList.add("visible"));
  });

  drawOrnaments();
}

/* Zlatni ornamenti se "iscrtavaju" linijskom animacijom */
function drawOrnaments() {
  document.querySelectorAll(".draw").forEach((path, i) => {
    const len = path.getTotalLength();

    if (reducedMotion) return; // bez animacije — linije su odmah vidljive

    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    path.getBoundingClientRect(); // prisilni reflow prije tranzicije
    path.style.transition = `stroke-dashoffset 1.9s ease ${0.8 + (i % 9) * 0.16}s`;
    path.style.strokeDashoffset = "0";
  });
}

/* ------------------------------------------------------------
   5. RSVP PROZOR — jedno dugme na kartici otvara izbor
      (bottom sheet na mobitelu, modal na desktopu)
   ------------------------------------------------------------ */
function setupModal() {
  const modal = document.getElementById("rsvp-modal");
  const openBtn = document.getElementById("rsvp-open");
  const closeBtn = modal.querySelector(".modal-close");
  const backdrop = modal.querySelector(".modal-backdrop");

  const open = () => {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  };

  const close = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  };

  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", close); // klik van prozora zatvara
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

/* ------------------------------------------------------------
   6. SUPTILNI 3D NAGIB KARTICE — samo desktop (miš)
   ------------------------------------------------------------ */
function setupTilt() {
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!canHover || reducedMotion) return;

  const card = document.getElementById("card");

  card.addEventListener("mousemove", (e) => {
    if (!mainRevealed) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform =
      `perspective(1100px) rotateX(${(-y * 3.5).toFixed(2)}deg) rotateY(${(x * 4.5).toFixed(2)}deg)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
}

/* ------------------------------------------------------------
   7. PLUTAJUĆE ZLATNE ČESTICE u pozadini
   ------------------------------------------------------------ */
function setupParticles() {
  if (reducedMotion) return;

  const canvas = document.getElementById("particles");
  const ctx = canvas.getContext("2d");
  let particles = [];
  let w, h, dpr;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(48, Math.round((w * h) / 26000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.6 + Math.random() * 1.5,          // veličina
      vy: 0.08 + Math.random() * 0.22,       // brzina dizanja
      drift: Math.random() * Math.PI * 2,    // faza lelujanja
      driftSpeed: 0.003 + Math.random() * 0.006,
      alpha: Math.random() * Math.PI * 2,    // faza treperenja
      alphaSpeed: 0.008 + Math.random() * 0.014,
    }));
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.y -= p.vy;
      p.drift += p.driftSpeed;
      p.alpha += p.alphaSpeed;
      const x = p.x + Math.sin(p.drift) * 14;
      const a = 0.1 + (Math.sin(p.alpha) + 1) * 0.16;

      if (p.y < -6) { p.y = h + 6; p.x = Math.random() * w; }

      ctx.beginPath();
      ctx.arc(x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(197, 165, 100, ${a.toFixed(3)})`;
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(frame);
}

/* ------------------------------------------------------------
   POKRETANJE — koverta se samo pojavi (zatvorena) i čeka klik
   ------------------------------------------------------------ */
setupLinks();
setupCountdown();
setupModal();
setupTilt();
setupParticles();

setTimeout(() => stage.classList.add("in"), 300);
