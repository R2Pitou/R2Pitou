const USER = "R2Pitou";
const featuredRepos = new Set(["working-draft", "chatgpt-bingo", "cv", "R2Pitou"]);
const fallbackRepos = [
  {
    name: "working-draft",
    html_url: "https://github.com/R2Pitou/working-draft",
    page_url: "https://r2pitou.github.io/working-draft/",
    description: "Public working drafts and deploy experiments.",
    language: "HTML",
    stargazers_count: 0,
    forks_count: 0,
    topics: ["github-pages"],
    pushed_at: "2026-01-01T00:00:00Z",
  },
  {
    name: "chatgpt-bingo",
    html_url: "https://github.com/R2Pitou/chatgpt-bingo",
    page_url: "https://r2pitou.github.io/chatgpt-bingo/",
    description: "A small browser game built around familiar AI chat habits.",
    language: "JavaScript",
    stargazers_count: 0,
    forks_count: 0,
    topics: ["game"],
    pushed_at: "2026-01-01T00:00:00Z",
  },
  {
    name: "cv",
    html_url: "https://github.com/R2Pitou/cv",
    page_url: "https://r2pitou.github.io/cv/",
    description: "CV and profile site materials.",
    language: "HTML",
    stargazers_count: 0,
    forks_count: 0,
    topics: ["profile"],
    pushed_at: "2026-01-01T00:00:00Z",
  },
  {
    name: "R2Pitou",
    html_url: "https://github.com/R2Pitou/R2Pitou",
    page_url: "https://working-draft.org/",
    description: "Profile README and this project hub.",
    language: "Markdown",
    stargazers_count: 0,
    forks_count: 0,
    topics: ["profile-readme"],
    pushed_at: "2026-01-01T00:00:00Z",
  },
];

const grid = document.querySelector("#repo-grid");
const count = document.querySelector("#repo-count");
const search = document.querySelector("#repo-search");
let repos = [];

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function repoMatches(repo, term) {
  if (!term) return true;
  const haystack = [
    repo.name,
    repo.description,
    repo.language,
    ...(repo.topics || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(term.toLowerCase());
}

function pageUrlFor(repo) {
  if (repo.page_url) return repo.page_url;
  if (repo.name === USER) return "https://working-draft.org/";
  if (repo.homepage) return repo.homepage;
  if (repo.has_pages) return `https://${USER.toLowerCase()}.github.io/${repo.name}/`;
  return "";
}

function renderRepos(term = "") {
  const visible = repos.filter((repo) => repoMatches(repo, term));
  count.textContent = `${visible.length} ${visible.length === 1 ? "repo" : "repos"} shown`;

  if (visible.length === 0) {
    grid.innerHTML = `<p class="empty">No repositories match that search.</p>`;
    return;
  }

  grid.innerHTML = visible
    .map((repo) => {
      const topics = (repo.topics || []).slice(0, 4);
      const description = repo.description || "No description yet.";
      const language = repo.language || "Mixed";
      const featured = featuredRepos.has(repo.name);
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
            ${featured ? `<span class="repo-badge">Featured</span>` : ""}
          </header>
          <p class="repo-description">${escapeHtml(description)}</p>
          <div class="repo-footer">
            <div class="repo-topics" aria-label="Repository topics">${topicMarkup}</div>
            <div class="repo-actions">
              <span class="repo-meta">${escapeHtml(language)} &middot; Updated ${formatDate(repo.pushed_at)}</span>
              <span class="repo-links">
                <a class="repo-link" href="${escapeHtml(repo.html_url)}">View repo</a>
                ${pageLink}
              </span>
            </div>
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
  try {
    const response = await fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);

    const data = await response.json();
    repos = data
      .filter((repo) => !repo.archived && !repo.disabled)
      .sort((a, b) => {
        const featureDelta = Number(featuredRepos.has(b.name)) - Number(featuredRepos.has(a.name));
        if (featureDelta) return featureDelta;
        return new Date(b.pushed_at) - new Date(a.pushed_at);
      });
  } catch (error) {
    repos = fallbackRepos;
    count.textContent = "Showing fallback links";
  }

  renderRepos(search.value.trim());
}

search.addEventListener("input", () => renderRepos(search.value.trim()));
loadRepos();
