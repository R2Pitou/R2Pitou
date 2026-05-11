const USER = "R2Pitou";

const fallbackRepos = [
  {
    name: "cv",
    html_url: "https://github.com/R2Pitou/cv",
    page_url: "https://r2pitou.github.io/cv/",
    description: "CV and professional background.",
    language: "HTML",
    topics: ["profile"],
    pushed_at: "2026-01-01T00:00:00Z",
  },
  {
    name: "working-draft",
    html_url: "https://github.com/R2Pitou/R2Pitou",
    page_url: "https://working-draft.org/",
    description: "Working Draft site source.",
    language: "Jekyll",
    topics: ["github-pages", "posse"],
    pushed_at: "2026-01-01T00:00:00Z",
  },
];

const grid = document.querySelector("#repo-grid");
const count = document.querySelector("#repo-count");

function featuredRepoData() {
  const node = document.querySelector("#featured-repos-data");
  if (!node) return [];
  try {
    return JSON.parse(node.textContent);
  } catch {
    return [];
  }
}

const featuredRepos = new Map(featuredRepoData().map((repo) => [repo.name, repo]));

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function pageUrlFor(repo) {
  const featured = featuredRepos.get(repo.name);
  if (featured?.page_url) return featured.page_url;
  if (repo.page_url) return repo.page_url;
  if (repo.name === USER) return "https://working-draft.org/";
  if (repo.homepage) return repo.homepage;
  if (repo.has_pages) return `https://${USER.toLowerCase()}.github.io/${repo.name}/`;
  return "";
}

function labelFor(repo) {
  return featuredRepos.get(repo.name)?.label || "";
}

function isFeatured(repo) {
  return Boolean(featuredRepos.get(repo.name)?.featured);
}

function renderRepos(repos) {
  if (!grid || !count) return;
  count.textContent = `${repos.length} ${repos.length === 1 ? "repo" : "repos"} shown`;

  if (repos.length === 0) {
    grid.innerHTML = `<p class="empty">No public repositories found.</p>`;
    return;
  }

  grid.innerHTML = repos
    .map((repo) => {
      const topics = (repo.topics || []).slice(0, 4);
      const description = repo.description || "No description yet.";
      const language = repo.language || "Mixed";
      const featured = isFeatured(repo);
      const label = labelFor(repo);
      const pageUrl = pageUrlFor(repo);
      const pageLink = pageUrl
        ? `<a class="repo-link repo-link-secondary" href="${escapeHtml(pageUrl)}">View page</a>`
        : "";
      const topicMarkup = topics.length
        ? topics.map((topic) => `<span>${escapeHtml(topic)}</span>`).join("")
        : `<span>${escapeHtml(language)}</span>`;

      return `
        <article class="repo-card${featured ? " featured" : ""}">
          <header>
            <h3>${escapeHtml(repo.name)}</h3>
            ${label ? `<span class="repo-badge">${escapeHtml(label)}</span>` : ""}
          </header>
          <p class="repo-description">${escapeHtml(description)}</p>
          <div class="repo-topics" aria-label="Repository topics">${topicMarkup}</div>
          <div class="repo-actions">
            <span class="repo-meta">${escapeHtml(language)} &middot; Updated ${formatDate(repo.pushed_at)}</span>
            <span class="repo-links">
              <a class="repo-link" href="${escapeHtml(repo.html_url)}">View repo</a>
              ${pageLink}
            </span>
          </div>
        </article>
      `;
    })
    .join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return map[char];
  });
}

async function loadRepos() {
  if (!grid || !count) return;
  try {
    const response = await fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);

    const data = await response.json();
    const repos = data
      .filter((repo) => !repo.archived && !repo.disabled && !repo.private)
      .sort((a, b) => {
        const featureDelta = Number(isFeatured(b)) - Number(isFeatured(a));
        if (featureDelta) return featureDelta;
        return new Date(b.pushed_at) - new Date(a.pushed_at);
      });
    renderRepos(repos);
  } catch {
    count.textContent = "Showing fallback links";
    renderRepos(fallbackRepos);
  }
}

loadRepos();
