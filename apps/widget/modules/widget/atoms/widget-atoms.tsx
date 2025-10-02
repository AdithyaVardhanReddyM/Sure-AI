import { atom } from "jotai";
import { WidgetScreen } from "../types";
import { atomFamily, atomWithStorage } from "jotai/utils";
import { CONTACT_SESSION_KEY } from "../constants";
import { WidgetSettingsRecord } from "@workspace/database";

export const screenAtom = atom<WidgetScreen>("loading");
export const agentIdAtom = atom<string | null>(null);

export const contactSessionIdAtomFamily = atomFamily((agentId: string) =>
  atomWithStorage<string>(`${CONTACT_SESSION_KEY}_${agentId}`, "")
);

export const errorMessageAtom = atom<string | null>(null);
export const loadingMessageAtom = atom<string | null>(null);
export const conversationIdAtom = atom<string | null>(null);

export const widgetSettingsAtom = atom<WidgetSettingsRecord | null>(null);
