"use client";
import React from "react";

interface SoftSkillItem {
  skill: string;
  value?: number | null;
  importance?: number | null;
}

export function SoftSkillsList({ skills }: { skills?: SoftSkillItem[] }) {
  if (!skills || skills.length === 0) {
    return null;
  }
  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold mb-2">Soft Skills (O*NET)</h3>
      <ul className="space-y-1 text-sm list-disc list-inside">
        {skills.map((s) => (
          <li key={s.skill} className="flex justify-between gap-2">
            <span>{s.skill}</span>
            {s.value != null && (
              <span className="text-muted-foreground tabular-nums">
                {(s.value * 100).toFixed(0)}%
              </span>
            )}
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground mt-2">
        Display-only soft skills derived from O*NET occupation profile
        (importance &gt; 50%). Not used in matching score.
      </p>
    </div>
  );
}
