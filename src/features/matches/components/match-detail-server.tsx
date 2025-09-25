// filepath: c:\Users\johnn\Desktop\Project\interview-practice\frontend\src\features\matches\components\match-detail-server.tsx
import { getMatchDetail, type MatchDetail } from "@/features/matches/data";
import { MatchDetailPanel } from "./match-detail-panel";

interface Props {
  id: string | null;
  token?: string;
  disabled?: boolean;
}

export async function MatchDetailFetcher({ id, token, disabled }: Props) {
  if (!id || disabled) return <MatchDetailPanel match={undefined} />;
  let match: MatchDetail | undefined;
  try {
    match = await getMatchDetail(id, token);
  } catch {
    // swallow
  }
  return <MatchDetailPanel match={match} />;
}
