import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import { auth, signIn } from "@/auth/auth";
import { Button } from "@/components/ui/button";

async function handleSignIn() {
  "use server";
  await signIn("auth0");
}

export default async function HomePage() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-10 px-6 text-center">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1 text-sm text-secondary-foreground">
          <span className="h-2 w-2 rounded-full bg-primary" />
          Layer1 is production ready
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Accelerate candidate-job matching with Layer1 insights
        </h1>
        <p className="text-lg text-muted-foreground">
          Upload resumes and job descriptions, compute AI-driven matches, and manage subscription access from a unified console.
        </p>
      </div>
      <form action={handleSignIn}>
        <Button size="lg">Continue with Auth0</Button>
      </form>
    </main>
  );
}
