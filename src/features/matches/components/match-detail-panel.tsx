"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { MatchDetail } from "../data";
import { format } from "date-fns";

type Props = {
  match?: MatchDetail;
};

export function MatchDetailPanel({ match }: Props) {
  if (!match) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Select a match request to inspect the score and gap analysis.
        </CardContent>
      </Card>
    );
  }

  if (match.error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{match.error}</AlertDescription>
      </Alert>
    );
  }

  if (!match.result) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Match status: {match.status}. Check back when processing completes.
        </CardContent>
      </Card>
    );
  }

  const chartData = match.result.rawDetails.map((item) => ({
    requirement: item.requirement ?? "Unknown",
    importance: item.importance ?? 0,
    similarity: Number(item.similarity?.toFixed(2) ?? 0),
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>Match score</CardTitle>
            <CardDescription>
              Completed {format(new Date(match.result.completedAt), "PPpp")}
            </CardDescription>
          </div>
          <Badge className="text-lg leading-none">{match.result.score.toFixed(2)}</Badge>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          {match.result.candidate ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <span className="font-semibold text-foreground">Candidate:</span> {match.result.candidate.name ?? "n/a"}
              </div>
              <div>
                <span className="font-semibold text-foreground">Experience:</span>{" "}
                {match.result.candidate.experienceYears != null
                  ? `${match.result.candidate.experienceYears} years`
                  : "n/a"}
              </div>
              <div className="sm:col-span-2">
                <span className="font-semibold text-foreground">Skills: </span>
                {match.result.candidate.skills.length > 0
                  ? match.result.candidate.skills.join(", ")
                  : "No skills captured"}
              </div>
            </div>
          ) : (
            <p>No candidate profile available.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requirement coverage</CardTitle>
          <CardDescription>Compare requirement importance against candidate similarity.</CardDescription>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis dataKey="requirement" hide />
              <YAxis domain={[0, 1]} tickFormatter={(value) => `${Math.round(value * 100)}%`} />
              <Tooltip
                formatter={(value: number) => `${Math.round(value * 100)}%`}
                labelFormatter={(label) => `Requirement: ${label}`}
              />
              <Bar dataKey="importance" fill="hsl(var(--secondary))" name="Importance" />
              <Bar dataKey="similarity" fill="hsl(var(--primary))" name="Similarity" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Strengths & gaps</CardTitle>
          <CardDescription>Summaries provided by the matching engine.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Strengths</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {match.result.strengths.length > 0 ? (
                match.result.strengths.map((item, index) => <li key={index}>{typeof item === "string" ? item : JSON.stringify(item)}</li>)
              ) : (
                <li>No strengths captured.</li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Gaps</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {match.result.gaps.length > 0 ? (
                match.result.gaps.map((item, index) => <li key={index}>{typeof item === "string" ? item : JSON.stringify(item)}</li>)
              ) : (
                <li>No notable gaps.</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requirement table</CardTitle>
          <CardDescription>Detailed per requirement breakdown with similarity scores.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requirement</TableHead>
                <TableHead>Importance</TableHead>
                <TableHead>Similarity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {match.result.requirements.map((req, index) => (
                <TableRow key={index}>
                  <TableCell>{req.requirement ?? "Unknown"}</TableCell>
                  <TableCell>{req.importance != null ? req.importance.toFixed(2) : "-"}</TableCell>
                  <TableCell>{req.similarity.toFixed(2)}</TableCell>
                  <TableCell>{req.candidateHasExperience ? `Matched (${req.matchedSkill ?? ""})` : "Gap"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

