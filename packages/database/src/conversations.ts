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

  const threadId = "123"; //TODO: Replace later

  // Create the conversation
  const conversation = await prisma.conversation.create({
    data: {
      agentId,
      contactSessionId,
      status: "unresolved",
      threadId,
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
      return null;
    }

    return {
      _id: conversation.id,
      status: conversation.status,
      threadId: conversation.threadId,
    };
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return null;
  }
}
