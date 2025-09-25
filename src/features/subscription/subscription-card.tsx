"use client";

import { useSession } from "next-auth/react";
import { useState, useTransition } from "react";

import { createCheckoutSession } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SubscriptionCard() {
  const { data: session } = useSession();
  const proMember = session?.user?.proMember ?? false;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await createCheckoutSession();
        if (result?.url) {
          window.location.href = result.url as string;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to start checkout");
      }
    });
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>
          {proMember
            ? "You are on the Pro plan with expanded upload and analysis limits."
            : "Upgrade to Pro for higher daily limits and deeper AI breakdowns."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">Current plan</p>
          <p className="text-sm text-muted-foreground">{proMember ? "Pro" : "Free"}</p>
        </div>
        {proMember ? (
          <Button variant="secondary" disabled>
            Active
          </Button>
        ) : (
          <Button onClick={handleUpgrade} disabled={pending}>
            {pending ? "Redirecting..." : "Upgrade to Pro"}
          </Button>
        )}
        {error ? (
          <Alert variant="destructive" className="w-full">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
