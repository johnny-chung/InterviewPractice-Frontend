// filepath: c:\Users\johnn\Desktop\Project\interview-practice\frontend\src\features\resumes\components\resume-detail-server.tsx
import { getResumeDetail, type ResumeDetail } from "@/features/resumes/data";
import { ResumeDetailPanel } from "./resume-detail";

interface Props {
  id: string | null;
  token?: string;
  disabled?: boolean; // if upstream error, skip fetch
}

export async function ResumeDetailFetcher({ id, token, disabled }: Props) {
  if (!id || disabled) {
    return <ResumeDetailPanel resume={undefined} />;
  }
  let resume: ResumeDetail | undefined;
  try {
    resume = await getResumeDetail(id, token);
  } catch {
    // swallow; panel will show generic state
  }
  return <ResumeDetailPanel resume={resume} />;
}
