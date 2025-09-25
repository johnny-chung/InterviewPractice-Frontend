"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { JobSummary } from "../data";

type Props = {
  items: JobSummary[];
  selectedId: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  ready: "Ready",
  queued: "Queued",
  processing: "Processing",
  error: "Error",
};

export function JobList({ items, selectedId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No job descriptions submitted yet.
        </CardContent>
      </Card>
    );
  }

  const handleSelect = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("job", id);
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
                {item.title ?? "Untitled job"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(item.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <Badge variant="secondary">
              {STATUS_LABEL[item.status] ?? item.status}
            </Badge>
          </div>
        </button>
      ))}
    </div>
  );
}
