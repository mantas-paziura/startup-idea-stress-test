import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getStripe, CREDIT_PACKS } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { packId } = await request.json();

    // Validate packId against known packs
    const pack = CREDIT_PACKS.find((p) => p.id === packId);
    if (!pack || !pack.priceId) {
      return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
    }

    const stripe = getStripe();
    const origin = request.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: pack.priceId, quantity: 1 }],
      metadata: {
        userId,
        creditAmount: String(pack.credits),
      },
      success_url: `${origin}/credits?success=true`,
      cancel_url: `${origin}/credits`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
