"use server";

import { prisma } from "@workspace/database";
import { validate } from "./contactSessions";

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
      status: "unresolved",
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
