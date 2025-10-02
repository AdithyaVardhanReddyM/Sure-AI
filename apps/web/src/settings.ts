"use server";

import { prisma } from "@workspace/database";
import { revalidatePath } from "next/cache";

export type WidgetSettingsRecord = {
  id: string;
  agentId: string;
  conversationStartMessage: string | null;
  suggestion: unknown | null;
  links: unknown | null;
};

export async function widgetGetSettings(
  agentId: string
): Promise<WidgetSettingsRecord | null> {
  if (!agentId) return null;

  const settings = await prisma.widgetSettings.findFirst({
    where: { agentId },
  });

  if (!settings) return null;

  return {
    id: settings.id,
    agentId: settings.agentId,
    conversationStartMessage: settings.conversationStartMessage ?? null,
    suggestion: (settings as any).suggestion ?? null,
    links: (settings as any).links ?? null,
  };
}

export type WidgetSettingsInput = {
  agentId: string;
  conversationStartMessage?: string | null;
  suggestion?: unknown | null;
  links?: unknown | null;
};

export async function widgetUpsertSettings(
  input: WidgetSettingsInput
): Promise<WidgetSettingsRecord> {
  const {
    agentId,
    conversationStartMessage = null,
    suggestion = null,
    links = null,
  } = input;

  if (!agentId) {
    throw new Error("agentId is required");
  }

  const existing = await prisma.widgetSettings.findFirst({
    where: { agentId },
  });

  let record;
  if (existing) {
    record = await prisma.widgetSettings.update({
      where: { id: existing.id },
      data: {
        conversationStartMessage,
        suggestion: suggestion as any,
        links: links as any,
      },
    });
  } else {
    record = await prisma.widgetSettings.create({
      data: {
        agentId,
        conversationStartMessage,
        suggestion: suggestion as any,
        links: links as any,
      },
    });
  }

  return {
    id: record.id,
    agentId: record.agentId,
    conversationStartMessage: record.conversationStartMessage ?? null,
    suggestion: (record as any).suggestion ?? null,
    links: (record as any).links ?? null,
  };
}

/**
 * Server Action to be used as <form action={widgetSaveSettingsAction}>.
 * Accepts FormData, parses JSON fields safely, upserts, and revalidates the page.
 */
export async function widgetSaveSettingsAction(
  formData: FormData
): Promise<void> {
  const agentId = String(formData.get("agentId") || "").trim();

  const conversationStartMessageRaw = formData.get("conversationStartMessage");
  const conversationStartMessage =
    typeof conversationStartMessageRaw === "string" &&
    conversationStartMessageRaw.trim().length > 0
      ? conversationStartMessageRaw
      : null;

  const parseJson = (value: FormDataEntryValue | null): unknown | null => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
      return JSON.parse(trimmed);
    } catch {
      // If invalid JSON, store as null to avoid breaking DB writes
      return null;
    }
  };

  const suggestion = parseJson(formData.get("suggestion"));
  const links = parseJson(formData.get("links"));

  await widgetUpsertSettings({
    agentId,
    conversationStartMessage,
    suggestion,
    links,
  });

  // Revalidate the customisation page so fresh data shows after submit
  if (agentId) {
    revalidatePath(`/agent/${agentId}/customisation`);
  }
}
