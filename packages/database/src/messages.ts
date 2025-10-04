"use server";

import { getAgentById, prisma } from "@workspace/database";
import { Role } from "../generated/prisma";
import { validate } from "./contactSessions";

export async function createMessage(
  contactSessionId: string,
  conversationId: string,
  //   role: Role,
  prompt: string
) {
  try {
    // Verify the session exists
    const validation = await validate(contactSessionId);

    if (!validation.valid || !validation.contactSession) {
      throw { code: "UNAUTHORIZED", message: "Invalid session" };
    }

    // Verify the conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
    });

    if (!conversation) {
      throw { code: "NOT_FOUND", message: "Conversation not found" };
    }

    const { agent } = await getAgentById(conversation.agentId);

    // Fetch all existing messages for the conversation
    const existingMessages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Create the user message
    const userMessage = await prisma.message.create({
      data: {
        conversationId,
        contactSessionId,
        role: "user",
        content: prompt,
      },
    });

    try {
      const webAppUrl =
        process.env.NEXT_PUBLIC_WEB_APP_URL || "http://localhost:3000";
      const widgetAppUrl =
        process.env.NEXT_PUBLIC_WIDGET_APP_URL || "http://localhost:3001";

      const payload = {
        type: "new_message",
        messageId: userMessage.id,
        conversationId,
        contactSessionId,
        role: userMessage.role,
        content: userMessage.content,
        createdAt: userMessage.createdAt.toISOString(),
      };

      // Broadcast to Web App (dashboard)
      await fetch(`${webAppUrl}/api/events/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Broadcast to Widget App
      await fetch(`${widgetAppUrl}/api/events/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Error notifying apps about user message:", error);
    }

    if (conversation.status === "notEscalated") {
      // Build the prompt template with history
      let fullPrompt = "";
      fullPrompt += `user: ${prompt}\n`;
      fullPrompt += "Conversation History : ";
      for (const msg of existingMessages) {
        fullPrompt += `${msg.role}: ${msg.content}\n`;
      }

      // Make POST call to AI service with full history
      const aiResponse = await fetch(
        "https://sure-widget-backend.onrender.com/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: fullPrompt,
            agentId: conversation.agentId,
            CalEnabled: agent?.CalEnabled,
            StripeEnabled: agent?.StripeEnabled,
            SlackEnabled: agent?.SlackEnabled,
            CalUrl: agent?.CalUrl,
          }),
        }
      );

      const aiData = await aiResponse.json();
      const aiContent =
        aiData.response || "I'm sorry, I couldn't generate a response.";

      // Create the assistant message
      const assistantMessage = await prisma.message.create({
        data: {
          conversationId,
          contactSessionId,
          role: "assistant",
          content: aiContent,
        },
      });

      try {
        const webAppUrl =
          process.env.NEXT_PUBLIC_WEB_APP_URL || "http://localhost:3000";
        const widgetAppUrl =
          process.env.NEXT_PUBLIC_WIDGET_APP_URL || "http://localhost:3001";

        const payload = {
          type: "new_message",
          messageId: assistantMessage.id,
          conversationId,
          contactSessionId,
          role: assistantMessage.role,
          content: assistantMessage.content,
          createdAt: assistantMessage.createdAt.toISOString(),
        };

        // Broadcast to Web App (dashboard)
        await fetch(`${webAppUrl}/api/events/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        // Broadcast to Widget App
        await fetch(`${widgetAppUrl}/api/events/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.error("Error notifying apps about assistant message:", error);
      }
    }
  } catch (error) {
    console.error("Error creating message:", error);
    throw error;
  }
}

export async function createMessageDashboard(
  conversationId: string,
  //   role: Role,
  prompt: string
) {
  try {
    // Verify the conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
    });

    if (!conversation) {
      throw { code: "NOT_FOUND", message: "Conversation not found" };
    }

    // Create the user message
    const humanMessage = await prisma.message.create({
      data: {
        conversationId,
        contactSessionId: conversation.contactSessionId as string,
        role: "humanAgent",
        content: prompt,
      },
    });

    // Notify the widget app about the new message for real-time updates
    try {
      const widgetAppUrl = "http://localhost:3001";

      // Send event for the new message
      await fetch(`${widgetAppUrl}/api/events/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "new_message",
          messageId: humanMessage.id,
          conversationId,
          contactSessionId: conversation.contactSessionId,
          role: humanMessage.role,
          content: humanMessage.content,
          createdAt: humanMessage.createdAt.toISOString(),
        }),
      });
    } catch (error) {
      console.error("Error notifying widget app about message:", error);
    }

    return humanMessage;
  } catch (error) {
    console.error("Error creating message:", error);
    throw error;
  }
}

export async function getMany(
  conversationId: string,
  contactSessionId: string,
  paginationOpts: { limit?: number; offset?: number }
) {
  try {
    // Verify the session exists
    const validation = await validate(contactSessionId);

    if (!validation.valid || !validation.contactSession) {
      throw { code: "UNAUTHORIZED", message: "Invalid session" };
    }

    // Fetch messages with pagination
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: "asc",
      },
      skip: paginationOpts.offset || 0,
      take: paginationOpts.limit || 50, // default limit
    });

    return messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
}

export async function getLastMessage(
  conversationId: string,
  contactSessionId: string
) {
  try {
    // Fetch the last message
    const lastMessage = await prisma.message.findFirst({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return lastMessage;
  } catch (error) {
    console.error("Error fetching last message:", error);
    throw error;
  }
}

export async function getManyDashboard(
  conversationId: string,
  paginationOpts: { limit?: number; offset?: number }
) {
  try {
    // Fetch messages with pagination
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: "asc",
      },
      skip: paginationOpts.offset || 0,
      take: paginationOpts.limit || 50, // default limit
    });

    return messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
}
