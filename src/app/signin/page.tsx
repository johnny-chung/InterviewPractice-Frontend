"use client";
import React from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <p>Please Sign In</p>
      <Button
        variant="outline"
        onClick={() => signIn("auth0", { redirectTo: "/" })}
      >
        Sign In with Auth0
      </Button>
    </div>
  );
}
