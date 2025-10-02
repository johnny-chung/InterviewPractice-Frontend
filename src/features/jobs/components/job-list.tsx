"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { JobSummary } from "../data";
import { deleteJob } from "../data";

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
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

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

  // Approx card height ~ (py-3 + text + margins) -> empirically ~82-90px; use max-h to show about 5.
  const scrollNeeded = items.length > 5;
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        scrollNeeded && "max-h-[460px] overflow-y-auto pr-1"
      )}
      data-scroll={scrollNeeded ? "true" : "false"}
    >
      {items.map((item) => {
        const isDeleting = deletingIds.has(item.id);
        return (
          <div key={item.id} className="group relative">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => handleSelect(item.id)}
              className={cn(
                "w-full rounded-lg border border-border bg-card px-4 py-3 text-left shadow-sm transition hover:border-primary disabled:opacity-50",
                selectedId === item.id
                  ? "border-primary bg-primary/5"
                  : undefined
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">
                    {item.title ?? "Untitled job"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {isDeleting
                    ? "Deleting"
                    : STATUS_LABEL[item.status] ?? item.status}
                </Badge>
              </div>
            </button>
            {
              <button
                type="button"
                aria-label="Delete job"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (isDeleting) return;
                  if (!confirm("Delete this job?")) return;
                  setDeletingIds((prev) => new Set(prev).add(item.id));
                  try {
                    await deleteJob(item.id);
                    // Optimistic removal via URL param reset if currently selected
                    if (selectedId === item.id) {
                      const params = new URLSearchParams(
                        searchParams.toString()
                      );
                      params.delete("job");
                      router.push(`?${params.toString()}`, { scroll: false });
                    }
                  } catch (err) {
                    console.error("Failed to delete job", err);
                    alert("Failed to delete job");
                    setDeletingIds((prev) => {
                      const clone = new Set(prev);
                      clone.delete(item.id);
                      return clone;
                    });
                    return;
                  }
                  // Remove item from list
                  const evt = new CustomEvent("jobs:deleted", {
                    detail: { id: item.id },
                  });
                  window.dispatchEvent(evt);
                }}
                className="absolute right-2 top-2 hidden rounded px-2 py-1 text-xs text-destructive hover:bg-destructive/10 group-hover:block"
              >
                ✕
              </button>
            }
          </div>
        );
      })}
    </div>
  );
}
