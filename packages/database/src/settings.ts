"use server";

import { prisma } from "@workspace/database";

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
