import { redirect } from "next/navigation";

import { auth } from "@/auth/auth";
import { DashboardShell } from "@/features/dashboard/dashboard-shell";

export const dynamic = "force-dynamic";

// New Next.js signature: searchParams is a Promise
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const resolvedSearchParams = await searchParams;
  const session = await auth();
  if (!session) {
    redirect("/");
  }
  const token = session.user?.accessToken;

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-6 py-10">
      <header className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Welcome back{session.user?.name ? `, ${session.user.name}` : ""}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Layer1 operations console
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor uploads, review AI summaries, and trigger match comparisons
          powered by the Layer1 backend and Python worker.
        </p>
      </header>
      <DashboardShell token={token} searchParams={resolvedSearchParams} />
    </main>
  );
}
