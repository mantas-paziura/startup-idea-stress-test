import { getSupabase } from "./supabase";

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
    return { balance: data.balance };
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
    if (existing) return { balance: existing.balance };
    throw error;
  }

  // Log free tier transaction
  await supabase.from("credit_transactions").insert({
    user_id: userId,
    amount: 2,
    type: "free_tier",
    description: "Free tier credits",
  });

  return { balance: newRow.balance };
}

export async function deductCredit(
  userId: string,
  sessionId: string
): Promise<{ success: boolean; balance: number }> {
  const supabase = getSupabase();

  // Check current balance
  const { data } = await supabase
    .from("user_credits")
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (!data || data.balance <= 0) {
    return { success: false, balance: data?.balance ?? 0 };
  }

  // Decrement balance
  const newBalance = data.balance - 1;
  await supabase
    .from("user_credits")
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  // Log spend transaction
  await supabase.from("credit_transactions").insert({
    user_id: userId,
    amount: -1,
    type: "spend",
    description: "Interview session",
    session_id: sessionId,
  });

  return { success: true, balance: newBalance };
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
      balance: (data?.balance ?? 0) + amount,
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
  model: string
): Promise<void> {
  const supabase = getSupabase();
  await supabase.from("token_usage").insert({
    user_id: userId,
    session_id: sessionId,
    endpoint,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    model,
  });
}
