const sidebarHTML = `
  <aside class="sidebar">
    <div class="sidebar-header">
      <a href="index.html" class="logo">
        <div class="logo-icon">C</div>
        <div>
          <div class="logo-text">Cortex</div>
          <div class="logo-sub">AI Support Platform</div>
        </div>
      </a>
      <button id="theme-toggle" class="theme-toggle" title="Toggle theme">
        <i data-lucide="moon"></i>
      </button>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section">
        <div class="nav-section-title">Overview</div>
        <a href="index.html" class="nav-link"><i data-lucide="home"></i> Home</a>
        <a href="architecture.html" class="nav-link"><i data-lucide="construction"></i> Architecture</a>
      </div>
      <div class="nav-section">
        <div class="nav-section-title">Backend</div>
        <a href="database-schema.html" class="nav-link"><i data-lucide="database"></i> Database Schema</a>
        <a href="backend-api.html" class="nav-link"><i data-lucide="plug"></i> API Reference</a>
        <a href="ai-system.html" class="nav-link"><i data-lucide="bot"></i> AI System</a>
      </div>
      <div class="nav-section">
        <div class="nav-section-title">Frontend</div>
        <a href="widget-app.html" class="nav-link"><i data-lucide="message-circle"></i> Widget App</a>
        <a href="web-dashboard.html" class="nav-link"><i data-lucide="layout-dashboard"></i> Web Dashboard</a>
      </div>
      <div class="nav-section">
        <div class="nav-section-title">Operations</div>
        <a href="configuration.html" class="nav-link"><i data-lucide="settings"></i> Configuration</a>
        <a href="known-issues.html" class="nav-link"><i data-lucide="bug"></i> Known Issues</a>
      </div>
    </nav>
  </aside>
`

function renderSidebar() {
  const placeholder = document.getElementById("sidebar-placeholder")
  if (placeholder) {
    placeholder.outerHTML = sidebarHTML
  }
}

async function initMermaid() {
  if (document.querySelector(".mermaid")) {
    const mermaid =
      await import("https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs")
    const theme = localStorage.getItem("theme") || "dark"
    mermaid.default.initialize({
      theme: theme === "light" ? "default" : "dark",
      startOnLoad: true,
    })
    mermaid.default.run()
  }
}

function initSidebar() {
  renderSidebar()
  lucide.createIcons()

  const theme = localStorage.getItem("theme") || "dark"
  document.documentElement.setAttribute("data-theme", theme)
  updateThemeIcon(theme)

  const themeToggle = document.getElementById("theme-toggle")
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme")
      const next = current === "dark" ? "light" : "dark"
      document.documentElement.setAttribute("data-theme", next)
      localStorage.setItem("theme", next)
      updateThemeIcon(next)
      lucide.createIcons()
    })
  }

  const page = location.pathname.split("/").pop() || "index.html"
  document.querySelectorAll(".nav-link").forEach((link) => {
    const href = link.getAttribute("href")
    if (href === page) {
      link.classList.add("active")
    }
  })

  initMermaid()
}

function updateThemeIcon(theme) {
  const icon = document.querySelector("#theme-toggle i")
  if (icon) {
    icon.setAttribute("data-lucide", theme === "dark" ? "sun" : "moon")
  }
}

document.addEventListener("DOMContentLoaded", initSidebar)
