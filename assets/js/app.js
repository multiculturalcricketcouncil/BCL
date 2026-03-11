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
  },

  async routePage() {
    const page = document.body.dataset.page;
    switch (page) {
      case "home":
        await Promise.all([
          this.renderHomeMatches(),
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
            <img src="assets/images/bcl-logo.png" alt="BCL logo" />
            <span class="brand-copy">
              <span class="brand-label">Brisbane Champions League</span>
              <span class="brand-tag">Official league website</span>
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
          <div>
            <img class="footer-logo" src="assets/images/bcl-logo.png" alt="BCL logo" />
            <p>Brisbane Champions League is a premium multicultural cricket property built for fixtures, results, news, sponsors and league storytelling.</p>
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
            <h4>AMCC</h4>
            <a href="amcc.html">About AMCC</a>
            <a href="${this.site?.contactWebsite || '#'}" target="_blank" rel="noreferrer">multiculturalcricket.com.au</a>
            <a href="mailto:${this.site?.contactEmail || ''}">${this.site?.contactEmail || ""}</a>
            <div>${phones}</div>
          </div>
        </div>
        <div class="container footer-bottom">
          <span>© <span data-year></span> Brisbane Champions League</span>
          <span>Official competition platform</span>
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

  async fetchJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Failed to load ${url}`);
    return response.json();
  },

  async getMatches() {
    const config = this.site || {};
    if (config.useLiveApi && config.apiEndpoint) {
      try {
        const liveData = await this.fetchJson(`${config.apiEndpoint}?season=${config.season || "2025"}`);
        if (liveData?.matches || liveData?.items) {
          return { matches: liveData.matches || liveData.items };
        }
      } catch (error) {
        console.warn("Using standard fixture data", error);
      }
    }
    return this.fetchJson("data/fixtures.json");
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

  async renderFixtures() {
    const mount = document.querySelector("#fixtures-grid");
    if (!mount) return;
    const data = await this.getMatches();
    mount.innerHTML = (data.matches || []).map((match) => `
      <article class="fixture-card">
        <div class="fixture-head">
          <div>
            <p class="eyebrow">${match.stage || "Fixture"}</p>
            <h3>${this.formatDate(match.date)}${match.time ? ` • ${match.time}` : ""}</h3>
          </div>
          <span class="match-status ${this.statusClass(match.status)}">${match.status || "Upcoming"}</span>
        </div>
        <p class="match-venue">${match.venue || ""}</p>
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

  async getPointsData() {
    const data = await this.fetchJson("data/points-table.json");
    const seasonGroups = Array.isArray(data.seasons)
      ? data.seasons
      : [{ season: data.season || this.site?.season || "Season", updated: data.updated, table: data.table || [] }];
    return seasonGroups.filter((item) => Array.isArray(item.table));
  },

  renderPointsTableMarkup(rows, updated, includeNote = true) {
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
      ${includeNote && updated ? `<p class="table-note">Updated ${new Date(updated).toLocaleString("en-AU")}</p>` : ""}
    `;
  },

  async renderPointsTable(selector, limit = 999) {
    const mount = document.querySelector(selector);
    if (!mount) return;
    const seasons = await this.getPointsData();
    if (!seasons.length) {
      mount.innerHTML = "<p>No standings available.</p>";
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
        content.innerHTML = this.renderPointsTableMarkup((selected.table || []).slice(0, limit), selected.updated, true);
      };
      select?.addEventListener("change", (event) => renderSeason(event.target.value));
      renderSeason(0);
      return;
    }

    const current = seasons[0];
    mount.innerHTML = this.renderPointsTableMarkup((current.table || []).slice(0, limit), current.updated, false);
  },

  async getTeams() {
    const [meta, tableData, fixtureData] = await Promise.all([
      this.fetchJson("data/teams.json").catch(() => null),
      this.fetchJson("data/points-table.json").catch(() => ({ table: [] })),
      this.fetchJson("data/fixtures.json").catch(() => ({ matches: [] }))
    ]);
    const activeTable = Array.isArray(tableData.seasons) ? tableData.seasons[0]?.table || [] : tableData.table || [];
    const map = new Map();
    activeTable.forEach((row) => {
      map.set(row.team, {
        name: row.team,
        slug: this.slugify(row.team),
        position: row.position,
        played: row.played,
        won: row.won,
        lost: row.lost,
        nr: row.nr,
        points: row.points,
        nrr: row.nrr
      });
    });
    (meta?.teams || []).forEach((team) => {
      const existing = map.get(team.name) || { name: team.name, slug: team.slug || this.slugify(team.name) };
      map.set(team.name, { ...existing, ...team, slug: team.slug || existing.slug || this.slugify(team.name) });
    });
    (fixtureData.matches || []).forEach((match) => {
      [match.homeTeam, match.awayTeam].forEach((name) => {
        if (name && !map.has(name)) map.set(name, { name, slug: this.slugify(name) });
      });
    });
    return {
      season: meta?.season || tableData.season || this.site?.season || "",
      teams: Array.from(map.values()).sort((a, b) => (a.position ?? 999) - (b.position ?? 999) || a.name.localeCompare(b.name))
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
              <span class="badge-chip">${team.city || "League team"}</span>
              <span class="team-rank">${standing}</span>
            </div>
            <h3>${team.name}</h3>
            <p>${team.summary || "Official team profile with match context, form and venue details."}</p>
            <dl class="team-meta">
              <div><dt>Record</dt><dd>${record}</dd></div>
              <div><dt>Points</dt><dd>${team.points ?? "—"}</dd></div>
              <div><dt>NRR</dt><dd>${team.nrr ?? "—"}</dd></div>
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

  async renderGallery(selector, limit = 999) {
    const mount = document.querySelector(selector);
    if (!mount) return;
    const data = await this.fetchJson("data/gallery.json");
    this.galleryItems = data.items || [];
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
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
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
