"use server";

import { prisma } from "@workspace/database";

export async function getLeadsByAgentId(agentId: string) {
  try {
    const leads = await prisma.leads.findMany({
      where: {
        agentId,
      },
      orderBy: {
        name: "asc",
      },
    });
    return { success: true, leads };
  } catch (error) {
    console.error("Error fetching leads:", error);
    return { success: false, error: "Failed to fetch leads", leads: [] };
  }
}
