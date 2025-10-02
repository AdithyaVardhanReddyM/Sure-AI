import { auth } from "@clerk/nextjs/server";
import DashboardClient from "../../../components/dashboard-client";
import { getUserAgents } from "@/actions/agentActions";

export default async function Page() {
  const { userId } = await auth();
  const { agents } = await getUserAgents(userId || "");

  return <DashboardClient agents={agents} />;