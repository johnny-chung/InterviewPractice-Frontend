"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ResumeSummary } from "../data";
import { deleteResume } from "../data";

const STATUS_STYLES: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  ready: { label: "Ready", variant: "default" },
  queued: { label: "Queued", variant: "secondary" },
  processing: { label: "Processing", variant: "secondary" },
  error: { label: "Error", variant: "destructive" },
};

type Props = {
  items: ResumeSummary[];
  selectedId: string | null;
};

export function ResumeList({ items, selectedId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No resumes uploaded yet.
        </CardContent>
      </Card>
    );
  }

  const handleSelect = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("resume", id);
    router.push(`?${params.toString()}`, { scroll: false });
  };

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
        const status = STATUS_STYLES[item.status] ?? {
          label: item.status,
          variant: "secondary",
        };
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
                    {item.filename ?? "Untitled resume"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <Badge variant={status.variant} className="shrink-0">
                  {isDeleting ? "Deleting" : status.label}
                </Badge>
              </div>
            </button>
            <button
              type="button"
              aria-label="Delete resume"
              onClick={async (e) => {
                e.stopPropagation();
                if (isDeleting) return;
                if (!confirm("Delete this resume?")) return;
                setDeletingIds((prev) => new Set(prev).add(item.id));
                try {
                  await deleteResume(item.id);
                  if (selectedId === item.id) {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("resume");
                    router.push(`?${params.toString()}`, { scroll: false });
                  }
                } catch (err) {
                  console.error("Failed to delete resume", err);
                  alert("Failed to delete resume");
                  setDeletingIds((prev) => {
                    const clone = new Set(prev);
                    clone.delete(item.id);
                    return clone;
                  });
                  return;
                }
                const evt = new CustomEvent("resumes:deleted", {
                  detail: { id: item.id },
                });
                window.dispatchEvent(evt);
              }}
              className="absolute right-2 top-2 hidden rounded px-2 py-1 text-xs text-destructive hover:bg-destructive/10 group-hover:block"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
