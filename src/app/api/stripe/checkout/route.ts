import { stripe } from "@/services/stripe/stripe-srv";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 500 }
    );
  }
  const body = await request.json();
  const successUrl = body?.successUrl ?? process.env.STRIPE_SUCCESS_URL;
  const cancelUrl = body?.cancelUrl ?? process.env.STRIPE_CANCEL_URL;
  if (!successUrl || !cancelUrl) {
    return NextResponse.json(
      { error: "Missing Stripe configuration" },
      { status: 400 }
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price_data: {
          currency: "cad",
          product_data: {
            name: "subscription",
          },
          unit_amount: Math.round(5 * 100), // amount
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return NextResponse.json({ url: session.url });
}
