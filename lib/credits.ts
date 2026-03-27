import { getSupabase } from "./supabase";

// Token-to-credit rates (with 4x markup, 1 credit = $0.10)
// Claude Sonnet 4.6: $3/M input, $15/M output
const CREDITS_PER_INPUT_TOKEN = 0.00012; // ($3/1M × 4) / $0.10
const CREDITS_PER_OUTPUT_TOKEN = 0.0006; // ($15/1M × 4) / $0.10

export function calculateCreditCost(
  inputTokens: number,
  outputTokens: number
): number {
  const cost =
    inputTokens * CREDITS_PER_INPUT_TOKEN +
    outputTokens * CREDITS_PER_OUTPUT_TOKEN;
  return Math.round(cost * 10000) / 10000; // Round to 4 decimal places
}

export async function getOrCreateCredits(
  userId: string
): Promise<{ balance: number }> {
  const supabase = getSupabase();

  const { data } = await supabase
    .from("user_credits")
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (data) {
    return { balance: Number(data.balance) };
  }

  // Create new user with free tier credits
  const { data: newRow, error } = await supabase
    .from("user_credits")
    .insert({ user_id: userId, balance: 2 })
    .select("balance")
    .single();

  if (error) {
    // Race condition: another request created the row
    const { data: existing } = await supabase
      .from("user_credits")
      .select("balance")
      .eq("user_id", userId)
      .single();
    if (existing) return { balance: Number(existing.balance) };
    throw error;
  }

  // Log free tier transaction
  await supabase.from("credit_transactions").insert({
    user_id: userId,
    amount: 2,
    type: "free_tier",
    description: "Free tier credits",
  });

  return { balance: Number(newRow.balance) };
}

export async function checkBalance(
  userId: string
): Promise<{ balance: number; sufficient: boolean }> {
  const { balance } = await getOrCreateCredits(userId);
  return { balance, sufficient: balance > 0 };
}

export async function deductTokenCredits(
  userId: string,
  sessionId: string,
  inputTokens: number,
  outputTokens: number,
  endpoint: string
): Promise<{ success: boolean; balance: number; cost: number }> {
  const supabase = getSupabase();
  const cost = calculateCreditCost(inputTokens, outputTokens);

  // Atomic deduction via RPC
  const { data, error } = await supabase.rpc("deduct_credits", {
    p_user_id: userId,
    p_amount: cost,
  });

  if (error) {
    console.error("Credit deduction RPC error:", error);
    // Fallback: fetch current balance
    const { balance } = await getOrCreateCredits(userId);
    return { success: false, balance, cost };
  }

  const newBalance = Number(data);

  if (newBalance === -1) {
    // Insufficient funds
    const { balance } = await getOrCreateCredits(userId);
    return { success: false, balance, cost };
  }

  // Log spend transaction (fire-and-forget)
  Promise.resolve(
    supabase.from("credit_transactions").insert({
      user_id: userId,
      amount: -cost,
      type: "spend",
      description: `${endpoint}: ${inputTokens} in / ${outputTokens} out tokens`,
      session_id: sessionId,
    })
  ).catch(() => {});

  // Record token usage with cost (fire-and-forget)
  Promise.resolve(
    supabase.from("token_usage").insert({
      user_id: userId,
      session_id: sessionId,
      endpoint,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      model: "claude-sonnet-4-6",
      credits_cost: cost,
    })
  ).catch(() => {});

  return { success: true, balance: newBalance, cost };
}

export async function addCredits(
  userId: string,
  amount: number,
  stripeSessionId: string
): Promise<void> {
  const supabase = getSupabase();

  // Idempotency check
  const { data: existing } = await supabase
    .from("credit_transactions")
    .select("id")
    .eq("stripe_session_id", stripeSessionId)
    .single();

  if (existing) return; // Already processed

  // Ensure user_credits row exists
  await getOrCreateCredits(userId);

  // Increment balance
  const { data } = await supabase
    .from("user_credits")
    .select("balance")
    .eq("user_id", userId)
    .single();

  await supabase
    .from("user_credits")
    .update({
      balance: (Number(data?.balance) ?? 0) + amount,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  // Log purchase transaction
  await supabase.from("credit_transactions").insert({
    user_id: userId,
    amount,
    type: "purchase",
    description: `${amount} credit pack`,
    stripe_session_id: stripeSessionId,
  });
}

export async function recordTokenUsage(
  userId: string,
  sessionId: string | null,
  endpoint: string,
  inputTokens: number,
  outputTokens: number,
  model: string,
  creditsCost?: number
): Promise<void> {
  const supabase = getSupabase();
  await supabase.from("token_usage").insert({
    user_id: userId,
    session_id: sessionId,
    endpoint,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    model,
    credits_cost: creditsCost ?? 0,
  });
}
