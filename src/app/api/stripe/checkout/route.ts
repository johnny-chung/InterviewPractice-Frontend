import { NextResponse } from "next/server";

import { stripe } from "@/services/stripe";

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
  }
  const body = await request.json();
  const successUrl = body?.successUrl ?? process.env.STRIPE_SUCCESS_URL;
  const cancelUrl = body?.cancelUrl ?? process.env.STRIPE_CANCEL_URL;
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId || !successUrl || !cancelUrl) {
    return NextResponse.json({ error: "Missing Stripe configuration" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return NextResponse.json({ url: session.url });
}
