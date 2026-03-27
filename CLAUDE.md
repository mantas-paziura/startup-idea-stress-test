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
4. The `sessionId` is passed to every `/api/chat` call; credits are deducted per message based on actual token usage (input/output tokens × rate with 4x margin)
5. The chat API calls Anthropic (`claude-sonnet-4-6`) and returns `{ reply, interviewDone, summary, balance, creditsCost }`
6. When `interviewDone: true`, the interview page calls `/api/suggestions` for next-step suggestions (also costs credits), then calls `PATCH /api/sessions` to mark it completed
7. All API calls record token usage + credit cost to the `token_usage` Supabase table (fire-and-forget)
8. If user runs out of credits mid-interview, a banner appears with a "Buy Credits" link; the interview resumes automatically when balance is replenished (polling every 5s)

### Key architectural decisions

- **Middleware lives in `proxy.ts`** (not `middleware.ts`) — Clerk auth middleware protects `/interview`, `/history`, `/credits`
- **Singleton clients**: `lib/supabase.ts`, `lib/stripe.ts`, and the Anthropic client in the chat route are all lazily-initialized singletons. Always use `getSupabase()` and `getStripe()` rather than instantiating directly.
- **Supabase uses service role key** (`SUPABASE_SERVICE_ROLE_KEY`) server-side — no RLS dependency
- **Interview end detection**: The model returns raw JSON when done. `parseCompletionResponse` in the chat route tries `JSON.parse` first; if it succeeds and has `interviewDone: true`, the interview is over.
- **Token-based credit deduction**: Credits are deducted per message based on actual API token usage (input × 0.00012 + output × 0.0006 credits/token, reflecting 4x margin on Anthropic costs with 1 credit = $0.10). Deduction uses an atomic Supabase RPC function `deduct_credits` to prevent race conditions. New users get 2 free credits auto-provisioned on first balance check.

### Supabase tables

| Table | Purpose |
|---|---|
| `sessions` | Interview sessions per user (`user_id`, `idea`, `status`, `summary` JSON, `messages` JSONB) |
| `user_credits` | Credit balance per user (`user_id`, `balance` numeric) |
| `credit_transactions` | Ledger of all credit changes (`amount` numeric, `type`, `stripe_session_id`, `session_id`) |
| `token_usage` | Per-call token tracking (`user_id`, `session_id`, `endpoint`, `input_tokens`, `output_tokens`, `model`, `credits_cost` numeric) |

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
STRIPE_PRICE_10_CREDITS           # Stripe Price ID for 10-credit pack ($1)
STRIPE_PRICE_50_CREDITS           # Stripe Price ID for 50-credit pack ($5)
STRIPE_PRICE_200_CREDITS          # Stripe Price ID for 200-credit pack ($15)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
NEXT_PUBLIC_POSTHOG_KEY
NEXT_PUBLIC_POSTHOG_HOST
```
