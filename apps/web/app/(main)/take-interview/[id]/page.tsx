import TakeInterviewClient from "@/components/take-interview-client";
import { getInterviewById } from "@workspace/database";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const { interview } = await getInterviewById(id);

  if (!interview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">
            Interview Not Found
          </h1>
          <p className="text-muted-foreground mt-2">
            The interview you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return <TakeInterviewClient interviewId={id} interview={interview} />;
}
