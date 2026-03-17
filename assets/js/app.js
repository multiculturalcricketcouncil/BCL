const BCL = {
  site: null,
  galleryItems: [],
  activeGalleryIndex: 0,

  async boot() {
    this.site = await this.fetchJson("data/site.json").catch(() => ({}));
    this.injectHeader();
    this.injectFooter();
    this.setYear();
    this.bindMobileNav();
    this.bindGalleryModalEvents();
    await this.routePage();
    this.applySiteMedia();
  },

  async routePage() {
    const page = document.body.dataset.page;
    switch (page) {
      case "home":
        await Promise.all([
          this.renderPointsTable("#home-points", 5),
          this.renderNewsCards("#home-news", 3),
          this.renderSponsors("#sponsors-grid"),
          this.renderGallery("#gallery-grid", 6),
          this.renderTeams("#home-teams", 6)
        ]);
        break;
      case "fixtures":
        await this.renderFixtures();
        break;
      case "teams":
        await this.renderTeams("#teams-grid");
        break;
      case "news":
        await this.renderNewsCards("#news-grid");
        break;
      case "news-detail":
        await this.renderNewsDetail();
        break;
      case "gallery":
        await this.renderGallery("#gallery-grid");
        break;
      case "points":
        await this.renderPointsTable("#points-table");
        break;
      case "amcc":
        await this.renderSponsors("#sponsors-grid");
        break;
      default:
        break;
    }
  },

  injectHeader() {
    const mount = document.querySelector("[data-header]");
    if (!mount) return;
    const page = document.body.dataset.page;
    const nav = [
      ["home", "index.html", "Home"],
      ["fixtures", "fixtures-results.html", "Fixtures & Results"],
      ["points", "points-table.html", "Points Table"],
      ["teams", "teams.html", "Teams"],
      ["gallery", "gallery.html", "Gallery"],
      ["news", "news.html", "News"],
      ["amcc", "amcc.html", "AMCC"]
    ];
    mount.innerHTML = `
      <header class="site-header">
        <div class="container header-inner">
          <a class="brand" href="index.html" aria-label="Brisbane Champions League home">
            <span class="brand-logo-shell">
              <img src="assets/images/bcl-logo-white.png" alt="Brisbane Champions League logo" />
            </span>
            <span class="brand-copy">
              <span class="brand-tag">Official league website</span>
              <span class="brand-label">Brisbane Champions League</span>
            </span>
          </a>
          <button class="nav-toggle" aria-label="Open navigation" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
          <nav class="site-nav">
            ${nav.map(([key, href, label]) => `<a href="${href}" ${page === key ? 'aria-current="page"' : ""}>${label}</a>`).join("")}
          </nav>
        </div>
      </header>`;
  },

  injectFooter() {
    const mount = document.querySelector("[data-footer]");
    if (!mount) return;
    const phones = (this.site?.contactPhones || []).map((phone) => `<a href="tel:${phone.replace(/\s+/g, "")}">${phone}</a>`).join("");
    mount.innerHTML = `
      <footer class="site-footer">
        <div class="container footer-grid">
          <div class="footer-brand-panel">
            <div class="footer-logo-shell"><img class="footer-logo" src="assets/images/bcl-logo-white.png" alt="BCL logo" /></div>
            <p>Brisbane Champions League is a premium multicultural cricket platform built for fixtures, standings, teams, news, sponsors and matchday storytelling.</p>
          </div>
          <div class="footer-brand-panel">
            <div class="footer-logo-shell small"><img class="footer-logo partner" src="assets/images/amcc-logo-white.png" alt="AMCC logo" /></div>
            <p>In partnership with the Australian Multicultural Cricket Council, supporting community pathways and stronger digital presentation for the sport.</p>
          </div>
          <div>
            <h4>Explore</h4>
            <a href="fixtures-results.html">Fixtures & Results</a>
            <a href="points-table.html">Points Table</a>
            <a href="teams.html">Teams</a>
            <a href="gallery.html">Gallery</a>
            <a href="news.html">News</a>
          </div>
          <div>
            <h4>Contact</h4>
            <a href="amcc.html">About AMCC</a>
            <a href="${this.site?.contactWebsite || '#'}" target="_blank" rel="noreferrer">multiculturalcricket.com.au</a>
            <a href="mailto:${this.site?.contactEmail || ''}">${this.site?.contactEmail || ""}</a>
            <div class="footer-phone-list">${phones}</div>
          </div>
        </div>
        <div class="container footer-bottom">
          <span>© <span data-year></span> Brisbane Champions League</span>
          <span>Wide Banner + Tiles First</span>
        </div>
      </footer>`;
  },

  bindMobileNav() {
    document.addEventListener("click", (event) => {
      const btn = event.target.closest(".nav-toggle");
      if (btn) {
        const nav = document.querySelector(".site-nav");
        const expanded = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!expanded));
        nav?.classList.toggle("open");
        return;
      }
      if (!event.target.closest(".site-nav")) {
        document.querySelector(".site-nav")?.classList.remove("open");
        document.querySelector(".nav-toggle")?.setAttribute("aria-expanded", "false");
      }
    });
  },

  setYear() {
    document.querySelectorAll("[data-year]").forEach((node) => {
      node.textContent = new Date().getFullYear();
    });
  },

  resolveMediaUrl(src) {
    if (!src) return "";
    try {
      return new URL(src, document.baseURI).href;
    } catch (error) {
      return src;
    }
  },

  applySiteMedia() {
    const images = this.site?.homeImages || {};
    const social = this.site?.socialLinks || {};
    const socialText = this.site?.socialText || {};

    const root = document.documentElement;
    const bannerUrl = this.resolveMediaUrl(images.wideBanner);
    const teamsTileUrl = this.resolveMediaUrl(images.teamsTile);
    const fixturesTileUrl = this.resolveMediaUrl(images.fixturesTile);
    const pointsTileUrl = this.resolveMediaUrl(images.pointsTile);

    if (bannerUrl) {
      root.style.setProperty("--home-wide-banner-image", `url("${bannerUrl}")`);
      const banner = document.querySelector("#home-hero-banner");
      if (banner) banner.style.backgroundImage = `url("${bannerUrl}")`;
    }

    if (teamsTileUrl) {
      root.style.setProperty("--home-teams-tile-image", `url("${teamsTileUrl}")`);
      const tileTeams = document.querySelector("#home-tile-teams");
      if (tileTeams) tileTeams.style.setProperty("--tile-image", `url("${teamsTileUrl}")`);
    }

    if (fixturesTileUrl) {
      root.style.setProperty("--home-fixtures-tile-image", `url("${fixturesTileUrl}")`);
      const tileFixtures = document.querySelector("#home-tile-fixtures");
      if (tileFixtures) tileFixtures.style.setProperty("--tile-image", `url("${fixturesTileUrl}")`);
    }

    if (pointsTileUrl) {
      root.style.setProperty("--home-points-tile-image", `url("${pointsTileUrl}")`);
      const tilePoints = document.querySelector("#home-tile-points");
      if (tilePoints) tilePoints.style.setProperty("--tile-image", `url("${pointsTileUrl}")`);
    }

    const fb = document.querySelector("#hero-facebook");
    if (fb) {
      if (social.facebook) fb.href = social.facebook;
      else fb.hidden = true;
      const txt = document.querySelector("#hero-facebook-text");
      if (txt && socialText.facebook) txt.textContent = socialText.facebook;
    }

    const wa = document.querySelector("#hero-whatsapp");
    if (wa) {
      if (social.whatsapp) wa.href = social.whatsapp;
      else wa.hidden = true;
      const txt = document.querySelector("#hero-whatsapp-text");
      if (txt && socialText.whatsapp) txt.textContent = socialText.whatsapp;
    }
  },

  async fetchJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Failed to load ${url}`);
    return response.json();
  },

  displaySeasonLabel(season, index = 0) {
    const value = String(season || "").trim();
    return value || `Season ${index + 1}`;
  },

  normalizePointsSeasons(data = {}) {
    const seasons = Array.isArray(data.seasons)
      ? data.seasons
      : [{ season: data.season || this.site?.season || "", updated: data.updated, groups: data.groups, table: data.table || [] }];

    return seasons.map((season, seasonIndex) => {
      const explicitGroups = Array.isArray(season.groups) && season.groups.length
        ? season.groups
        : [{ name: season.group || "Standings", table: season.table || [] }];

      const groups = explicitGroups.map((group, groupIndex) => {
        const groupName = group.name || group.group || `Group ${groupIndex + 1}`;
        const table = (group.table || []).map((row, rowIndex) => ({
          position: row.position ?? rowIndex + 1,
          team: row.team || "Team",
          played: row.played ?? 0,
          won: row.won ?? 0,
          lost: row.lost ?? 0,
          tied: row.tied ?? 0,
          nr: row.nr ?? 0,
          points: row.points ?? 0,
          nrr: row.nrr ?? "0.000",
          group: row.group || groupName
        }));
        return { name: groupName, table };
      });

      return {
        season: this.displaySeasonLabel(season.season, seasonIndex),
        rawSeason: season.season || "",
        updated: season.updated,
        groups
      };
    }).filter((season) => Array.isArray(season.groups));
  },

  normalizeFixtureSeasons(data = {}) {
    const seasons = Array.isArray(data.seasons)
      ? data.seasons
      : [{ season: data.season || this.site?.season || "", matches: data.matches || [] }];

    return seasons.map((season, index) => ({
      season: this.displaySeasonLabel(season.season, index),
      rawSeason: season.season || "",
      matches: Array.isArray(season.matches) ? season.matches : []
    }));
  },

  flattenStandingsGroups(groups = []) {
    return groups.flatMap((group) => (group.table || []).map((row) => ({ ...row, group: row.group || group.name || "Standings" })));
  },

  async getFixtureSeasons() {
    const config = this.site || {};
    if (config.useLiveApi && config.apiEndpoint) {
      try {
        const liveData = await this.fetchJson(`${config.apiEndpoint}?season=${config.season || "2025"}`);
        const normalizedLive = this.normalizeFixtureSeasons(liveData || {});
        if (normalizedLive.length) return normalizedLive;
      } catch (error) {
        console.warn("Using standard fixture data", error);
      }
    }
    const data = await this.fetchJson("data/fixtures.json");
    return this.normalizeFixtureSeasons(data);
  },

  async getMatches() {
    const seasons = await this.getFixtureSeasons();
    return seasons.find((season) => (season.matches || []).length) || seasons[0] || { season: this.displaySeasonLabel(this.site?.season || "", 0), matches: [] };
  },

  async renderHomeMatches() {
    const mount = document.querySelector("#match-centre-cards");
    if (!mount) return;
    const data = await this.getMatches();
    const items = (data.matches || []).slice(0, 3);
    mount.innerHTML = items.map((match) => `
      <article class="match-card">
        <div class="match-card-top">
          <span class="badge-chip orange">${match.stage || "League match"}</span>
          <span class="match-status ${this.statusClass(match.status)}">${match.status || "Upcoming"}</span>
        </div>
        <h3>${this.formatDate(match.date)}${match.time ? ` • ${match.time}` : ""}</h3>
        <p class="match-venue">${match.venue || ""}</p>
        <div class="match-row">
          <strong>${match.homeTeam}</strong>
          <span>${match.homeScore || "-"}</span>
        </div>
        <div class="match-row">
          <strong>${match.awayTeam}</strong>
          <span>${match.awayScore || "-"}</span>
        </div>
        <p class="match-result">${match.result || "Awaiting first ball."}</p>
        <div class="match-actions">
          <a class="button button-secondary" href="fixtures-results.html">View fixture</a>
          <a class="text-link" href="${match.matchCentreUrl || 'fixtures-results.html'}">Match centre</a>
        </div>
      </article>
    `).join("");
  },

  async renderHomeHeroCarousel() {
    const mount = document.querySelector("#home-hero-carousel");
    if (!mount) return;

    const files = [
      "photos/homepage/1.jpg",
      "photos/homepage/2.jpg",
      "photos/homepage/3.jpg",
      "photos/homepage/4.jpg",
      "photos/homepage/5.jpg",
      "photos/homepage/1.png",
      "photos/homepage/2.png",
      "photos/homepage/3.png",
      "photos/homepage/4.png",
      "photos/homepage/5.png",
      "photos/homepage/1.webp",
      "photos/homepage/2.webp",
      "photos/homepage/3.webp",
      "photos/homepage/4.webp",
      "photos/homepage/5.webp"
    ];

    const existing = await Promise.all(files.map((src) => new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(src);
      image.onerror = () => resolve(null);
      image.src = src;
    })));

    const slides = existing.filter(Boolean).slice(0, 6);
    if (!slides.length) {
      mount.innerHTML = '<p class="hero-carousel-empty">Upload images to <code>photos/homepage</code> using names like <strong>1.jpg</strong>, <strong>2.jpg</strong>, etc.</p>';
      return;
    }

    mount.innerHTML = `
      <div class="hero-carousel-track">
        ${slides.map((src, index) => `
          <figure class="hero-carousel-slide ${index === 0 ? "active" : ""}" data-hero-slide="${index}">
            <img src="${src}" alt="BCL home banner ${index + 1}" loading="${index === 0 ? "eager" : "lazy"}" />
          </figure>
        `).join("")}
      </div>
      <div class="hero-carousel-dots" role="tablist" aria-label="Homepage banners">
        ${slides.map((_, index) => `<button type="button" class="hero-carousel-dot ${index === 0 ? "active" : ""}" data-hero-dot="${index}" aria-label="Slide ${index + 1}" aria-selected="${index === 0 ? "true" : "false"}"></button>`).join("")}
      </div>
    `;

    let currentIndex = 0;
    const slideNodes = Array.from(mount.querySelectorAll("[data-hero-slide]"));
    const dotNodes = Array.from(mount.querySelectorAll("[data-hero-dot]"));

    const activate = (index) => {
      currentIndex = index;
      slideNodes.forEach((node, nodeIndex) => node.classList.toggle("active", nodeIndex === index));
      dotNodes.forEach((dot, dotIndex) => {
        const active = dotIndex === index;
        dot.classList.toggle("active", active);
        dot.setAttribute("aria-selected", String(active));
      });
    };

    dotNodes.forEach((dot) => {
      dot.addEventListener("click", () => activate(Number(dot.dataset.heroDot)));
    });

    window.setInterval(() => {
      activate((currentIndex + 1) % slides.length);
    }, 3800);
  },

  async renderHomeShowcase() {
    const mount = document.querySelector("#home-showcase-carousel");
    if (!mount) return;

    const [pointsSeasons, teamsData, fixturesData, galleryData] = await Promise.all([
      this.getPointsData().catch(() => []),
      this.getTeams().catch(() => ({ teams: [] })),
      this.getMatches().catch(() => ({ season: this.displaySeasonLabel(this.site?.season || "", 0), matches: [] })),
      this.getGalleryItems().catch(() => ({ items: [] }))
    ]);

    const activePointsSeason = pointsSeasons[0] || { groups: [] };
    const leaders = activePointsSeason.groups.flatMap((group) => (group.table || []).slice(0, 2).map((row) => ({ ...row, group: group.name })));
    const topTeams = (teamsData.teams || []).slice(0, 4);
    const upcomingMatches = (fixturesData.matches || []).slice(0, 3);
    const galleryItems = (galleryData.items || []).slice(0, 4);

    const slides = [
      {
        title: "Groups",
        subtitle: `Standings • ${activePointsSeason.season || this.displaySeasonLabel(this.site?.season || "", 0)}`,
        cta: "points-table.html",
        ctaText: "Open full table",
        content: leaders.length
          ? `
            <ul class="showcase-list">
              ${leaders.map((row) => `<li><strong>${row.group}: ${row.team}</strong><span>${row.points} pts</span></li>`).join("")}
            </ul>`
          : `<p>No standings entered yet. Update <code>data/points-table.json</code> to publish the group tables.</p>`
      },
      {
        title: "Teams",
        subtitle: "Competition franchises",
        cta: "teams.html",
        ctaText: "View all teams",
        content: topTeams.length
          ? `
            <ul class="showcase-list">
              ${topTeams.map((team) => `<li><strong>${team.name}</strong><span>${team.group || team.city || "League team"}</span></li>`).join("")}
            </ul>`
          : `<p>No team profiles available yet.</p>`
      },
      {
        title: "Matches",
        subtitle: `Fixtures • ${fixturesData.season || this.displaySeasonLabel(this.site?.season || "", 0)}`,
        cta: "fixtures-results.html",
        ctaText: "Open fixtures",
        content: upcomingMatches.length
          ? `
            <ul class="showcase-list">
              ${upcomingMatches.map((match) => `<li><strong>${match.homeTeam} vs ${match.awayTeam}</strong><span>${this.formatDate(match.date)}</span></li>`).join("")}
            </ul>`
          : `<p>No matches scheduled for ${fixturesData.season || "this season"}.</p>`
      },
      {
        title: "Gallery",
        subtitle: "Latest visuals",
        cta: "gallery.html",
        ctaText: "Browse gallery",
        content: galleryItems.length
          ? `
            <div class="showcase-gallery">
              ${galleryItems.map((item) => `<img src="${item.src}" alt="${item.title || "Gallery image"}" loading="lazy" onerror="this.src='assets/images/gallery-placeholder.svg'" />`).join("")}
            </div>`
          : `<p>Add photos to the configured gallery folder to populate this section automatically.</p>`
      }
    ];

    mount.innerHTML = `
      <div class="showcase-track">
        ${slides.map((slide, index) => `
          <article class="showcase-slide ${index === 0 ? "active" : ""}" data-showcase-slide="${index}">
            <p class="eyebrow">${slide.subtitle}</p>
            <h3>${slide.title}</h3>
            ${slide.content}
            <a class="text-link" href="${slide.cta}">${slide.ctaText}</a>
          </article>
        `).join("")}
      </div>
      <div class="showcase-dots" role="tablist" aria-label="Homepage spotlight">
        ${slides.map((slide, index) => `<button type="button" class="showcase-dot ${index === 0 ? "active" : ""}" data-showcase-dot="${index}" aria-label="${slide.title}" aria-selected="${index === 0 ? "true" : "false"}"></button>`).join("")}
      </div>
    `;

    let currentIndex = 0;
    const slideNodes = Array.from(mount.querySelectorAll("[data-showcase-slide]"));
    const dotNodes = Array.from(mount.querySelectorAll("[data-showcase-dot]"));

    const activate = (index) => {
      currentIndex = index;
      slideNodes.forEach((node, nodeIndex) => node.classList.toggle("active", nodeIndex === index));
      dotNodes.forEach((dot, dotIndex) => {
        const active = dotIndex === index;
        dot.classList.toggle("active", active);
        dot.setAttribute("aria-selected", String(active));
      });
    };

    dotNodes.forEach((dot) => {
      dot.addEventListener("click", () => activate(Number(dot.dataset.showcaseDot)));
    });

    window.setInterval(() => {
      activate((currentIndex + 1) % slides.length);
    }, 4200);
  },

  renderFixtureCards(matches = []) {
    return matches.map((match) => `
      <article class="fixture-card">
        <div class="fixture-head">
          <div>
            <p class="eyebrow">${match.stage || "Fixture"}</p>
            <h3>${this.formatDate(match.date)}${match.time ? ` • ${match.time}` : ""}</h3>
          </div>
          <span class="match-status ${this.statusClass(match.status)}">${match.status || "Upcoming"}</span>
        </div>
        <p class="match-venue">${match.venue || "Venue TBC"}</p>
        <div class="fixture-sides">
          <div class="team-line"><span>${match.homeTeam}</span><strong>${match.homeScore || "-"}</strong></div>
          <div class="team-line"><span>${match.awayTeam}</span><strong>${match.awayScore || "-"}</strong></div>
        </div>
        <p class="fixture-result">${match.result || "Fixture details will appear here."}</p>
        <div class="match-actions">
          <a class="button button-secondary" href="${match.streamUrl || '#'}">Watch / stream</a>
          <a class="text-link" href="${match.matchCentreUrl || '#'}">Match centre</a>
        </div>
      </article>
    `).join("");
  },

  async renderFixtures() {
    const mount = document.querySelector("#fixtures-shell");
    if (!mount) return;

    const seasons = await this.getFixtureSeasons();
    if (!seasons.length) {
      mount.innerHTML = '<div class="empty-state"><strong>No fixture seasons configured.</strong><p>Add a season to <code>data/fixtures.json</code> to show fixtures here.</p></div>';
      return;
    }

    const options = seasons.map((item, index) => `<option value="${index}">${item.season}</option>`).join("");
    mount.innerHTML = `
      <div class="points-filter-row fixture-filter-row">
        <label for="fixture-season-select">Season</label>
        <select id="fixture-season-select" class="season-select">${options}</select>
      </div>
      <div class="grid grid-2" id="fixtures-grid"></div>
    `;

    const grid = mount.querySelector("#fixtures-grid");
    const select = mount.querySelector("#fixture-season-select");

    const renderSeason = (index) => {
      const selected = seasons[Number(index)] || seasons[0];
      const matches = selected.matches || [];
      if (!matches.length) {
        grid.innerHTML = `
          <div class="empty-state">
            <strong>No matches scheduled.</strong>
            <p>No fixtures are available for ${selected.season || "this season"}. Add matches to <code>data/fixtures.json</code> to publish them here.</p>
          </div>
        `;
        return;
      }
      grid.innerHTML = this.renderFixtureCards(matches);
    };

    select?.addEventListener("change", (event) => renderSeason(event.target.value));
    renderSeason(0);
  },

  async getPointsData() {
    const data = await this.fetchJson("data/points-table.json");
    return this.normalizePointsSeasons(data);
  },

  renderSingleTableMarkup(rows) {
    return `
      <div class="table-wrap">
        <table class="league-table">
          <thead>
            <tr>
              <th>Pos</th><th>Team</th><th>P</th><th>W</th><th>L</th><th>NR</th><th>Pts</th><th>NRR</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((row) => `
              <tr>
                <td>${row.position}</td>
                <td>${row.team}</td>
                <td>${row.played}</td>
                <td>${row.won}</td>
                <td>${row.lost}</td>
                <td>${row.nr}</td>
                <td><strong>${row.points}</strong></td>
                <td>${row.nrr}</td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
    `;
  },

  renderPointsTableMarkup(season, limit = 999, includeNote = true) {
    const groups = season?.groups || [];
    return `
      <div class="group-table-grid">
        ${groups.map((group) => `
          <section class="group-table-card">
            <div class="group-table-head">
              <div>
                <p class="eyebrow group-table-eyebrow">Standings</p>
                <h3>${group.name || "Group"}</h3>
              </div>
              <span class="badge-chip ghost">${(group.table || []).length} teams</span>
            </div>
            ${this.renderSingleTableMarkup((group.table || []).slice(0, limit))}
          </section>
        `).join("")}
      </div>
      ${includeNote && season?.updated ? `<p class="table-note">Updated ${new Date(season.updated).toLocaleString("en-AU")}</p>` : ""}
    `;
  },

  async renderPointsTable(selector, limit = 999) {
    const mount = document.querySelector(selector);
    if (!mount) return;

    const seasons = await this.getPointsData();
    if (!seasons.length) {
      mount.innerHTML = '<div class="empty-state"><strong>No standings available.</strong><p>Add group tables to <code>data/points-table.json</code> to publish them here.</p></div>';
      return;
    }

    if (document.body.dataset.page === "points") {
      const options = seasons.map((item, index) => `<option value="${index}">${item.season}</option>`).join("");
      mount.innerHTML = `
        <div class="points-filter-row">
          <label for="season-select">Season</label>
          <select id="season-select" class="season-select">${options}</select>
        </div>
        <div id="points-table-content"></div>
      `;
      const content = mount.querySelector("#points-table-content");
      const select = mount.querySelector("#season-select");
      const renderSeason = (index) => {
        const selected = seasons[Number(index)] || seasons[0];
        content.innerHTML = this.renderPointsTableMarkup(selected, limit, true);
      };
      select?.addEventListener("change", (event) => renderSeason(event.target.value));
      renderSeason(0);
      return;
    }

    mount.innerHTML = this.renderPointsTableMarkup(seasons[0], limit, false);
  },

  async getTeams() {
    const [meta, pointsSeasons, fixtureSeasons] = await Promise.all([
      this.fetchJson("data/teams.json").catch(() => null),
      this.getPointsData().catch(() => []),
      this.getFixtureSeasons().catch(() => [])
    ]);

    const activeSeason = pointsSeasons[0] || { groups: [] };
    const rows = this.flattenStandingsGroups(activeSeason.groups);
    const rowOrder = new Map();
    rows.forEach((row, index) => rowOrder.set(row.team, index));

    const groupOrder = new Map();
    (meta?.groups || activeSeason.groups || []).forEach((group, index) => {
      const groupName = typeof group === "string" ? group : group.name;
      if (groupName) groupOrder.set(groupName, index);
    });

    const map = new Map();
    rows.forEach((row) => {
      map.set(row.team, {
        name: row.team,
        slug: this.slugify(row.team),
        position: row.position,
        played: row.played,
        won: row.won,
        lost: row.lost,
        nr: row.nr,
        points: row.points,
        nrr: row.nrr,
        group: row.group
      });
    });

    (meta?.teams || []).forEach((team) => {
      const existing = map.get(team.name) || { name: team.name, slug: team.slug || this.slugify(team.name) };
      map.set(team.name, {
        ...existing,
        ...team,
        group: team.group || existing.group,
        slug: team.slug || existing.slug || this.slugify(team.name)
      });
    });

    fixtureSeasons.forEach((season) => {
      (season.matches || []).forEach((match) => {
        [match.homeTeam, match.awayTeam].forEach((name) => {
          if (name && !map.has(name)) map.set(name, { name, slug: this.slugify(name) });
        });
      });
    });

    return {
      season: meta?.season || activeSeason.season || this.displaySeasonLabel(this.site?.season || "", 0),
      teams: Array.from(map.values()).sort((a, b) =>
        (groupOrder.get(a.group) ?? 999) - (groupOrder.get(b.group) ?? 999) ||
        (rowOrder.get(a.name) ?? 999) - (rowOrder.get(b.name) ?? 999) ||
        a.name.localeCompare(b.name)
      )
    };
  },

  async renderTeams(selector, limit = 999) {
    const mount = document.querySelector(selector);
    if (!mount) return;
    const teamData = await this.getTeams();
    mount.innerHTML = teamData.teams.slice(0, limit).map((team) => {
      const logo = this.findTeamLogo(team);
      const initials = this.getInitials(team.name);
      const record = typeof team.won !== "undefined" ? `${team.won}-${team.lost}${team.nr ? `-${team.nr}` : ""}` : "TBC";
      const standing = team.position ? `#${team.position}` : "Team";
      return `
        <article class="team-card">
          <div class="team-mark" style="--team-primary:${team.primaryColor || '#1F3A8A'};--team-secondary:${team.secondaryColor || '#2563EB'};">
            <img src="${logo}" alt="${team.name} logo" loading="lazy" onerror="this.parentElement.classList.add('no-logo')" />
            <span class="team-badge">${initials}</span>
          </div>
          <div class="team-body">
            <div class="team-row">
              <span class="badge-chip">${team.group || team.city || "League team"}</span>
              <span class="team-rank">${standing}</span>
            </div>
            <h3>${team.name}</h3>
            <p class="team-location">${team.city || "Official league franchise"}</p>
            <p>${team.summary || "Official team profile. Update the club details from data/teams.json whenever you are ready."}</p>
            <dl class="team-meta">
              <div><dt>Group</dt><dd>${team.group || "—"}</dd></div>
              <div><dt>Record</dt><dd>${record}</dd></div>
              <div><dt>Points</dt><dd>${team.points ?? "—"}</dd></div>
              <div><dt>Home Ground</dt><dd>${team.homeGround || "TBC"}</dd></div>
            </dl>
          </div>
        </article>
      `;
    }).join("");
  },

  findTeamLogo(team) {
    return team.logo || `photos/teams/${team.slug}.png`;
  },

  getInitials(name = "") {
    return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "BCL";
  },

  async renderNewsCards(selector, limit = 999) {
    const mount = document.querySelector(selector);
    if (!mount) return;
    const items = await this.fetchJson("content/news/index.json");
    mount.innerHTML = items.slice(0, limit).map((item) => `
      <article class="news-card">
        <a class="news-cover-link" href="news-detail.html?slug=${item.slug}">
          <img src="${item.coverImage || 'assets/images/news-placeholder.svg'}" alt="${item.title}" loading="lazy" onerror="this.src='assets/images/news-placeholder.svg'" />
        </a>
        <div class="news-body">
          <div class="news-meta">
            <p class="eyebrow">${this.formatDate(item.date)}</p>
            <span class="badge-chip ghost">${item.author || "BCL Media"}</span>
          </div>
          <h3><a href="news-detail.html?slug=${item.slug}">${item.title}</a></h3>
          <p>${item.excerpt || ""}</p>
          <a class="text-link" href="news-detail.html?slug=${item.slug}">Read story</a>
        </div>
      </article>
    `).join("");
  },

  async renderNewsDetail() {
    const mount = document.querySelector("#news-detail");
    if (!mount) return;
    const slug = new URLSearchParams(window.location.search).get("slug");
    if (!slug) {
      mount.innerHTML = "<p>News item not found.</p>";
      return;
    }
    try {
      const item = await this.fetchJson(`content/news/${slug}.json`);
      mount.innerHTML = `
        <p class="eyebrow">${this.formatDate(item.date)} • ${item.author || "BCL Media"}</p>
        <h1>${item.title}</h1>
        <img class="news-detail-cover" src="${item.coverImage || 'assets/images/news-placeholder.svg'}" alt="${item.title}" onerror="this.src='assets/images/news-placeholder.svg'" />
        <div class="rich-text">${this.renderBlocks(item.body || [])}</div>
      `;
    } catch (error) {
      mount.innerHTML = "<p>Unable to load this news item.</p>";
    }
  },

  renderBlocks(blocks) {
    return blocks.map((block) => {
      if (block.type === "paragraph") return `<p>${block.text}</p>`;
      if (block.type === "list") return `<ul>${(block.items || []).map((item) => `<li>${item}</li>`).join("")}</ul>`;
      return "";
    }).join("");
  },

  buildGalleryModal() {
    if (document.querySelector(".gallery-modal")) return;
    document.body.insertAdjacentHTML("beforeend", `
      <div class="gallery-modal" aria-hidden="true" role="dialog" aria-label="Gallery carousel">
        <button class="gallery-modal-close" type="button" aria-label="Close image viewer">×</button>
        <button class="gallery-nav prev" type="button" aria-label="Previous image">‹</button>
        <div class="gallery-modal-content">
          <img class="gallery-modal-image" src="" alt="Gallery image" />
          <div class="gallery-modal-caption"></div>
        </div>
        <button class="gallery-nav next" type="button" aria-label="Next image">›</button>
      </div>
    `);
  },

  bindGalleryModalEvents() {
    document.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-gallery-index]");
      if (trigger) {
        this.openGalleryModal(Number(trigger.dataset.galleryIndex));
        return;
      }

      const modal = event.target.closest(".gallery-modal");
      if (event.target.closest(".gallery-modal-close")) {
        this.closeGalleryModal();
      } else if (event.target.closest(".gallery-nav.prev")) {
        this.shiftGallery(-1);
      } else if (event.target.closest(".gallery-nav.next")) {
        this.shiftGallery(1);
      } else if (modal && event.target.classList.contains("gallery-modal")) {
        this.closeGalleryModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      const modal = document.querySelector(".gallery-modal.active");
      if (!modal) return;
      if (event.key === "Escape") this.closeGalleryModal();
      if (event.key === "ArrowLeft") this.shiftGallery(-1);
      if (event.key === "ArrowRight") this.shiftGallery(1);
    });
  },

  updateGalleryModal() {
    const modal = document.querySelector(".gallery-modal");
    if (!modal || !this.galleryItems.length) return;
    const item = this.galleryItems[this.activeGalleryIndex];
    const image = modal.querySelector(".gallery-modal-image");
    const caption = modal.querySelector(".gallery-modal-caption");
    image.src = item?.src || "assets/images/gallery-placeholder.svg";
    image.alt = item?.title || "Gallery image";
    image.onerror = () => { image.src = "assets/images/gallery-placeholder.svg"; };
    caption.innerHTML = `<strong>${item?.title || ""}</strong><span>${item?.caption || ""}</span>`;
  },

  openGalleryModal(index = 0) {
    this.buildGalleryModal();
    const modal = document.querySelector(".gallery-modal");
    if (!modal || !this.galleryItems.length) return;
    this.activeGalleryIndex = Math.max(0, Math.min(index, this.galleryItems.length - 1));
    this.updateGalleryModal();
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  },

  closeGalleryModal() {
    const modal = document.querySelector(".gallery-modal");
    if (!modal) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  },

  shiftGallery(step) {
    if (!this.galleryItems.length) return;
    this.activeGalleryIndex = (this.activeGalleryIndex + step + this.galleryItems.length) % this.galleryItems.length;
    this.updateGalleryModal();
  },

  titleFromPath(value = "") {
    return value
      .split("/")
      .pop()
      ?.replace(/\.[^.]+$/, "")
      .replace(/[-_]+/g, " ")
      .trim() || "Gallery image";
  },

  async getGalleryItems() {
    const config = await this.fetchJson("data/gallery.json").catch(() => ({}));
    const folder = config.folder || "photos/gallery";
    let items = [];

    if (config.folder) {
      try {
        const folderData = await this.fetchJson(`${folder.replace(/\/+$/, "")}/index.json`);
        items = Array.isArray(folderData) ? folderData : (folderData.items || []);
      } catch (error) {
        console.warn("Using gallery items from data/gallery.json", error);
      }
    }

    if (!items.length && Array.isArray(config.items)) {
      items = config.items;
    }

    return {
      folder,
      items: items
        .map((item) => {
          if (typeof item === "string") {
            return { src: item, title: this.titleFromPath(item), caption: "" };
          }
          const src = item.src || item.path || "";
          if (!src) return null;
          return {
            src,
            title: item.title || this.titleFromPath(src),
            caption: item.caption || ""
          };
        })
        .filter(Boolean)
    };
  },

  async renderGallery(selector, limit = 999) {
    const mount = document.querySelector(selector);
    if (!mount) return;

    const gallery = await this.getGalleryItems();
    this.galleryItems = gallery.items || [];

    if (!this.galleryItems.length) {
      mount.innerHTML = `
        <div class="empty-state">
          <strong>No gallery photos found.</strong>
          <p>Upload images into <code>${gallery.folder}</code> and run the gallery build step to make them appear here automatically.</p>
        </div>
      `;
      return;
    }

    mount.innerHTML = this.galleryItems.slice(0, limit).map((item, index) => `
      <figure class="gallery-card">
        <button class="gallery-open" data-gallery-index="${index}" type="button" aria-label="Open ${item.title || 'gallery image'}">
          <img src="${item.src}" alt="${item.title || 'Gallery image'}" loading="lazy" onerror="this.src='assets/images/gallery-placeholder.svg'" />
        </button>
        <figcaption>
          <strong>${item.title || ""}</strong>
          <span>${item.caption || ""}</span>
        </figcaption>
      </figure>
    `).join("");
  },

  async renderSponsors(selector) {
    const mount = document.querySelector(selector);
    if (!mount) return;
    const data = await this.fetchJson("data/sponsors.json");
    mount.innerHTML = (data.sponsors || []).map((item) => `
      <a class="sponsor-card" href="${item.url || '#'}" target="_blank" rel="noreferrer">
        <span class="sponsor-tier">${item.tier || "Partner"}</span>
        <img src="${item.logo}" alt="${item.name}" loading="lazy" />
        <strong>${item.name}</strong>
      </a>
    `).join("");
  },

  formatDate(dateString) {
    if (!dateString) return "Date TBC";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
  },

  statusClass(status) {
    const value = (status || "").toLowerCase();
    if (value.includes("live")) return "live";
    if (value.includes("result")) return "result";
    return "upcoming";
  },

  slugify(value = "") {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
};

window.addEventListener("DOMContentLoaded", () => BCL.boot());
