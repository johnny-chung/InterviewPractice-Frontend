// Module: subscription/actions
// Purpose: Server Action to initiate a Stripe Checkout session via internal API route.
// Flow: derive base URL -> POST to /api/stripe/checkout with success & cancel URLs -> return JSON session data.
// Error Handling: Throws Error with response text if non-200 to surface backend issues to caller.
"use server";

/**
 * Create a Stripe checkout session for upgrading / purchasing subscription.
 * @returns Parsed JSON body from /api/stripe/checkout (expected to contain e.g. session id / url).
 * @throws Error when backend route returns non-ok status.
 */
export async function createCheckoutSession() {
  const baseUrl =
    process.env.APP_BASE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/stripe/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      successUrl: `${baseUrl}/dashboard?checkout=success`,
      cancelUrl: `${baseUrl}/dashboard`,
    }),
    cache: "no-store",
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to create checkout session");
  }
  return response.json();
}
