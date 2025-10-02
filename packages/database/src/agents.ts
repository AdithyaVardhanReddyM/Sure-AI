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

export async function validateAgent(agentId: string) {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return { valid: false, reason: "Agent not valid" };
    }

    return { valid: true };
  } catch (error) {
    console.error("Error validating agent:", error);
    return { valid: false, reason: "Error validating agent" };
  }
}

export async function updateAgentCalSettings(
  agentId: string,
  calUrl: string,
  calEnabled: boolean
) {
  try {
    const agent = await prisma.agent.update({
      where: {
        id: agentId,
      },
      data: {
        CalUrl: calUrl,
        CalEnabled: calEnabled,
      },
    });
    return { success: true, agent };
  } catch (error) {
    console.error("Error updating Cal.com settings:", error);
    return { success: false, error: "Failed to update Cal.com settings" };
  }
}

export async function updateAgentSlackSettings(
  agentId: string,
  slackBotToken: string,
  slackTeamId: string,
  slackChannelIds: string,
  slackEnabled: boolean
) {
  try {
    const agent = await prisma.agent.update({
      where: {
        id: agentId,
      },
      data: {
        SLACK_BOT_TOKEN: slackBotToken,
        SLACK_TEAM_ID: slackTeamId,
        SLACK_CHANNEL_IDS: slackChannelIds,
        SlackEnabled: slackEnabled,
      },
    });
    return { success: true, agent };
  } catch (error) {
    console.error("Error updating Slack settings:", error);
    return { success: false, error: "Failed to update Slack settings" };
  }
}

export async function updateAgentStripeSettings(
  agentId: string,
  stripeApiKey: string,
  stripeEnabled: boolean
) {
  try {
    const agent = await prisma.agent.update({
      where: {
        id: agentId,
      },
      data: {
        STRIPE_API_KEY: stripeApiKey,
        StripeEnabled: stripeEnabled,
      },
    });
    return { success: true, agent };
  } catch (error) {
    console.error("Error updating Stripe settings:", error);
    return { success: false, error: "Failed to update Stripe settings" };
  }
}

export async function getAgentById(agentId: string) {
  try {
    const agent = await prisma.agent.findUnique({
      where: {
        id: agentId,
      },
    });

    if (!agent) {
      return { success: false, error: "Agent not found" };
    }

    return { success: true, agent };
  } catch (error) {
    console.error("Error fetching agent:", error);
    return { success: false, error: "Failed to fetch agent" };
  }
}
