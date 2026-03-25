import Stripe from "stripe";

let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("Missing STRIPE_SECRET_KEY");
    }
    client = new Stripe(key);
  }
  return client;
}

export const CREDIT_PACKS = [
  {
    id: "pack_5",
    name: "5 Credits",
    credits: 5,
    price: 1000, // $10.00 in cents
    priceId: process.env.STRIPE_PRICE_5_CREDITS || "",
  },
  {
    id: "pack_20",
    name: "20 Credits",
    credits: 20,
    price: 3000, // $30.00 in cents
    priceId: process.env.STRIPE_PRICE_20_CREDITS || "",
  },
];
