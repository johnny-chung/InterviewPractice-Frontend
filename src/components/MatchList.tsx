import classNames from "classnames";
import type { MatchJobSummary } from "../types/api";
import { formatDateTime } from "../utils/format";
import { StatusBadge } from "./StatusBadge";

type Props = {
  items: MatchJobSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function MatchList({ items, selectedId, onSelect }: Props) {
  if (items.length === 0) {
    return <p className="empty-state">No match requests yet.</p>;
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
              <strong>{item.resumeId.slice(0, 8)} ? {item.jobId.slice(0, 8)}</strong>
              <StatusBadge status={item.status} />
            </div>
            <div className="item-meta">
              <span>{formatDateTime(item.createdAt)}</span>
              {item.errorMessage ? <span className="text-error">{item.errorMessage}</span> : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
