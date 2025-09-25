"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ResumeSummary } from "../data";

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

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => {
        const status = STATUS_STYLES[item.status] ?? {
          label: item.status,
          variant: "secondary",
        };
        return (
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
                  {item.filename ?? "Untitled resume"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(item.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
          </button>
        );
      })}
    </div>
  );
}
