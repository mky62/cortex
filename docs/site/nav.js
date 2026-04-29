const rightSidebarHTML = `
  <aside class="right-sidebar" id="right-sidebar">
    <div class="right-sidebar-header">
      <i data-lucide="sparkles"></i>
      <span>AI Assistant</span>
    </div>
    <div class="chat-sidebar-settings" id="chat-settings">
      <input type="password" id="sidebar-api-key" placeholder="OpenRouter API key" autocomplete="off" />
      <select id="sidebar-model">
        <option value="nvidia/nemotron-3-super-120b-a12b:free" selected>Nemotron 3 Super (Free)</option>
        <option value="google/gemini-2.0-flash:free">Gemini 2.0 Flash (Free)</option>
        <option value="meta-llama/llama-4-maverick:free">Llama 4 Maverick (Free)</option>
      </select>
      <span class="hint">Your key is stored locally in your browser.</span>
    </div>
    <div class="chat-sidebar-container" id="chat-container" style="display: none;">
      <div class="chat-sidebar-messages" id="chat-messages">
        <div class="message assistant compact">
          <div class="message-avatar"><i data-lucide="bot"></i></div>
          <div class="message-content">
            <p>Hi! Ask me anything about Cortex docs.</p>
          </div>
        </div>
      </div>
    </div>
    <div class="chat-sidebar-hint" id="index-status">Initializing knowledge base...</div>
    <div class="chat-sidebar-input" id="chat-input-container" style="display: none;">
      <textarea id="chat-input" placeholder="Ask a question..." rows="1"></textarea>
      <button id="send-btn" class="chat-sidebar-send" disabled>
        <i data-lucide="send"></i> Send
      </button>
    </div>
  </aside>
`

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
  // Also render right sidebar if not on chat.html
  const page = location.pathname.split("/").pop() || "index.html"
  if (page !== "chat.html") {
    renderRightSidebar()
  }
}

function renderRightSidebar() {
  const div = document.createElement("div")
  div.innerHTML = rightSidebarHTML
  document.body.appendChild(div.firstElementChild)
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
  initSidebarChat()
}

function updateThemeIcon(theme) {
  const icon = document.querySelector("#theme-toggle i")
  if (icon) {
    icon.setAttribute("data-lucide", theme === "dark" ? "sun" : "moon")
  }
}

// Right Sidebar Chat State
let chatInitialized = false
let vectorStore = null
let embeddings = null

document.addEventListener("DOMContentLoaded", initSidebar)

async function initSidebarChat() {
  const page = location.pathname.split("/").pop() || "index.html"
  if (page === "chat.html") return

  const apiKeyInput = document.getElementById("sidebar-api-key")
  const modelSelect = document.getElementById("sidebar-model")
  const chatContainer = document.getElementById("chat-container")
  const chatInputContainer = document.getElementById("chat-input-container")
  const indexStatus = document.getElementById("index-status")
  const chatInput = document.getElementById("chat-input")
  const sendBtn = document.getElementById("send-btn")

  if (!apiKeyInput || !modelSelect) return

  // Load saved settings
  const savedKey = localStorage.getItem("openrouter_api_key")
  const savedModel = localStorage.getItem("openrouter_model")
  if (savedKey) apiKeyInput.value = savedKey
  if (savedModel) modelSelect.value = savedModel

  // Auto-show chat if key exists
  if (savedKey) {
    document.getElementById("chat-settings").style.display = "none"
    chatContainer.style.display = "flex"
    chatInputContainer.style.display = "block"
    if (sendBtn) sendBtn.disabled = true
  }

  // Save settings on input
  apiKeyInput.addEventListener("input", async () => {
    localStorage.setItem("openrouter_api_key", apiKeyInput.value)
    if (apiKeyInput.value && !chatInitialized) {
      document.getElementById("chat-settings").style.display = "none"
      chatContainer.style.display = "flex"
      chatInputContainer.style.display = "block"
      if (sendBtn) sendBtn.disabled = true
      await initVectorStore()
    }
  })

  modelSelect.addEventListener("change", () => {
    localStorage.setItem("openrouter_model", modelSelect.value)
  })

  // Chat input handlers
  if (chatInput && sendBtn) {
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        if (!sendBtn.disabled) sendMessage()
      }
    })

    chatInput.addEventListener("input", () => {
      sendBtn.disabled = !chatInput.value.trim() || !apiKeyInput.value || !chatInitialized
    })

    sendBtn.addEventListener("click", sendMessage)
  }

  // Initialize vector store after setting up handlers
  if (savedKey) {
    await initVectorStore()
    if (chatInput && sendBtn) {
      sendBtn.disabled = !chatInput.value.trim()
    }
  }
}

async function initVectorStore() {
  if (chatInitialized) return

  const indexStatus = document.getElementById("index-status")
  indexStatus.textContent = "Loading docs... (please wait)"

  try {
    const response = await fetch("rag-embeddings.json")
    const data = await response.json()

    // Support both TF-IDF and embedding formats
    if (data.chunks) {
      vectorStore = data.chunks
      // For TF-IDF, we'll use simple text matching instead of embeddings
      embeddings = null
      chatInitialized = true
      indexStatus.textContent = `${vectorStore.length} docs ready (TF-IDF)`
      const sendBtn = document.getElementById("send-btn")
      const chatInput = document.getElementById("chat-input")
      if (sendBtn && chatInput) {
        sendBtn.disabled = !chatInput.value.trim()
      }
    } else {
      throw new Error("Invalid data structure in rag-embeddings.json")
    }
  } catch (error) {
    indexStatus.textContent = "Failed to load docs"
    console.error("Failed to load embeddings:", error)
  }
}

function cosineSimilarity(a, b) {
  let dotProduct = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

async function getEmbedding(text) {
  const apiKey = localStorage.getItem("openrouter_api_key")
  const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": location.href,
      "X-Title": "Cortex Docs Chat",
    },
    body: JSON.stringify({
      model: "openai/text-embedding-3-small",
      input: text,
    }),
  })
  const data = await response.json()
  return data.data[0].embedding
}

async function searchDocs(query, k = 3) {
  if (!vectorStore) {
    throw new Error("Knowledge base not loaded yet")
  }

  // If embeddings exist, use semantic search
  if (embeddings) {
    const queryEmbedding = await getEmbedding(query)
    const similarities = embeddings.map((emb, idx) => ({
      index: idx,
      similarity: cosineSimilarity(queryEmbedding, emb),
    }))
    similarities.sort((a, b) => b.similarity - a.similarity)
    return similarities.slice(0, k).map((s) => vectorStore[s.index])
  }

  // Otherwise use simple text matching for TF-IDF
  const queryLower = query.toLowerCase()
  const scores = vectorStore.map((chunk, idx) => {
    const text = (chunk.text || chunk.content || "").toLowerCase()
    let score = 0
    // Exact phrase match
    if (text.includes(queryLower)) score += 10
    // Word matches
    const queryWords = queryLower.split(/\s+/)
    queryWords.forEach(word => {
      if (word.length > 2 && text.includes(word)) score += 2
    })
    return { index: idx, score }
  })
  scores.sort((a, b) => b.score - a.score)
  return scores.slice(0, k).map((s) => vectorStore[s.index])
}

async function sendMessage() {
  const chatInput = document.getElementById("chat-input")
  const sendBtn = document.getElementById("send-btn")
  const chatMessages = document.getElementById("chat-messages")
  const apiKey = localStorage.getItem("openrouter_api_key")
  const model = localStorage.getItem("openrouter_model") || "nvidia/nemotron-3-super-120b-a12b:free"

  const message = chatInput.value.trim()
  if (!message || !apiKey) return

  // Add user message
  const userMsgDiv = document.createElement("div")
  userMsgDiv.className = "message user compact"
  userMsgDiv.innerHTML = `
    <div class="message-avatar"><i data-lucide="user"></i></div>
    <div class="message-content"><p>${escapeHtml(message)}</p></div>
  `
  chatMessages.appendChild(userMsgDiv)
  lucide.createIcons()

  chatInput.value = ""
  sendBtn.disabled = true
  chatMessages.scrollTop = chatMessages.scrollHeight

  // Show loading
  const loadingDiv = document.createElement("div")
  loadingDiv.className = "message assistant compact"
  loadingDiv.id = "loading-msg"
  loadingDiv.innerHTML = `
    <div class="message-avatar"><i data-lucide="bot"></i></div>
    <div class="message-content"><p>Searching docs...</p></div>
  `
  chatMessages.appendChild(loadingDiv)
  lucide.createIcons()
  chatMessages.scrollTop = chatMessages.scrollHeight

  try {
    // Check if chat is initialized
    if (!chatInitialized) {
      throw new Error("Chat not initialized yet. Please wait...")
    }

    // Search docs
    const relevantChunks = await searchDocs(message, 3)
    if (!relevantChunks || relevantChunks.length === 0) {
      throw new Error("No relevant documents found")
    }
    const context = relevantChunks.map((c) => `### ${c.title}\n${c.content}`).join("\n\n")

    // Update loading text
    loadingDiv.querySelector(".message-content p").textContent = "Thinking..."

    // Call LLM
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": location.href,
        "X-Title": "Cortex Docs Chat",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant for Cortex documentation. Use the provided context to answer questions accurately. If you don't know something, say so.\n\nContext:\n${context}`,
          },
          { role: "user", content: message },
        ],
        temperature: 0.7,
      }),
    })

    const data = await response.json()
    const answer = data.choices[0].message.content

    // Remove loading, add response
    loadingDiv.remove()
    const assistantMsgDiv = document.createElement("div")
    assistantMsgDiv.className = "message assistant compact"
    assistantMsgDiv.innerHTML = `
      <div class="message-avatar"><i data-lucide="bot"></i></div>
      <div class="message-content"><p>${formatAnswer(answer)}</p></div>
    `
    chatMessages.appendChild(assistantMsgDiv)
    lucide.createIcons()
    chatMessages.scrollTop = chatMessages.scrollHeight
  } catch (error) {
    loadingDiv.remove()
    const errorDiv = document.createElement("div")
    errorDiv.className = "message assistant compact"
    errorDiv.innerHTML = `
      <div class="message-avatar"><i data-lucide="bot"></i></div>
      <div class="message-content"><p style="color: var(--danger)">Error: ${escapeHtml(error.message)}</p></div>
    `
    chatMessages.appendChild(errorDiv)
    lucide.createIcons()
  }
}

function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

function formatAnswer(text) {
  return escapeHtml(text).replace(/\n/g, "<br>")
}
