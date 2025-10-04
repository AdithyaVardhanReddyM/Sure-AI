import InterviewDetailsClient from "@/components/interview-details-client";
import { auth } from "@clerk/nextjs/server";
import {
  getInterviewById,
  getCandidatesByInterviewId,
} from "@workspace/database";

interface PageProps {
  params: Promise<{
    InterviewId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { InterviewId } = await params;
  const { userId } = await auth();
  const { interview } = await getInterviewById(InterviewId);
  const { candidates } = await getCandidatesByInterviewId(InterviewId);

  // Check if user owns this interview
  if (!interview || interview.clerkId !== userId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground mt-2">
            You don't have permission to view this interview.
          </p>
        </div>
      </div>
    );
  }

  return (
    <InterviewDetailsClient interview={interview} candidates={candidates} />
  );
}
