// filepath: c:\Users\johnn\Desktop\Project\interview-practice\frontend\src\features\jobs\components\job-detail-server.tsx
import { getJobDetail, type JobDetail } from "@/features/jobs/data";
import { JobDetailPanel } from "./job-detail";

interface Props {
  id: string | null;
  token?: string;
  disabled?: boolean;
}

export async function JobDetailFetcher({ id, token, disabled }: Props) {
  if (!id || disabled) return <JobDetailPanel job={undefined} />;
  let job: JobDetail | undefined;
  try {
    job = await getJobDetail(id, token);
  } catch {
    // swallow
  }
  return <JobDetailPanel job={job} />;
}
