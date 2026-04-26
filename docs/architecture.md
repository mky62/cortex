# Architecture Overview

Cortex is an AI-powered customer support platform that enables organizations to provide chat and voice support through an embeddable widget, managed via an operator dashboard.

## High-Level Architecture

```mermaid
graph TB
    subgraph Frontend
        Web["🌐 Web Dashboard<br/>(port 3000)<br/>Operator UI"]
        Widget["💬 Widget App<br/>(port 3001)<br/>Customer UI"]
    end

    subgraph Auth
        Clerk["🔐 Clerk<br/>(org-scoped)"]
        Session["🎫 Contact Session<br/>(24h expiry)"]
    end

    subgraph Convex["Convex Backend"]
        Private["🔒 private/<br/>(authenticated)"]
        Public["🌍 public/<br/>(unauthenticated)"]
        System["⚙️ system/<br/>(internal)"]
        AI["🤖 AI Agent + RAG<br/>(OpenRouter / Google / Vapi)"]
    end

    AWS["🔒 AWS Secrets Manager"]

    Web -->|Clerk Auth| Clerk
    Widget -->|No Auth| Session
    Clerk --> Private
    Session --> Public
    Private --> System
    Public --> System
    Private --> AI
    Public --> AI
    System --> AWS
    AI --> AWS
```

## Monorepo Structure

```mermaid
graph LR
    subgraph Apps
        Web["apps/web<br/>Operator Dashboard<br/>Next.js 16 + Clerk"]
        Widget["apps/widget<br/>Customer Widget<br/>Next.js 16"]
    end

    subgraph Packages
        Backend["packages/backend<br/>Convex Backend"]
        UI["packages/ui<br/>shadcn/ui (70+ components)"]
        Math["packages/math<br/>Math utilities"]
        ESLint["packages/eslint-config"]
        TSConfig["packages/typescript-config"]
    end

    Web --> Backend
    Web --> UI
    Web --> Math
    Widget --> Backend
    Widget --> UI
    Widget --> Math
    Backend --> UI
```

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 (Turbopack) |
| Language | TypeScript 5.9 |
| Database | Convex (realtime, serverless) |
| Auth | Clerk (organization-based) |
| AI Agent | @convex-dev/agent |
| RAG | @convex-dev/rag |
| LLM Gateway | OpenRouter (gpt-4o-mini, qwen3.6-plus) |
| Vision/OCR | Google Gemini 2.0 Flash |
| Voice AI | Vapi (Web SDK + Server SDK) |
| Secrets | AWS Secrets Manager |
| State | Jotai (atoms, atomWithStorage) |
| Forms | react-hook-form + zod |
| UI | shadcn/ui + Tailwind CSS 4 |
| Build | Turborepo + pnpm |

## Data Flow

```mermaid
sequenceDiagram
    participant C as Customer
    participant W as Widget
    participant CVX as Convex
    participant AI as AI Agent
    participant RAG as Knowledge Base
    participant O as Operator

    C->>W: Opens widget
    W->>CVX: Validate org + session
    W->>CVX: Create contact session
    C->>W: Sends message
    W->>CVX: public.messages.create
    CVX->>AI: generateSupportText
    AI-->>CVX: AI response saved to thread
    alt Status is "unresolved"
        CVX->>AI: Agent with tools
        AI->>RAG: searchTool
        RAG-->>AI: Search results
        AI->>CVX: escalateConversation / resolveConversation
    end
    CVX-->>W: Real-time message update
    W-->>C: Shows AI response

    Note over O,CVX: Operator picks up escalated conversation
    O->>CVX: private.messages.create
    CVX-->>W: Real-time message update
    W-->>C: Shows operator response
```

## Two-App Design

### Web Dashboard (`apps/web`)
- **Users**: Organization operators (support agents)
- **Auth**: Clerk with organization scoping
- **Purpose**: View conversations, respond to customers, manage knowledge base, configure widget, connect integrations

### Widget App (`apps/widget`)
- **Users**: End customers/visitors
- **Auth**: None — uses contact sessions (24h expiry)
- **Purpose**: Chat with AI, voice calls, view conversation history, contact phone support
- **Embedding**: Loaded via `?organizationId=<org_id>` query parameter

## Backend 3-Layer Pattern

The Convex backend uses a strict 3-layer API pattern:

1. **`private/`** — Authenticated endpoints requiring Clerk identity + org membership. Used by the web dashboard.
2. **`public/`** — Unauthenticated endpoints validated via contact sessions. Used by the widget.
3. **`system/`** — Internal-only functions (`internalQuery`, `internalMutation`, `internalAction`). Never exposed to clients, called only by other backend functions.

This separation ensures:
- Operators never access the public API (they have full org context via Clerk)
- Customers never access the private API (they have limited session context)
- Internal mutations/queries are protected from direct client invocation
