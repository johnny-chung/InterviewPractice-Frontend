import type { JobDetail } from "../types/api";
import { formatDateTime, formatStatus } from "../utils/format";
import { StatusBadge } from "./StatusBadge";

type Props = {
  job?: JobDetail;
  isLoading: boolean;
};

export function JobDetail({ job, isLoading }: Props) {
  if (isLoading) {
    return <p className="empty-state">Loading job...</p>;
  }
  if (!job) {
    return <p className="empty-state">Select a job to see details.</p>;
  }

  const summary = job.parsedData;
  const highlights = Array.isArray(summary?.highlights)
    ? summary?.highlights
    : summary?.highlights
    ? [summary.highlights as string]
    : [];

  return (
    <div className="detail">
      <div className="detail-header">
        <div>
          <h3 className="detail-title">{job.title ?? "Untitled job"}</h3>
          <p className="detail-meta">Submitted {formatDateTime(job.createdAt)}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      {job.status !== "ready" ? (
        <p className="detail-alert">
          Parsing is {formatStatus(job.status)}. Requirement list updates once parsing finishes.
        </p>
      ) : null}

      {summary?.overview ? (
        <div className="detail-card">
          <h4>Overview</h4>
          <p className="detail-text">{summary.overview}</p>
        </div>
      ) : null}

      {highlights.length > 0 ? (
        <div className="detail-card">
          <h4>Highlights</h4>
          <ul className="bullet-list">
            {highlights.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="detail-card">
        <h4>Requirements ({job.requirements.length})</h4>
        {job.requirements.length === 0 ? (
          <p className="empty-state">Requirements will appear after parsing completes.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Skill</th>
                <th>Importance</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {job.requirements.map((req) => (
                <tr key={req.id}>
                  <td>{req.skill}</td>
                  <td>{req.importance !== null && req.importance !== undefined ? req.importance.toFixed(2) : "-"}</td>
                  <td>{req.inferred ? "Inferred" : "Explicit"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
