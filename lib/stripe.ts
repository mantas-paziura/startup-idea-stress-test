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
    id: "pack_10",
    name: "10 Credits",
    credits: 10,
    price: 100, // $1.00 in cents
    priceId: process.env.STRIPE_PRICE_10_CREDITS || "",
  },
  {
    id: "pack_50",
    name: "50 Credits",
    credits: 50,
    price: 500, // $5.00 in cents
    priceId: process.env.STRIPE_PRICE_50_CREDITS || "",
  },
  {
    id: "pack_200",
    name: "200 Credits",
    credits: 200,
    price: 1500, // $15.00 in cents
    priceId: process.env.STRIPE_PRICE_200_CREDITS || "",
  },
];
