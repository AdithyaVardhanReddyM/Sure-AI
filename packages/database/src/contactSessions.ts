"use server";

import { prisma } from "@workspace/database";
import { ContactSession } from "../generated/prisma";

export interface ContactSessionMetadataInput {
  userAgent?: string;
  language?: string;
  languages?: string;
  platform?: string;
  vendor?: string;
  screenResolution?: string;
  viewportSize?: string;
  timezone?: string;
  timezoneOffset?: number;
  cookieEnabled?: boolean;
  referrer?: string;
  currentUrl?: string;
}

// export interface ValidateContactSessionResult {
//   valid: boolean;
//   reason?: string;
//   contactSession?: ContactSession;
// }

export async function validate(contactSessionId: string) {
  try {
    const contactSession = await prisma.contactSession.findUnique({
      where: { id: contactSessionId },
    });

    if (!contactSession) {
      return { valid: false, reason: "contact session not found" };
    }

    if (contactSession.expiresAt < Date.now()) {
      return { valid: false, reason: "contact session expired" };
    }

    return { valid: true, contactSession };
  } catch (error) {
    console.error("Error validating contact session:", error);
    return { valid: false, reason: "error validating contact session" };
  }
}

export async function createContactSession(
  name: string,
  email: string,
  agentId: string,
  metadata?: ContactSessionMetadataInput
) {
  try {
    // Validate agent exists
    // const agent = await prisma.agent.findUnique({
    //   where: { id: agentId },
    // });
    // if (!agent) {
    //   return { success: false, error: "Agent not found" };
    // }

    // expiresAt is set to 24 hours from now
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

    const contactSession = await prisma.contactSession.create({
      data: {
        name,
        email,
        agentId,
        ...(metadata && { metadata: JSON.stringify(metadata) }),
        expiresAt: expiresAt,
      },
    });

    // Create lead if not exists
    try {
      const existingLead = await prisma.leads.findFirst({
        where: {
          email: email,
          agentId: agentId,
        },
      });

      if (!existingLead) {
        await prisma.leads.create({
          data: {
            name: name,
            email: email,
            agentId: agentId,
          },
        });
      }
    } catch (error) {
      console.error("Error creating lead:", error);
    }

    return { success: true, contactSession };
  } catch (error) {
    console.error("Error creating contact session:", error);
    return { success: false, error: "Failed to create contact session" };
  }
}
