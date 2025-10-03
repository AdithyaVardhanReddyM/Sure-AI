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
        SlackEnabled: slackEnabled,
      },
    });

    if (
      slackBotToken.trim() === "" &&
      slackTeamId.trim() === "" &&
      slackChannelIds.trim() === ""
    ) {
      // Delete Slack secrets from Doppler
      const secretsToDelete = [
        `SLACK_BOT_TOKEN_${agentId.replace(/-/g, "_").toUpperCase()}`,
        `SLACK_TEAM_ID_${agentId.replace(/-/g, "_").toUpperCase()}`,
        `SLACK_CHANNEL_IDS_${agentId.replace(/-/g, "_").toUpperCase()}`,
      ];
      for (const secret of secretsToDelete) {
        const response = await fetch(
          `https://api.doppler.com/v3/configs/config/secret?project=sure-ai&config=prd&name=${secret}`,
          {
            method: "DELETE",
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${process.env.DOPPLER_TOKEN}`,
            },
          }
        );

        if (!response.ok) {
          console.error(
            `Error deleting Doppler secret ${secret}:`,
            response.statusText
          );
          return {
            success: false,
            error: `Failed to delete ${secret} from Doppler`,
          };
        }
      }
    } else {
      // Update Slack secrets in Doppler
      const response = await fetch(
        "https://api.doppler.com/v3/configs/config/secrets",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            Authorization: `Bearer ${process.env.DOPPLER_TOKEN}`,
          },
          body: JSON.stringify({
            project: "sure-ai",
            config: "prd",
            secrets: {
              [`SLACK_BOT_TOKEN_${agentId.replace(/-/g, "_").toUpperCase()}`]:
                slackBotToken,
              [`SLACK_TEAM_ID_${agentId.replace(/-/g, "_").toUpperCase()}`]:
                slackTeamId,
              [`SLACK_CHANNEL_IDS_${agentId.replace(/-/g, "_").toUpperCase()}`]:
                slackChannelIds,
            },
          }),
        }
      );

      if (!response.ok) {
        console.error("Error updating Doppler secrets:", response.statusText);
        return {
          success: false,
          error: "Failed to update Slack secrets in Doppler",
        };
      }
    }

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
        StripeEnabled: stripeEnabled,
      },
    });

    if (stripeApiKey.trim() === "") {
      // Delete Stripe API key from Doppler
      const response = await fetch(
        `https://api.doppler.com/v3/configs/config/secret?project=sure-ai&config=prd&name=STRIPE_API_KEY_${agentId.replace(/-/g, "_").toUpperCase()}`,
        {
          method: "DELETE",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${process.env.DOPPLER_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        console.error("Error deleting Doppler secret:", response.statusText);
        return {
          success: false,
          error: "Failed to delete Stripe API key from Doppler",
        };
      }
    } else {
      // Update Stripe API key in Doppler
      const response = await fetch(
        "https://api.doppler.com/v3/configs/config/secrets",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            Authorization: `Bearer ${process.env.DOPPLER_TOKEN}`,
          },
          body: JSON.stringify({
            project: "sure-ai",
            config: "prd",
            secrets: {
              [`STRIPE_API_KEY_${agentId.replace(/-/g, "_").toUpperCase()}`]:
                stripeApiKey,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Error updating Doppler secret:",
          response.statusText,
          errorText
        );
        return {
          success: false,
          error: "Failed to update Stripe API key in Doppler",
        };
      }
    }

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
