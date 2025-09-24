import type { ResumeDetail } from "../types/api";
import { formatDateTime, formatStatus } from "../utils/format";
import { StatusBadge } from "./StatusBadge";

type Props = {
  resume?: ResumeDetail;
  isLoading: boolean;
};

export function ResumeDetail({ resume, isLoading }: Props) {
  if (isLoading) {
    return <p className="empty-state">Loading resume...</p>;
  }
  if (!resume) {
    return <p className="empty-state">Select a resume to see details.</p>;
  }

  const { parsedData } = resume;
  const profile = parsedData?.profile ?? null;
  const sections = parsedData?.sections ?? {};

  return (
    <div className="detail">
      <div className="detail-header">
        <div>
          <h3 className="detail-title">{resume.filename ?? "Untitled resume"}</h3>
          <p className="detail-meta">Uploaded {formatDateTime(resume.createdAt)}</p>
        </div>
        <StatusBadge status={resume.status} />
      </div>

      {resume.status !== "ready" ? (
        <p className="detail-alert">
          Parsing is {formatStatus(resume.status)}. Data below may be incomplete.
        </p>
      ) : null}

      {profile ? (
        <div className="detail-card">
          <h4>Candidate Profile</h4>
          <dl className="meta-grid">
            <div>
              <dt>Name</dt>
              <dd>{profile.name ?? "-"}</dd>
            </div>
            <div>
              <dt>Total experience</dt>
              <dd>
                {profile.totalExperienceYears !== undefined && profile.totalExperienceYears !== null
                  ? `${profile.totalExperienceYears} years`
                  : "-"}
              </dd>
            </div>
          </dl>
          {profile.summary ? <p className="detail-text">{profile.summary}</p> : null}
        </div>
      ) : null}

      <div className="detail-card">
        <h4>Skills ({resume.skills.length})</h4>
        {resume.skills.length === 0 ? (
          <p className="empty-state">No skills parsed yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Skill</th>
                <th>Experience</th>
                <th>Proficiency</th>
              </tr>
            </thead>
            <tbody>
              {resume.skills.map((skill) => (
                <tr key={skill.id}>
                  <td>{skill.skill}</td>
                  <td>{skill.experienceYears ?? "-"}</td>
                  <td>{skill.proficiency ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {sections && Object.keys(sections).length > 0 ? (
        <div className="detail-card">
          <h4>Sections</h4>
          <div className="section-list">
            {Object.entries(sections).map(([key, value]) => (
              <div key={key} className="section-item">
                <h5>{formatStatus(key)}</h5>
                <pre>{Array.isArray(value) ? value.join("\n") : value}</pre>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
