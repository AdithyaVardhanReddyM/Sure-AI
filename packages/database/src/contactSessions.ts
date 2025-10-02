"use server";

import { prisma } from "@workspace/database";

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

export async function createContactSession(
  name: string,
  email: string,
  agentId: string,
  metadata?: ContactSessionMetadataInput
) {
  try {
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

    return { success: true, contactSession };
  } catch (error) {
    console.error("Error creating contact session:", error);
    return { success: false, error: "Failed to create contact session" };
  }
}
