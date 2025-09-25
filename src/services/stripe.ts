// Module: stripe
// Purpose: Exposes a configured Stripe SDK instance (or null if key missing) for server-side billing flows.
// Environment Variable: STRIPE_SECRET_KEY must be set for the instance to be created.
// Note: Only safe to use on the server (never ship secret key to browser). Frontend should call API routes that use this instance.
import Stripe from "stripe";

const apiKey = process.env.STRIPE_SECRET_KEY;

/**
 * Stripe instance configured with pinned API version.
 * Value: Stripe object when STRIPE_SECRET_KEY is present; otherwise null enabling guards in call sites.
 */
export const stripe = apiKey
  ? new Stripe(apiKey, {
      apiVersion: "2025-08-27.basil", // Pinned to avoid breaking changes silently.
    })
  : null;
