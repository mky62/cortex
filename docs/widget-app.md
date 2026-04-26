# Widget App

The customer-facing embeddable widget at `apps/widget` (port 3001).

## Overview

- **No authentication** — uses contact sessions (24h expiry) instead of Clerk
- **State management** — Jotai atoms for screen navigation and session data
- **Entry point** — `?organizationId=<org_id>` query parameter

## Providers

```tsx
// apps/widget/components/providers.tsx
<ConvexProvider client={convex}>    // No Clerk — plain Convex provider
  <Provider>                        // Jotai provider
    {children}
  </Provider>
</ConvexProvider>
```

## Screen State Machine

```mermaid
stateDiagram-v2
    [*] --> loading : Widget opens

    loading --> auth : No valid session
    loading --> selection : Valid session found
    loading --> error : Org invalid / Settings missing

    auth --> selection : Submit name + email

    selection --> chat : Click "Chat with us"
    selection --> voice : Click "Start voice call"<br/>(requires Vapi)
    selection --> contact : Click "Call Us"<br/>(requires phone number)
    selection --> inbox : Footer inbox button

    chat --> selection : Back button
    voice --> selection : Back button
    contact --> selection : Back button
    inbox --> selection : Back button

    inbox --> chat : Select chat conversation

    voice --> chat : End call → view transcript
```

## Initialization Sequence

```mermaid
sequenceDiagram
    participant Widget as Widget View
    participant Loading as Loading Screen
    participant API as Convex Public API

    Widget->>Loading: organizationId via URL

    Note over Loading: Step 1: Validate Organization
    Loading->>API: public.organizations.validate
    API-->>Loading: valid / invalid

    Note over Loading: Step 2: Check Session
    alt Has stored session ID
        Loading->>API: public.contactSessions.validate
        API-->>Loading: valid / expired
    else No stored session
        Note over Loading: sessionValid = false
    end

    Note over Loading: Step 3: Load Widget Settings
    Loading->>API: public.widgetSettings.getByOrganizationId
    API-->>Loading: widgetSettings

    Note over Loading: Step 4: Load Vapi Secrets
    Loading->>API: public.secrets.getVapiSecrets
    API-->>Loading: publicApiKey (or null)

    alt Valid session
        Loading->>Widget: Show "selection" screen
    else No valid session
        Loading->>Widget: Show "auth" screen
    end
```

## Atoms (State)

Defined in `apps/widget/modules/widget/atoms/widget-atoms.ts`.

| Atom | Type | Storage | Purpose |
|---|---|---|---|
| `screenAtom` | `WidgetScreen` | Memory | Current screen |
| `organizationIdAtom` | `string \| null` | Memory | Current org ID |
| `errorMessageAtom` | `string \| null` | Memory | Error display |
| `loadingMessageAtom` | `string \| null` | Memory | Loading status text |
| `conversationIdAtom` | `Id<"conversations"> \| null` | Memory | Active conversation |
| `contactSessionIdAtomFamily` | `Id<"contactSessions"> \| null` | **localStorage** | Per-org session ID |
| `widgetSettingsAtom` | `Doc<"widgetSettings"> \| null` | Memory | Widget config |
| `vapiSecretsAtom` | `{ publicApiKey: string } \| null` | Memory | Vapi credentials |
| `hasVapiSecretsAtom` | Derived | — | Whether voice is available |

## Screens

### Loading Screen (`widget-loading-screen.tsx`)

Initialization sequence:

1. **`org` step** — Validate `organizationId` via `public.organizations.validate`
2. **`session` step** — Check if stored `contactSessionId` is still valid
3. **`settings` step** — Load `widgetSettings` for the organization
4. **`vapi` step** — Load Vapi public API key (for voice features)
5. **`done`** — Route to `selection` (if valid session) or `auth` (if no session)

### Auth Screen (`widget-auth-screen.tsx`)

- Collects **name** and **email** from visitor
- Creates a `contactSession` with browser metadata (userAgent, timezone, screen size, etc.)
- Stores session ID in localStorage via `contactSessionIdAtomFamily`
- Navigates to `selection`

### Selection Screen (`widget-selection-screen.tsx`)

Main menu with up to 3 options:

1. **Chat with us** — Always available. Creates a new chat conversation → navigates to `chat`
2. **Start voice call** — Only if `hasVapiSecrets && vapiSettings.assistantId`. Navigates to `voice`
3. **Call Us** — Only if `hasVapiSecrets && vapiSettings.phoneNumber`. Navigates to `contact`

### Chat Screen (`widget-chat-screen.tsx`)

- Displays thread messages via `useThreadMessages` hook
- Supports infinite scroll (load older messages)
- Shows **suggestion chips** after the first (greeting) message
- Sends messages via `public.messages.create` (triggers AI agent)
- Shows voice transcript for voice-type conversations
- Disables input when conversation is resolved

### Voice Screen (`widget-voice-screen.tsx`)

- Uses `useVapi` hook for Vapi Web SDK integration
- Shows live transcript during call
- Visual indicators: speaking (red pulse) vs listening (green)
- Start/end call buttons
- Transcript persisted to backend via `updateVoiceTranscript`

### Inbox Screen (`widget-inbox-screen.tsx`)

- Paginated list of past conversations
- Shows last message preview, conversation type (chat/voice), status
- Click chat conversation → opens in `chat` screen
- Voice conversations are view-only (disabled)

### Contact Screen (`widget-contact-screen.tsx`)

- Displays phone number from widget settings
- Copy to clipboard button
- "Call Now" button with `tel:` link

### Error Screen (`widget-error-screen.tsx`)

- Generic error display with `AlertTriangleIcon`
- Shows `errorMessageAtom` value

## useVapi Hook

Defined in `apps/widget/modules/widget/hooks/use-vapi.ts`.

**Returns**:
```ts
{
  isSpeaking: boolean,
  isConnected: boolean,
  isConnecting: boolean,
  transcript: TranscriptMessage[],
  conversationId: Id<"conversations"> | null,
  startCall: () => void,
  endCall: () => void,
}
```

**Event handlers**:
- `call-start` → Creates voice conversation in backend, sets `conversationId`
- `call-end` → Calls `completeVoiceConversation` to record duration
- `speech-start/speech-end` → Toggles `isSpeaking`
- `message` (final transcript) → Appends to local transcript + persists via `updateVoiceTranscript`

> **Known issue**: The useEffect has an empty dependency array `[]` but references reactive values (`conversationId`, `contactSessionId`), causing stale closures. See [Known Issues](./known-issues.md).

## Widget Layout

```mermaid
graph TB
    subgraph Widget["Widget View"]
        Header["WidgetHeader<br/>(blue gradient)"]
        Content["Screen Content<br/>(flexible height)"]
        Footer["WidgetFooter<br/>(Home + Inbox)"]
    end

    Header --> Content --> Footer
```
