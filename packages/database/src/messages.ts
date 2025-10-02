"use server";

import { prisma } from "@workspace/database";
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

    // Fetch all existing messages for the conversation
    const existingMessages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Build the prompt template with history
    let fullPrompt = "";
    fullPrompt += `user: ${prompt}\n`;
    fullPrompt += "Conversation History : ";
    for (const msg of existingMessages) {
      fullPrompt += `${msg.role}: ${msg.content}\n`;
    }

    // Create the user message
    const userMessage = await prisma.message.create({
      data: {
        conversationId,
        contactSessionId,
        role: "user",
        content: prompt,
      },
    });

    // Make POST call to AI service with full history
    try {
      const aiResponse = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: fullPrompt,
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`AI service error: ${aiResponse.status}`);
      }

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

      return {
        userMessage,
        assistantMessage,
      };
    } catch (aiError) {
      console.error("Error calling AI service:", aiError);
    }
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
