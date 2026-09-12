(() => {
  "use strict";
  const DATA = window.PROGRAMA_PUNTEL;
  if (!DATA) return;

  const tz = DATA.meta.timezone;
  const now = () => new Date();
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function escapeHTML(value = "") {
    return String(value).replace(/[&<>'"]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch]));
  }

  function formatClock(date = now()) {
    return new Intl.DateTimeFormat("pt-BR", {
      timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
    }).format(date);
  }

  function formatDateLong(date = now()) {
    const s = new Intl.DateTimeFormat("pt-BR", {
      timeZone: tz, weekday: "long", day: "2-digit", month: "long", year: "numeric"
    }).format(date);
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function datePartsInTZ(date = now()) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit"
    }).formatToParts(date);
    const map = Object.fromEntries(parts.map(p => [p.type, p.value]));
    return { y: +map.year, m: +map.month, d: +map.day };
  }

  function parseISODateOnly(isoOrDateTime) {
    const m = String(isoOrDateTime).match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? { y:+m[1], m:+m[2], d:+m[3] } : null;
  }

  function localDayIndex(parts) {
    return Math.floor(Date.UTC(parts.y, parts.m - 1, parts.d) / 86400000);
  }

  function dayDiffFromToday(targetDateTime, current = now()) {
    const today = datePartsInTZ(current);
    const target = parseISODateOnly(targetDateTime);
    return localDayIndex(target) - localDayIndex(today);
  }

  function eventState(ev, current = now()) {
    const n = current.getTime();
    const s = new Date(ev.start).getTime();
    const e = new Date(ev.end).getTime();
    if (n >= s && n <= e) return "current";
    if (n < s) return "future";
    return "done";
  }

  function currentAndNext(current = now()) {
    const sorted = [...DATA.events].sort((a,b) => new Date(a.start)-new Date(b.start));
    const currentEvent = sorted.find(ev => eventState(ev, current) === "current") || null;
    const nextEvent = sorted.find(ev => new Date(ev.start).getTime() > current.getTime()) || null;
    return { currentEvent, nextEvent };
  }

  function countdownText(ev, current = now()) {
    const state = eventState(ev, current);
    if (state === "current") {
      const start = parseISODateOnly(ev.start);
      const today = datePartsInTZ(current);
      const dayNo = Math.max(1, localDayIndex(today) - localDayIndex(start) + 1);
      const end = parseISODateOnly(ev.end);
      const total = localDayIndex(end) - localDayIndex(start) + 1;
      return total > 1 ? `Em andamento · dia ${dayNo} de ${total}` : "Em andamento hoje";
    }
    if (state === "done") return "Evento encerrado";
    const d = dayDiffFromToday(ev.start, current);
    if (d === 0) return "É hoje";
    if (d === 1) return "Falta 1 dia";
    return `Faltam ${d} dias`;
  }

  function statusLabel(ev, current = now(), nextId = null) {
    const s = eventState(ev, current);
    if (s === "current") return {text: "Agora", cls: "current"};
    if (s === "done") return {text: "Concluído", cls: "done"};
    if (ev.id === nextId) return {text: "Próximo", cls: "next"};
    return {text: "Futuro", cls: ""};
  }

  function formatFlightDate(dateStr) {
    const [y,m,d] = dateStr.split("-").map(Number);
    const date = new Date(Date.UTC(y,m-1,d,12));
    return new Intl.DateTimeFormat("pt-BR", {timeZone:"UTC", day:"2-digit", month:"short"})
      .format(date).replace(" de ", " ").replace(".", "").toUpperCase();
  }

  function updateClocks() {
    qsa("[data-live-clock]").forEach(el => el.textContent = formatClock());
    qsa("[data-live-date]").forEach(el => el.textContent = formatDateLong());
  }

  function renderMomentCard(ev, kind) {
    if (!ev) {
      return `<article class="moment-card ${kind}">
        <div class="moment-label">${kind === "current" ? "Em andamento" : "Próximo evento"}</div>
        <h3>${kind === "current" ? "Nenhum evento em andamento" : "Nenhum evento futuro cadastrado"}</h3>
        <p>${kind === "current" ? "A agenda cadastrada não indica compromisso em curso neste momento." : "Todos os eventos cadastrados já foram concluídos."}</p>
      </article>`;
    }
    return `<article class="moment-card ${kind}">
      <div class="moment-label">${kind === "current" ? "Em andamento" : "Próximo evento"}</div>
      <h3>${escapeHTML(ev.title)}</h3>
      <p>${escapeHTML(ev.city)} · ${escapeHTML(ev.dateLabel)}</p>
      <div class="moment-meta">
        <span class="chip ${kind === "current" ? "green" : "gold"}">${escapeHTML(countdownText(ev))}</span>
        <span class="chip navy">${escapeHTML(ev.venue)}</span>
      </div>
    </article>`;
  }

  function renderHome() {
    const moment = qs("#moment-grid");
    const grid = qs("#event-grid");
    if (!moment || !grid) return;
    const {currentEvent, nextEvent} = currentAndNext();
    moment.innerHTML = renderMomentCard(currentEvent, "current") + renderMomentCard(nextEvent, "next");

    grid.innerHTML = DATA.events.map(ev => {
      const st = eventState(ev);
      const badgeClass = st === "current" ? "green" : st === "future" ? "gold" : "navy";
      return `<article class="event-card">
        <div class="event-card-top">
          <div class="city">${escapeHTML(ev.city)}</div>
          <h3>${escapeHTML(ev.title)}</h3>
        </div>
        <div class="event-card-body">
          <dl>
            <dt>Período</dt><dd>${escapeHTML(ev.dateLabel)}</dd>
            <dt>Local</dt><dd>${escapeHTML(ev.venue)}</dd>
            <dt>Hospedagem</dt><dd>${escapeHTML(ev.lodging)}</dd>
            <dt>Participação</dt><dd>${escapeHTML(ev.participants.join(" · "))}</dd>
          </dl>
          <div class="countdown">
            <strong>${escapeHTML(countdownText(ev))}</strong>
            <a class="event-link" href="agenda.html#${encodeURIComponent(ev.id)}">Ver agenda</a>
          </div>
          <div style="margin-top:10px"><span class="chip ${badgeClass}">${st === "current" ? "AGORA" : st === "future" ? "PROGRAMADO" : "CONCLUÍDO"}</span></div>
        </div>
      </article>`;
    }).join("");
  }

  function renderAgenda() {
    const stack = qs("#agenda-stack");
    if (!stack) return;
    const {nextEvent} = currentAndNext();
    const nextId = nextEvent ? nextEvent.id : null;
    stack.innerHTML = DATA.events.map(ev => {
      const status = statusLabel(ev, now(), nextId);
      const flights = ev.flights.map(f => `<div class="flight-row">
        <time>${escapeHTML(formatFlightDate(f.date))}<br>${escapeHTML(f.depart)}–${escapeHTML(f.arrive)}</time>
        <span class="passenger">${escapeHTML(f.passenger)}</span>
        <span class="route from">${escapeHTML(f.from)}</span>
        <span class="arrow">→</span>
        <span class="route to">${escapeHTML(f.to)}</span>
      </div>`).join("");
      return `<article class="agenda-card" id="${escapeHTML(ev.id)}" data-state="${status.cls || "future"}">
        <div class="agenda-head">
          <div class="agenda-date"><strong>${escapeHTML(ev.dateLabel)}</strong><span>${escapeHTML(countdownText(ev))}</span></div>
          <div class="agenda-title"><h2>${escapeHTML(ev.shortCity)} — ${escapeHTML(ev.title)}</h2>${ev.subtitle ? `<p>${escapeHTML(ev.subtitle)}</p>` : ""}</div>
          <span class="status-badge ${status.cls}">${escapeHTML(status.text)}</span>
        </div>
        <div class="agenda-body">
          <div class="info-grid">
            <div class="info-box"><div class="k">Local</div><div class="v">${escapeHTML(ev.venue)}</div></div>
            <div class="info-box"><div class="k">Hospedagem</div><div class="v">${escapeHTML(ev.lodging)}</div></div>
            <div class="info-box"><div class="k">Autoridades</div><div class="v">${escapeHTML(ev.participants.join(" · "))}</div></div>
            <div class="info-box"><div class="k">Programação</div><div class="v">${escapeHTML(ev.programStatus)}</div></div>
          </div>
          <h3 class="subsection-title">Deslocamentos aéreos registrados</h3>
          <div class="flight-list">${flights}</div>
        </div>
      </article>`;
    }).join("");

    if (location.hash) {
      requestAnimationFrame(() => {
        const el = qs(location.hash);
        if (el) el.scrollIntoView({block:"start"});
      });
    }
  }

  function renderBiography() {
    const bio = DATA.biography;
    const facts = qs("#bio-facts");
    const ranks = qs("#rank-timeline");
    const commissions = qs("#commissions-list");
    const courses = qs("#courses-list");
    const decorations = qs("#decorations-list");
    if (!facts) return;

    facts.innerHTML = `
      <div class="fact"><strong>Nascimento</strong><span>${escapeHTML(bio.birth)}</span></div>
      <div class="fact"><strong>Filiação</strong><span>${escapeHTML(bio.parents)}</span></div>
      <div class="fact"><strong>Família</strong><span>${escapeHTML(bio.family)}</span></div>
      <div class="fact"><strong>Superior Tribunal Militar</strong><span>${escapeHTML(bio.stmAppointment)}</span></div>`;
    ranks.innerHTML = bio.ranks.map(([rank,date]) => `<div class="timeline-row"><time>${escapeHTML(date)}</time><span>${escapeHTML(rank)}</span></div>`).join("");
    commissions.innerHTML = bio.commissions.map(x => `<li>${escapeHTML(x)}</li>`).join("");
    courses.innerHTML = bio.courses.map(x => `<li>${escapeHTML(x)}</li>`).join("");
    decorations.innerHTML = bio.decorations.map(x => `<li>${escapeHTML(x)}</li>`).join("");
  }

  function setActiveNav() {
    const page = document.body.dataset.page;
    qsa("[data-nav]").forEach(a => {
      if (a.dataset.nav === page) a.setAttribute("aria-current", "page");
    });
  }

  function registerServiceWorker() {
    if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    }
  }

  function init() {
    setActiveNav();
    updateClocks();
    setInterval(updateClocks, 1000);
    renderHome();
    renderAgenda();
    renderBiography();
    registerServiceWorker();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
