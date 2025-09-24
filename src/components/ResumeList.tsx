import classNames from "classnames";
import type { ResumeSummary } from "../types/api";
import { formatDateTime } from "../utils/format";
import { StatusBadge } from "./StatusBadge";

type Props = {
  items: ResumeSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function ResumeList({ items, selectedId, onSelect }: Props) {
  if (items.length === 0) {
    return <p className="empty-state">No resumes uploaded yet.</p>;
  }

  return (
    <ul className="item-list">
      {items.map((item) => {
        const isSelected = item.id === selectedId;
        return (
          <li
            key={item.id}
            className={classNames("item", { selected: isSelected })}
            onClick={() => onSelect(item.id)}
          >
            <div className="item-main">
              <strong>{item.filename ?? "Untitled resume"}</strong>
              <StatusBadge status={item.status} />
            </div>
            <div className="item-meta">
              <span>{item.mimeType ?? "Unknown"}</span>
              <span>{formatDateTime(item.createdAt)}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
