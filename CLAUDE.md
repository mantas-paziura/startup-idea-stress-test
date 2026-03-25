# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server (Next.js on port 3000)
npm run build    # Production build
npm run lint     # ESLint
```

No test suite exists yet.

## Architecture

This is a Next.js 16 app (App Router) where users submit a startup idea and are stress-tested by an AI playing a YC partner. After the interview, they receive a structured summary.

### Request flow

1. User enters idea on `/` (home page)
2. Redirected to `/interview` — a client component that manages the conversation
3. On first message, `/api/sessions` creates a Supabase session row and returns its `id`
4. The `sessionId` is passed to every `/api/chat` call; on `messages.length === 1`, one credit is deducted via `lib/credits.ts`
5. The chat API calls Anthropic (`claude-sonnet-4-6`) and returns `{ reply, interviewDone, summary }`
6. When `interviewDone: true`, the interview page calls `/api/suggestions` for next-step suggestions, then calls `PATCH /api/sessions` to mark it completed
7. All API calls record token usage to the `token_usage` Supabase table (fire-and-forget)

### Key architectural decisions

- **Middleware lives in `proxy.ts`** (not `middleware.ts`) — Clerk auth middleware protects `/interview`, `/history`, `/credits`
- **Singleton clients**: `lib/supabase.ts`, `lib/stripe.ts`, and the Anthropic client in the chat route are all lazily-initialized singletons. Always use `getSupabase()` and `getStripe()` rather than instantiating directly.
- **Supabase uses service role key** (`SUPABASE_SERVICE_ROLE_KEY`) server-side — no RLS dependency
- **Interview end detection**: The model returns raw JSON when done. `parseCompletionResponse` in the chat route tries `JSON.parse` first; if it succeeds and has `interviewDone: true`, the interview is over.
- **Credit deduction** is on `messages.length === 1` only — one credit per interview start, not per message. New users get 2 free credits auto-provisioned on first balance check.

### Supabase tables

| Table | Purpose |
|---|---|
| `sessions` | Interview sessions per user (`user_id`, `idea`, `status`, `summary` JSON) |
| `user_credits` | Credit balance per user (`user_id`, `balance`) |
| `credit_transactions` | Ledger of all credit changes (`amount`, `type`, `stripe_session_id`, `session_id`) |
| `token_usage` | Per-call token tracking (`user_id`, `session_id`, `endpoint`, `input_tokens`, `output_tokens`, `model`) |

### Stripe credit packs

Defined in `lib/stripe.ts` as `CREDIT_PACKS`. The checkout flow passes `userId` and `creditAmount` in Stripe session metadata; the webhook at `/api/webhooks/stripe` reads these to credit the user. Idempotency is enforced by checking `stripe_session_id` in `credit_transactions` before inserting.

### Environment variables required

```
ANTHROPIC_API_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_SUPABASE_URL          # (or SUPABASE_URL)
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_5_CREDITS            # Stripe Price ID for 5-credit pack
STRIPE_PRICE_20_CREDITS           # Stripe Price ID for 20-credit pack
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
NEXT_PUBLIC_POSTHOG_KEY
NEXT_PUBLIC_POSTHOG_HOST
```
