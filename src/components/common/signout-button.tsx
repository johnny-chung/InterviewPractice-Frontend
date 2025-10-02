"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface SignOutButtonProps {
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  label?: string;
  callbackUrl?: string;
}

export function SignOutButton({
  className,
  variant = "ghost",
  size = "sm",
  label = "Sign out",
  callbackUrl = "/",
}: SignOutButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      // Ensure pointer cursor & subtle hover emphasis even in ghost variant
      className={["cursor-pointer hover:bg-accent/70", className]
        .filter(Boolean)
        .join(" ")}
      onClick={() => signOut({ redirectTo: callbackUrl })}
    >
      <LogOut className="size-4" />
      <span>{label}</span>
    </Button>
  );
}
