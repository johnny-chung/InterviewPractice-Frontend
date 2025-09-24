import type { MatchDetailResponse } from "../types/api";
import { formatDateTime, formatStatus } from "../utils/format";
import { StatusBadge } from "./StatusBadge";

type Props = {
  match?: MatchDetailResponse;
  isLoading: boolean;
};

export function MatchDetail({ match, isLoading }: Props) {
  if (isLoading) {
    return <p className="empty-state">Loading match...</p>;
  }
  if (!match) {
    return <p className="empty-state">Select a match request to view the summary.</p>;
  }

  const { status } = match;
  const result = match.match;

  return (
    <div className="detail">
      <div className="detail-header">
        <div>
          <h3 className="detail-title">Match {match.id.slice(0, 8)}</h3>
          <p className="detail-meta">
            Resume {match.resumeId.slice(0, 8)} · Job {match.jobId.slice(0, 8)}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {match.error ? <p className="detail-alert error">{match.error}</p> : null}

      {status !== "completed" || !result ? (
        <p className="empty-state">
          {status === "failed"
            ? "Match failed. Check the error message above."
            : `Match is ${formatStatus(status)}. Results appear once processing completes.`}
        </p>
      ) : (
        <div className="detail-card">
          <h4>Score</h4>
          <div className="score-box">{result.score.toFixed(2)}</div>
          <p className="detail-meta">Completed {formatDateTime(result.completedAt)}</p>

          {result.summary.candidate ? (
            <div className="candidate-card">
              <h5>Candidate</h5>
              <dl className="meta-grid">
                <div>
                  <dt>Name</dt>
                  <dd>{result.summary.candidate.name ?? "-"}</dd>
                </div>
                <div>
                  <dt>Experience</dt>
                  <dd>
                    {result.summary.candidate.experienceYears !== null && result.summary.candidate.experienceYears !== undefined
                      ? `${result.summary.candidate.experienceYears} years`
                      : "-"}
                  </dd>
                </div>
              </dl>
              {result.summary.candidate.skills.length > 0 ? (
                <p className="detail-text">
                  Skills: {result.summary.candidate.skills.join(", ")}
                </p>
              ) : null}
              {result.summary.candidate.summary ? (
                <p className="detail-text">{result.summary.candidate.summary}</p>
              ) : null}
            </div>
          ) : null}

          <div className="detail-grid">
            <div>
              <h5>Strengths</h5>
              {result.summary.strengths.length === 0 ? (
                <p className="empty-state">No strengths captured.</p>
              ) : (
                <ul className="bullet-list">
                  {result.summary.strengths.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h5>Gaps</h5>
              {result.summary.weaknesses.length === 0 ? (
                <p className="empty-state">No gaps detected.</p>
              ) : (
                <ul className="bullet-list">
                  {result.summary.weaknesses.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="detail-card">
            <h5>Requirement coverage</h5>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Requirement</th>
                  <th>Importance</th>
                  <th>Similarity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {result.summary.requirements.map((req, index) => (
                  <tr key={index}>
                    <td>{req.requirement ?? "-"}</td>
                    <td>{req.importance !== null && req.importance !== undefined ? req.importance.toFixed(2) : "-"}</td>
                    <td>{req.similarity.toFixed(2)}</td>
                    <td>{req.candidateHasExperience ? `Matched (${req.matchedSkill ?? ""})` : "Gap"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
