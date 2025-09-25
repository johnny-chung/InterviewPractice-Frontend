"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { MatchJobSummary } from "../data";

type Props = {
  items: MatchJobSummary[];
  selectedId: string | null;
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive"> =
  {
    completed: "default",
    queued: "secondary",
    running: "secondary",
    failed: "destructive",
  };

export function MatchList({ items, selectedId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No match requests yet.
        </CardContent>
      </Card>
    );
  }

  const handleSelect = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("match", id);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => handleSelect(item.id)}
          className={cn(
            "w-full rounded-lg border border-border bg-card px-4 py-3 text-left shadow-sm transition hover:border-primary",
            selectedId === item.id ? "border-primary bg-primary/5" : undefined
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">
                {item.resumeId.slice(0, 8)} ? {item.jobId.slice(0, 8)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(item.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <Badge variant={STATUS_VARIANTS[item.status] ?? "secondary"}>
              {item.status}
            </Badge>
          </div>
          {item.errorMessage ? (
            <p className="mt-2 text-xs text-destructive">{item.errorMessage}</p>
          ) : null}
        </button>
      ))}
    </div>
  );
}
