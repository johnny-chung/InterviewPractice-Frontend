import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

import type { JobDetail } from "../data";

type Props = {
  job?: JobDetail;
};

export function JobDetailPanel({ job }: Props) {
  if (!job) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Select a job to review requirement extraction.
        </CardContent>
      </Card>
    );
  }

  const highlights = job.parsedData?.highlights ?? [];
  const overviewText = job.parsedData?.overview ?? null;
  const overviewEntries = job.parsedData?.overviewEntries ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>{job.title ?? "Untitled job"}</CardTitle>
            <CardDescription>
              Submitted {format(new Date(job.createdAt), "PPpp")} · Source:{" "}
              {job.source ?? "n/a"}
            </CardDescription>
          </div>
          <Badge variant="secondary">{job.status}</Badge>
        </CardHeader>
        <CardContent>
          {overviewText ? (
            <p className="text-sm text-muted-foreground">{overviewText}</p>
          ) : overviewEntries.length > 0 ? (
            <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
              {overviewEntries.map((entry, idx) => (
                <li key={idx}>
                  <span className="font-medium text-foreground">
                    {entry.label}:
                  </span>{" "}
                  {entry.value}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Parsing is still running. Overview appears when finished.
            </p>
          )}
        </CardContent>
      </Card>

      {highlights.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Highlights</CardTitle>
            <CardDescription>
              Key requirements identified in the description.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-4 text-sm text-muted-foreground">
              {highlights.map((item, index) => (
                <li key={index}>
                  {typeof item === "string" ? item : JSON.stringify(item)}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Requirements</CardTitle>
          <CardDescription>
            {job.requirements.length > 0
              ? "Sorted by importance to highlight explicit vs inferred skills."
              : "No requirements parsed yet."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {job.requirements.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Requirements will appear when parsing completes.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Skill</TableHead>
                  <TableHead>Importance</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {job.requirements.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.skill}</TableCell>
                    <TableCell>
                      {req.importance != null ? req.importance.toFixed(2) : "-"}
                    </TableCell>
                    <TableCell>
                      {req.inferred ? "Inferred" : "Explicit"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {job.parsedData?.onet ? (
        <Card>
          <CardHeader>
            <CardTitle>O*NET insights</CardTitle>
            <CardDescription>
              Summary of inferred competencies sourced from O*NET.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="max-h-52 overflow-auto whitespace-pre-wrap rounded-lg bg-muted/50 p-4 text-xs">
              {JSON.stringify(job.parsedData.onet, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
