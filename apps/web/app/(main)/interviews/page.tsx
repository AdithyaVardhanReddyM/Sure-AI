import InterviewsClient from "@/components/interviews-client";
import { auth } from "@clerk/nextjs/server";
import { getInterviewsByClerkId } from "@workspace/database";

export default async function Page() {
  const { userId } = await auth();
  const { interviews } = await getInterviewsByClerkId(userId || "");

  return <InterviewsClient interviews={interviews} />;
}
