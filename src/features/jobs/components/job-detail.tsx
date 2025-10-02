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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

  // Highlights removed per new spec.
  const overviewText = job.parsedData?.overview ?? null;
  const overviewEntries = job.parsedData?.overviewEntries ?? [];

  // Derive categories: explicit requirements, inferred (nice to have), soft skills
  const explicitRequirements = job.requirements.filter((r) => !r.inferred);
  const inferredRequirements = job.requirements.filter((r) => r.inferred);
  const softSkills = job.softSkills || [];

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

      <Accordion
        type="multiple"
        defaultValue={["requirements"]}
        className="space-y-4"
      >
        <AccordionItem value="requirements">
          <Card className="border">
            <CardHeader className="space-y-0">
              <AccordionTrigger className="py-0">
                <div className="flex flex-col items-start text-left">
                  <CardTitle className="text-base">Requirements</CardTitle>
                  <CardDescription>
                    Explicit skills extracted directly from the description.
                  </CardDescription>
                </div>
              </AccordionTrigger>
            </CardHeader>
            <AccordionContent>
              <CardContent className="pt-0">
                {explicitRequirements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No explicit requirements parsed yet.
                  </p>
                ) : (
                  <div
                    className={
                      explicitRequirements.length > 12
                        ? "max-h-[520px] overflow-y-auto pr-1"
                        : undefined
                    }
                    data-scroll={
                      explicitRequirements.length > 12 ? "true" : "false"
                    }
                  >
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Skill</TableHead>
                          <TableHead>Importance</TableHead>
                          {/* Source hidden per spec */}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {explicitRequirements.map((req) => (
                          <TableRow key={req.id}>
                            <TableCell className="font-medium">
                              {req.skill}
                            </TableCell>
                            <TableCell>
                              {req.importance != null
                                ? req.importance.toFixed(2)
                                : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>

        <AccordionItem value="nice-to-have">
          <Card className="border">
            <CardHeader className="space-y-0">
              <AccordionTrigger className="py-0">
                <div className="flex flex-col items-start text-left">
                  <CardTitle className="text-base">Nice to Have</CardTitle>
                  <CardDescription>
                    Inferred additional skills (importance hidden).
                  </CardDescription>
                </div>
              </AccordionTrigger>
            </CardHeader>
            <AccordionContent>
              <CardContent className="pt-0">
                {inferredRequirements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No inferred skills above threshold.
                  </p>
                ) : (
                  <div
                    className={
                      inferredRequirements.length > 12
                        ? "max-h-[520px] overflow-y-auto pr-1"
                        : undefined
                    }
                    data-scroll={
                      inferredRequirements.length > 12 ? "true" : "false"
                    }
                  >
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Skill</TableHead>
                          {/* Importance & Source hidden */}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inferredRequirements.map((req) => (
                          <TableRow key={req.id}>
                            <TableCell className="font-medium">
                              {req.skill}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>

        <AccordionItem value="soft-skills">
          <Card className="border">
            <CardHeader className="space-y-0">
              <AccordionTrigger className="py-0">
                <div className="flex flex-col items-start text-left">
                  <CardTitle className="text-base">Soft Skills</CardTitle>
                  <CardDescription>
                    Interpersonal or cognitive competencies.
                  </CardDescription>
                </div>
              </AccordionTrigger>
            </CardHeader>
            <AccordionContent>
              <CardContent className="pt-0">
                {softSkills.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No soft skills extracted yet.
                  </p>
                ) : (
                  <div
                    className={
                      softSkills.length > 12
                        ? "max-h-[520px] overflow-y-auto pr-1"
                        : undefined
                    }
                    data-scroll={softSkills.length > 12 ? "true" : "false"}
                  >
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Skill</TableHead>
                          <TableHead>Score</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {softSkills.map((s, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">
                              {s.skill}
                            </TableCell>
                            <TableCell>
                              {s.importance != null
                                ? s.importance.toFixed(2)
                                : s.value != null
                                ? s.value?.toString()
                                : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
