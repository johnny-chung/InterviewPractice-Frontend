// Server component: all data fetching moved here using search params.
import { Alert, AlertDescription } from "@/components/ui/alert";
import { JobListRealtime } from "@/features/jobs/components/job-list-realtime";
import { JobSubmissionCard } from "@/features/jobs/components/job-submission-card";
import { getJobs, type JobSummary } from "@/features/jobs/data";
import { ResumeSectionRealtime } from "@/features/resumes/components/resume-detail-realtime";
import { MatchRequestCard } from "@/features/matches/components/match-request-card";
import { getMatchJobs, type MatchJobSummary } from "@/features/matches/data";
import { ResumeUploadCard } from "@/features/resumes/components/resume-upload-card";
import { getResumes, type ResumeSummary } from "@/features/resumes/data";
import { SubscriptionCard } from "@/features/subscription/subscription-card";
import { Suspense } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { ResumeDetailFetcher } from "@/features/resumes/components/resume-detail-server";
import { JobDetailFetcher } from "@/features/jobs/components/job-detail-server";
import { MatchDetailFetcher } from "@/features/matches/components/match-detail-server";
import { MatchSectionRealtime } from "@/features/matches/components/match-detail-realtime";

interface DashboardShellProps {
  token?: string;
  searchParams: Record<string, string | string[]>;
}

export async function DashboardShell({
  token,
  searchParams,
}: DashboardShellProps) {
  let resumeError: string | null = null;
  let jobError: string | null = null;
  let matchError: string | null = null;

  let resumes: ResumeSummary[] = [];
  let jobs: JobSummary[] = [];
  let matches: MatchJobSummary[] = [];

  try {
    [resumes, jobs, matches] = await Promise.all([
      getResumes(token).catch((e) => {
        resumeError = e instanceof Error ? e.message : "Failed to load resumes";
        return [];
      }),
      getJobs(token).catch((e) => {
        jobError = e instanceof Error ? e.message : "Failed to load jobs";
        return [];
      }),
      getMatchJobs(token).catch((e) => {
        matchError = e instanceof Error ? e.message : "Failed to load matches";
        return [];
      }),
    ]);
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to load dashboard data";
    resumeError = resumeError ?? message;
    jobError = jobError ?? message;
    matchError = matchError ?? message;
  }

  const resumeParam =
    typeof searchParams.resume === "string"
      ? searchParams.resume
      : Array.isArray(searchParams.resume)
      ? searchParams.resume[0]
      : undefined;
  const jobParam =
    typeof searchParams.job === "string"
      ? searchParams.job
      : Array.isArray(searchParams.job)
      ? searchParams.job[0]
      : undefined;
  const matchParam =
    typeof searchParams.match === "string"
      ? searchParams.match
      : Array.isArray(searchParams.match)
      ? searchParams.match[0]
      : undefined;

  const resumeNotFound =
    !!resumeParam && !resumes.some((r) => r.id === resumeParam);
  const jobNotFound = !!jobParam && !jobs.some((j) => j.id === jobParam);
  const matchNotFound =
    !!matchParam && !matches.some((m) => m.id === matchParam);

  const selectedResumeId = resumeNotFound
    ? null
    : resumeParam || resumes[0]?.id || null;
  const selectedJobId = jobNotFound ? null : jobParam || jobs[0]?.id || null;
  const selectedMatchId = matchNotFound
    ? null
    : matchParam || matches[0]?.id || null;

  return (
    <div className="space-y-8">
      <SubscriptionCard />
      <Accordion
        type="multiple"
        defaultValue={["resumes", "jobs", "matches"]}
        className="space-y-6"
      >
        <AccordionItem value="resumes" className="border rounded-md">
          <AccordionTrigger className="px-4 py-2 text-left">
            <span className="font-medium">Resumes</span>
          </AccordionTrigger>
          <AccordionContent className="px-2 pb-4 pt-0">
            <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <div className="space-y-4">
                <ResumeUploadCard />
                <ResumeSectionRealtime
                  resumeId={selectedResumeId}
                  token={token}
                  initialList={resumes}
                  initialDetail={undefined}
                />
              </div>
              <div className="space-y-4">
                {resumeError ? (
                  <Alert variant="destructive">
                    <AlertDescription>{resumeError}</AlertDescription>
                  </Alert>
                ) : null}
                {resumeNotFound ? (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Resume not found (id: {resumeParam})
                    </AlertDescription>
                  </Alert>
                ) : null}
                <Suspense
                  fallback={
                    <p className="text-sm text-muted-foreground">
                      Loading resume…
                    </p>
                  }
                >
                  <ResumeDetailFetcher
                    id={selectedResumeId}
                    token={token}
                    disabled={!!resumeError}
                  />
                </Suspense>
              </div>
            </section>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="jobs" className="border rounded-md">
          <AccordionTrigger className="px-4 py-2 text-left">
            <span className="font-medium">Jobs</span>
          </AccordionTrigger>
          <AccordionContent className="px-2 pb-4 pt-0">
            <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <div className="space-y-4">
                <JobSubmissionCard />
                <JobListRealtime
                  initialItems={jobs}
                  selectedId={selectedJobId}
                  token={token}
                />
              </div>
              <div className="space-y-4">
                {jobError ? (
                  <Alert variant="destructive">
                    <AlertDescription>{jobError}</AlertDescription>
                  </Alert>
                ) : null}
                {jobNotFound ? (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Job not found (id: {jobParam})
                    </AlertDescription>
                  </Alert>
                ) : null}
                <Suspense
                  fallback={
                    <p className="text-sm text-muted-foreground">
                      Loading job…
                    </p>
                  }
                >
                  <JobDetailFetcher
                    id={selectedJobId}
                    token={token}
                    disabled={!!jobError}
                  />
                </Suspense>
              </div>
            </section>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="matches" className="border rounded-md">
          <AccordionTrigger className="px-4 py-2 text-left">
            <span className="font-medium">Match Queries</span>
          </AccordionTrigger>
          <AccordionContent className="px-2 pb-4 pt-0">
            <section className="space-y-4">
              <MatchRequestCard
                resumes={resumes}
                jobs={jobs}
                matches={matches}
              />
              <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)]">
                <div>
                  <MatchSectionRealtime
                    matchId={selectedMatchId}
                    token={token}
                    initialList={matches}
                    initialDetail={undefined}
                  />
                </div>
                <div className="space-y-4">
                  {matchError ? (
                    <Alert variant="destructive">
                      <AlertDescription>{matchError}</AlertDescription>
                    </Alert>
                  ) : null}
                  {matchNotFound ? (
                    <Alert variant="destructive">
                      <AlertDescription>
                        Match request not found (id: {matchParam})
                      </AlertDescription>
                    </Alert>
                  ) : null}
                  <Suspense
                    fallback={
                      <p className="text-sm text-muted-foreground">
                        Loading match…
                      </p>
                    }
                  >
                    <MatchDetailFetcher
                      id={selectedMatchId}
                      token={token}
                      disabled={!!matchError}
                    />
                  </Suspense>
                </div>
              </div>
            </section>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
