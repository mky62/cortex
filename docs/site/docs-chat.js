/**
 * RAG-based Documentation Chat for Cortex
 * Uses pre-built hashed TF-IDF embeddings from rag-embeddings.json
 */


class DocsRAGChat {
  constructor() {
    this.chunks = [];
    this.apiKey = localStorage.getItem("openrouter_api_key") || "";
    this.model = localStorage.getItem("openrouter_model") || "nvidia/nemotron-3-super-120b-a12b:free";
    this.retrievalK = parseInt(localStorage.getItem("retrieval_k")) || 3;
    this.isIndexed = false;
    this.isLoading = false;
    
    this.init();
  }

  init() {
    this.setupUI();
    this.loadSettings();
    
    if (this.apiKey) {
      this.initializeRAG();
    }
  }

  setupUI() {
    const apiKeyInput = document.getElementById("api-key");
    const modelSelect = document.getElementById("model-select");
    const retrievalKInput = document.getElementById("retrieval-k");
    const saveBtn = document.getElementById("save-settings");
    const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn");

    if (saveBtn) {
      saveBtn.addEventListener("click", () => this.saveSettings());
    }

    if (chatInput) {
      chatInput.addEventListener("input", () => this.autoResize(chatInput));
      chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener("click", () => this.sendMessage());
    }

    if (modelSelect) {
      modelSelect.value = this.model;
    }
    if (retrievalKInput) {
      retrievalKInput.value = this.retrievalK;
    }
  }

  loadSettings() {
    const apiKeyInput = document.getElementById("api-key");
    if (apiKeyInput && this.apiKey) {
      apiKeyInput.value = this.apiKey;
    }
  }

  saveSettings() {
    const apiKeyInput = document.getElementById("api-key");
    const modelSelect = document.getElementById("model-select");
    const retrievalKInput = document.getElementById("retrieval-k");

    this.apiKey = apiKeyInput?.value?.trim() || "";
    this.model = modelSelect?.value || "nvidia/nemotron-3-super-120b-a12b:free";
    this.retrievalK = parseInt(retrievalKInput?.value) || 3;

    if (!this.apiKey) {
      alert("Please enter an OpenRouter API key");
      return;
    }

    localStorage.setItem("openrouter_api_key", this.apiKey);
    localStorage.setItem("openrouter_model", this.model);
    localStorage.setItem("retrieval_k", this.retrievalK.toString());

    document.getElementById("chat-settings").style.display = "none";
    document.getElementById("chat-container").style.display = "flex";
    document.getElementById("docs-index").style.display = "block";

    this.initializeRAG();
  }

  async initializeRAG() {
    const statusEl = document.getElementById("index-status");
    statusEl.textContent = "Loading pre-built documentation index...";

    try {
      await this.loadEmbeddingsIndex();
      this.isIndexed = true;
      statusEl.textContent = `Loaded ${this.chunks.length} chunks from ${this.indexMeta?.files?.length || 0} documents`;
      document.getElementById("send-btn").disabled = false;
      this.renderDocsList();
    } catch (err) {
      statusEl.textContent = `Error: ${err.message}`;
      console.error("RAG initialization failed:", err);
    }
  }

  async loadEmbeddingsIndex() {
    const response = await fetch("./rag-embeddings.json");
    if (!response.ok) {
      throw new Error(`Failed to load embeddings: ${response.status}`);
    }
    
    const data = await response.json();
    this.indexMeta = {
      type: data.type,
      version: data.version,
      dimension: data.dimension,
      chunkCount: data.chunkCount,
      files: data.files,
    };
    
    this.chunks = data.chunks.map(c => ({
      id: c.id,
      text: c.text,
      doc: c.source,
      chunkIndex: c.chunkIndex,
      vector: new Float32Array(c.vector),
    }));
  }

  cosineSimilarity(vecA, vecB) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    return normA && normB ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
  }

  retrieve(query, k = this.retrievalK) {
    const queryTerms = query.toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(t => t.length > 2);
    
    const queryVec = new Float32Array(this.indexMeta.dimension);
    for (const term of queryTerms) {
      let hash = 0;
      for (let i = 0; i < term.length; i++) {
        hash = ((hash << 5) - hash) + term.charCodeAt(i);
        hash = hash & hash;
      }
      const idx = Math.abs(hash) % this.indexMeta.dimension;
      queryVec[idx] += 1;
    }

    const scores = this.chunks.map(chunk => ({
      chunk,
      score: this.cosineSimilarity(queryVec, chunk.vector),
    }));

    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, k).map(s => s.chunk);
  }

  async sendMessage() {
    const input = document.getElementById("chat-input");
    const message = input.value.trim();
    
    if (!message || this.isLoading || !this.isIndexed) return;

    this.isLoading = true;
    input.value = "";
    input.style.height = "auto";
    document.getElementById("send-btn").disabled = true;

    this.appendMessage("user", message);
    
    const statusEl = document.getElementById("retrieval-status");
    statusEl.textContent = "Retrieving relevant documentation...";
    statusEl.classList.add("active");

    try {
      const retrieved = this.retrieve(message);
      const context = this.buildContext(retrieved);
      
      statusEl.textContent = `Retrieved ${retrieved.length} relevant chunks`;
      
      const response = await this.queryLLM(message, context);
      this.appendMessage("assistant", response, retrieved);
    } catch (err) {
      this.appendMessage("assistant", `Error: ${err.message}`);
      console.error("Chat error:", err);
    } finally {
      this.isLoading = false;
      document.getElementById("send-btn").disabled = false;
      statusEl.classList.remove("active");
      setTimeout(() => statusEl.textContent = "", 2000);
    }
  }

  buildContext(chunks) {
    return chunks.map((c, i) =>
      `[${i + 1}] From "${c.doc}" (chunk ${c.chunkIndex}):\n${c.text.slice(0, 800)}`
    ).join("\n\n---\n\n");
  }

  async queryLLM(query, context) {
    const prompt = `You are a documentation assistant for Cortex, an AI-powered customer support platform.
Answer the user's question based on the provided documentation excerpts.

Documentation excerpts:
${context}

User question: ${query}

Instructions:
- Answer based ONLY on the provided documentation
- If the answer isn't in the documentation, say so clearly
- Be concise but thorough
- Include code examples when relevant
- Cite which document(s) you used with [1], [2], etc.

Answer:`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
          "HTTP-Referer": window.location.href,
          "X-Title": "Cortex Docs Chat",
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 2048,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.choices?.[0]?.message?.content) {
      return data.choices[0].message.content;
    }

    throw new Error("Unexpected API response format");
  }

  appendMessage(role, content, sources = null) {
    const container = document.getElementById("chat-messages");
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${role}`;

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.innerHTML = role === "user" 
      ? '<i data-lucide="user"></i>' 
      : '<i data-lucide="bot"></i>';

    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";
    
    if (role === "assistant") {
      contentDiv.innerHTML = this.formatMarkdown(content);
    } else {
      contentDiv.innerHTML = `<p>${this.escapeHtml(content)}</p>`;
    }

    msgDiv.appendChild(avatar);
    msgDiv.appendChild(contentDiv);

    if (sources && sources.length > 0) {
      const sourcesDiv = document.createElement("div");
      sourcesDiv.className = "message-sources";
      sourcesDiv.innerHTML = `<strong>Sources:</strong> ${sources.map(s => 
        `<span class="source-tag">${s.doc}</span>`
      ).join("")}`;
      contentDiv.appendChild(sourcesDiv);
    }

    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
    
    if (typeof lucide !== "undefined") {
      lucide.createIcons({ icons: { "user": true, "bot": true }, node: msgDiv });
    }
  }

  formatMarkdown(text) {
    return text
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
      .replace(/\[([\d]+)\]/g, "<sup>[$1]</sup>")
      .replace(/\n/g, "<br>");
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  autoResize(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + "px";
  }

  renderDocsList() {
    const container = document.getElementById("docs-list");
    if (!container || !this.indexMeta?.files) return;

    container.innerHTML = this.indexMeta.files.map(f =>
      `<span class="doc-tag">${f}</span>`
    ).join("");
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => new DocsRAGChat());
} else {
  new DocsRAGChat();
}
