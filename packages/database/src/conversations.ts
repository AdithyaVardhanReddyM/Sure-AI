"use server";

import { prisma } from "@workspace/database";
import { validate } from "./contactSessions";
import { getLastMessage } from "./messages";

export async function createConversation(
  agentId: string,
  contactSessionId: string
) {
  // Validate the contact session
  const validation = await validate(contactSessionId);

  if (!validation.valid || !validation.contactSession) {
    throw { code: "UNAUTHORIZED", message: "Invalid session" };
  }

  const session = validation.contactSession;

  // Ensure the session belongs to the specified agent
  if (session.agentId !== agentId) {
    throw { code: "UNAUTHORIZED", message: "Invalid session" };
  }

  // const threadId = "123"; //TODO: Replace later

  // Create the conversation
  const conversation = await prisma.conversation.create({
    data: {
      agentId,
      contactSessionId,
      status: "notEscalated",
      // threadId,
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      contactSessionId,
      role: "assistant",
      content: "Hi there! How can I assist you today?",
    },
  });

  // Notify the web app about the new conversation for real-time updates
  try {
    const webAppUrl =
      process.env.NEXT_PUBLIC_WEB_APP_URL || "http://localhost:3000";

    await fetch(`${webAppUrl}/api/events/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversationId: conversation.id,
        agentId,
        contactSessionId,
        status: conversation.status,
        createdAt: conversation.createdAt.toISOString(),
      }),
    });
  } catch (error) {
    console.error("Error notifying web app:", error);
  }

  return conversation.id;
}

export async function getOne(contactSessionId: string, conversationId: string) {
  try {
    const validation = await validate(contactSessionId);

    if (!validation.valid || !validation.contactSession) {
      throw { code: "UNAUTHORIZED", message: "Invalid session" };
    }

    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
    });

    if (!conversation) {
      throw { code: "NOT_FOUND", message: "Conversation not found" };
    }

    if (conversation.contactSessionId !== contactSessionId) {
      throw { code: "UNAUTHORIZED", message: "Incorrect Session" };
    }

    return {
      _id: conversation.id,
      status: conversation.status,
      // threadId: conversation.threadId,
    };
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return null;
  }
}

export async function getConversationById(conversationId: string) {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
    });

    if (!conversation) {
      throw { code: "NOT_FOUND", message: "Conversation not found" };
    }

    return conversation;
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return null;
  }
}

export async function getManyConversations(contactSessionId: string) {
  try {
    const validation = await validate(contactSessionId);

    if (!validation.valid || !validation.contactSession) {
      throw { code: "UNAUTHORIZED", message: "Invalid session" };
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        contactSessionId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (conversation) => {
        const lastMessage = await getLastMessage(
          conversation.id,
          contactSessionId
        );
        return {
          conversationId: conversation.id,
          agentId: conversation.agentId,
          lastMessage: lastMessage ? lastMessage.content : null,
          createdAt: conversation.createdAt,
          status: conversation.status,
        };
      })
    );

    return conversationsWithLastMessage;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return null;
  }
}

export async function getConversationsDashboard(agentId: string) {
  try {
    // Fetch all conversations for the agent, ordered by latest first
    const conversations = await prisma.conversation.findMany({
      where: {
        agentId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // For each conversation, fetch contactSession data and lastMessage if session is valid
    const conversationsWithData = await Promise.all(
      conversations.map(async (conversation) => {
        const validation = await validate(conversation.contactSessionId);

        if (!validation.valid || !validation.contactSession) {
          return null;
        }

        const contactSession = validation.contactSession;
        const lastMessage = await getLastMessage(
          conversation.id,
          conversation.contactSessionId
        );

        return {
          ...conversation,
          contactSession,
          lastMessage,
        };
      })
    );

    const filteredConversations = conversationsWithData.filter(
      (conv) => conv !== null
    );
    return filteredConversations;
  } catch (error) {
    return null;
  }
}

export async function getOneDashboard(conversationId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
  });

  if (!conversation) {
    throw { code: "NOT_FOUND", message: "Conversation not found" };
  }

  const contactSession = await prisma.contactSession.findUnique({
    where: {
      id: conversation.contactSessionId,
    },
  });

  if (!contactSession) {
    throw { code: "NOT_FOUND", message: "Contact session not found" };
  }

  return {
    ...conversation,
    contactSession,
  };
}

export async function updateStatus(
  conversationId: string,
  status: "notEscalated" | "escalated"
) {
  try {
    const conversation = await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        status,
      },
    });
  } catch (error) {
    console.error("Error updating conversation status:", error);
    throw error;
  }
}
