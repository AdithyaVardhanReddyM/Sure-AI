import React from "react";
import { widgetGetSettings, widgetSaveSettingsAction } from "@/src/settings";
import SettingsForm from "@/components/SettingsForm";

const Page = async ({ params }: { params: Promise<{ agentId: string }> }) => {
  const { agentId } = await params;
  const defaults = await widgetGetSettings(agentId);

  return <SettingsForm defaults={defaults} action={widgetSaveSettingsAction} />;
};

export default Page;
