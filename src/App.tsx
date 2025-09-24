import { useEffect, useState } from "react";

import { useJobDetail, useJobs } from "./hooks/useJobs";
import { useMatchDetail, useMatchJobs } from "./hooks/useMatches";
import { useResumeDetail, useResumes } from "./hooks/useResumes";
import { MatchDetail } from "./components/MatchDetail";
import { MatchList } from "./components/MatchList";
import { MatchRequestForm } from "./components/MatchRequestForm";
import { Panel } from "./components/Panel";
import { JobDetail } from "./components/JobDetail";
import { JobForm } from "./components/JobForm";
import { JobList } from "./components/JobList";
import { ResumeDetail } from "./components/ResumeDetail";
import { ResumeList } from "./components/ResumeList";
import { ResumeUploadForm } from "./components/ResumeUploadForm";

export default function App() {
  const resumesQuery = useResumes();
  const jobsQuery = useJobs();
  const matchesQuery = useMatchJobs();

  const resumes = resumesQuery.data ?? [];
  const jobs = jobsQuery.data ?? [];
  const matches = matchesQuery.data ?? [];

  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  useEffect(() => {
    if (resumes.length === 0) {
      setSelectedResumeId(null);
      return;
    }
    if (!selectedResumeId || !resumes.find((item) => item.id === selectedResumeId)) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes, selectedResumeId]);

  useEffect(() => {
    if (jobs.length === 0) {
      setSelectedJobId(null);
      return;
    }
    if (!selectedJobId || !jobs.find((item) => item.id === selectedJobId)) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs, selectedJobId]);

  useEffect(() => {
    if (matches.length === 0) {
      setSelectedMatchId(null);
      return;
    }
    if (!selectedMatchId || !matches.find((item) => item.id === selectedMatchId)) {
      setSelectedMatchId(matches[0].id);
    }
  }, [matches, selectedMatchId]);

  const resumeDetailQuery = useResumeDetail(selectedResumeId);
  const jobDetailQuery = useJobDetail(selectedJobId);
  const matchDetailQuery = useMatchDetail(selectedMatchId);

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Layer1 Ops Console</h1>
          <p className="app-subtitle">Upload resumes and jobs, then review match insights.</p>
        </div>
        <span className="api-base">API: {import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api/v1"}</span>
      </header>
      <main className="app-main">
        <div className="grid">
          <Panel title="Resumes" subtitle="Upload files and review parsed output" actions={null}>
            <ResumeUploadForm />
            <div className="split">
              <div className="split-list">
                {resumesQuery.isLoading ? (
                  <p className="empty-state">Loading resumes...</p>
                ) : (
                  <ResumeList
                    items={resumes}
                    selectedId={selectedResumeId}
                    onSelect={setSelectedResumeId}
                  />
                )}
              </div>
              <div className="split-detail">
                <ResumeDetail
                  resume={resumeDetailQuery.data}
                  isLoading={resumeDetailQuery.isLoading || resumeDetailQuery.isFetching}
                />
              </div>
            </div>
          </Panel>

          <Panel title="Jobs" subtitle="Submit postings for requirement extraction" actions={null}>
            <JobForm />
            <div className="split">
              <div className="split-list">
                {jobsQuery.isLoading ? (
                  <p className="empty-state">Loading jobs...</p>
                ) : (
                  <JobList items={jobs} selectedId={selectedJobId} onSelect={setSelectedJobId} />
                )}
              </div>
              <div className="split-detail">
                <JobDetail
                  job={jobDetailQuery.data}
                  isLoading={jobDetailQuery.isLoading || jobDetailQuery.isFetching}
                />
              </div>
            </div>
          </Panel>
        </div>

        <Panel
          title="Matches"
          subtitle="Pair ready resumes and jobs to compute fit scores"
          actions={<MatchRequestForm resumes={resumes} jobs={jobs} />}
        >
          <div className="split">
            <div className="split-list">
              {matchesQuery.isLoading ? (
                <p className="empty-state">Loading match requests...</p>
              ) : (
                <MatchList items={matches} selectedId={selectedMatchId} onSelect={setSelectedMatchId} />
              )}
            </div>
            <div className="split-detail">
              <MatchDetail
                match={matchDetailQuery.data}
                isLoading={matchDetailQuery.isLoading || matchDetailQuery.isFetching}
              />
            </div>
          </div>
        </Panel>
      </main>
    </div>
  );
}
