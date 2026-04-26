# Configuration & Environment

## Environment Variables

### `apps/web/.env`

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | Yes | Convex deployment URL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk frontend publishable key |
| `CLERK_SECRET_KEY` | Yes | Clerk backend secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | No | Sign-in URL path |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | No | Sign-up URL path |

### `apps/widget/.env`

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | Yes | Convex deployment URL |

### `packages/backend/.env.local`

| Variable | Required | Description |
|---|---|---|
| `CLERK_JWT_ISSUER_DOMAIN` | Yes | Clerk JWT issuer for Convex auth |
| `CLERK_SECRET_KEY` | Yes | Clerk backend secret key |
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key (LLM gateway) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes | Google AI API key (Gemini for file extraction) |
| `AWS_REGION` | Yes | AWS region for Secrets Manager |
| `AWS_ACCESS_KEY_ID` | Yes | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | Yes | AWS secret key |

## Convex Configuration

### `convex.config.ts`

```ts
const app = defineApp();
app.use(agent);  // @convex-dev/agent — AI agent framework
app.use(rag);    // @convex-dev/rag — knowledge base with vector search
```

### `auth.config.ts`

Clerk-based authentication:
```ts
{
  providers: [{
    domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
    applicationID: "convex",
  }]
}
```

## Turborepo Configuration

### `turbo.json`

| Task | Depends On | Cached | Persistent |
|---|---|---|---|
| `build` | `^build` | Yes | No |
| `lint` | `^lint` | Yes | No |
| `format` | `^format` | Yes | No |
| `typecheck` | `^typecheck` | Yes | No |
| `dev` | — | No | Yes |

## Development Commands

```bash
# Start all apps in dev mode
pnpm dev

# Build all packages
pnpm build

# Lint all packages
pnpm lint

# Type check all packages
pnpm typecheck

# Format all files
pnpm format

# Start Convex backend only
cd packages/backend && pnpm dev

# Deploy Convex to production
cd packages/backend && npx convex deploy
```

## External Service Setup

### Clerk
1. Create a Clerk application
2. Enable organizations
3. Set `CLERK_JWT_ISSUER_DOMAIN` to your Clerk Frontend API URL
4. Configure Convex auth provider with Clerk

### Vapi
1. Create a Vapi account
2. Create an assistant and/or get a phone number
3. In the dashboard, connect Vapi via the Plugins page (enter API keys)

### OpenRouter
1. Create an OpenRouter account
2. Get an API key
3. Set `OPENROUTER_API_KEY` in Convex environment

### Google AI
1. Create a Google Cloud project
2. Enable Generative AI API
3. Get an API key
4. Set `GOOGLE_GENERATIVE_AI_API_KEY` in Convex environment

### AWS Secrets Manager
1. Create an IAM user with Secrets Manager permissions
2. Set `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` in Convex environment
3. Secrets are created automatically with the pattern: `tenant/{orgId}/{service}`
