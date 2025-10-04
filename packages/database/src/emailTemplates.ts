"use server";

import { prisma } from "@workspace/database";

export async function getEmailTemplatesByAgentId(agentId: string) {
  try {
    const emailTemplates = await prisma.emailTemplates.findMany({
      where: {
        agentId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, emailTemplates };
  } catch (error) {
    console.error("Error fetching email templates:", error);
    return {
      success: false,
      error: "Failed to fetch email templates",
      emailTemplates: [],
    };
  }
}
