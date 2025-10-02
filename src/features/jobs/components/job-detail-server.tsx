import { getJobDetail, type JobDetail } from "@/features/jobs/data";
import { JobDetailRealtime } from "./job-detail-realtime";

interface Props {
  id: string | null;
  token?: string;
  disabled?: boolean;
}
export async function JobDetailFetcher({ id, token, disabled }: Props) {
  if (!id || disabled)
    return (
      <JobDetailRealtime jobId={null} token={token} initialJob={undefined} />
    );
  let job: JobDetail | undefined;
  try {
    job = await getJobDetail(id, token);
  } catch {
    // swallow fetch errors; realtime layer may later succeed
  }
  return <JobDetailRealtime jobId={id} token={token} initialJob={job} />;
}
