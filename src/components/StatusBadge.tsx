import classNames from "classnames";
import { formatStatus } from "../utils/format";

type Props = {
  status: string;
};

const STATUS_CLASS: Record<string, string> = {
  ready: "badge-ready",
  queued: "badge-queued",
  processing: "badge-processing",
  running: "badge-processing",
  error: "badge-error",
  failed: "badge-error",
  completed: "badge-ready",
};

export function StatusBadge({ status }: Props) {
  const normalized = status.toLowerCase();
  const className = classNames("status-badge", STATUS_CLASS[normalized] ?? "badge-neutral");
  return <span className={className}>{formatStatus(status)}</span>;
}
