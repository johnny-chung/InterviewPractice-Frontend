import classNames from "classnames";
import type { JobSummary } from "../types/api";
import { formatDateTime } from "../utils/format";
import { StatusBadge } from "./StatusBadge";

type Props = {
  items: JobSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function JobList({ items, selectedId, onSelect }: Props) {
  if (items.length === 0) {
    return <p className="empty-state">No jobs submitted yet.</p>;
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
              <strong>{item.title ?? "Untitled job"}</strong>
              <StatusBadge status={item.status} />
            </div>
            <div className="item-meta">
              <span>{item.source === "text" ? "Text" : "File"}</span>
              <span>{formatDateTime(item.createdAt)}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
