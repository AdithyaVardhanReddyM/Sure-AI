"use server";

import { prisma } from "@workspace/database";

export async function createAgent(userId: string, agentName: string) {
  try {
    const agent = await prisma.agent.create({
      data: {
        name: agentName,
        clerkId: userId,
      },
    });
    return { success: true, agent };
  } catch (error) {
    console.error("Error creating agent:", error);
    return { success: false, error: "Failed to create agent" };
  }
}

export async function getUserAgents(userId: string) {
  try {
    const agents = await prisma.agent.findMany({
      where: {
        clerkId: userId,
      },
      orderBy: {
        name: "asc",
      },
    });
    return { success: true, agents };
  } catch (error) {
    console.error("Error fetching agents:", error);
    return { success: false, error: "Failed to fetch agents", agents: [] };
  }
}

export async function deleteAgent(agentId: string) {
  try {
    await prisma.agent.delete({
      where: {
        id: agentId,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting agent:", error);
    return { success: false, error: "Failed to delete agent" };
  }
}
