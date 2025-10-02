"use client";

import { Loader2 } from "lucide-react";
import { WidgetHeader } from "../components/widget-header";
import { useAtomValue, useSetAtom } from "jotai";
import {
  agentIdAtom,
  contactSessionIdAtomFamily,
  errorMessageAtom,
  loadingMessageAtom,
  screenAtom,
} from "../../atoms/widget-atoms";
import { useEffect, useState } from "react";
import { validateAgent } from "../../../../../../packages/database/src/agents";
import { validate } from "../../../../../../packages/database/src/contactSessions";

type InitStep = "agent" | "session" | "settings" | "done";

export const WidgetLoadingScreen = ({
  agentId,
}: {
  agentId: string | null;
}) => {
  const [step, setStep] = useState<InitStep>("agent");
  const [sessionValid, setSessionValid] = useState(false);

  const loadingMessage = useAtomValue(loadingMessageAtom);
  const setErrorMessage = useSetAtom(errorMessageAtom);
  const setLoadingMessage = useSetAtom(loadingMessageAtom);
  const setScreen = useSetAtom(screenAtom);
  const setAgentId = useSetAtom(agentIdAtom);

  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(agentId || "")
  );

  useEffect(() => {
    if (step !== "agent") {
      return;
    }
    setLoadingMessage("Finding Agent...");
    if (!agentId) {
      setErrorMessage("Agent ID is required");
      setScreen("error");
      return;
    }
    setLoadingMessage("Verifying Agent...");
    validateAgent(agentId)
      .then((result) => {
        if (result.valid) {
          setAgentId(agentId);
          setStep("session");
        } else {
          setErrorMessage(result.reason || "Invalid configuration");
          setScreen("error");
        }
      })
      .catch(() => {
        setErrorMessage("Unable to verify agent");
        setScreen("error");
      });
  }, [
    step,
    agentId,
    setErrorMessage,
    setScreen,
    setAgentId,
    setStep,
    validateAgent,
    setLoadingMessage,
  ]);

  useEffect(() => {
    if (step !== "session") {
      return;
    }
    setLoadingMessage("Finding contact session");
    if (!contactSessionId) {
      setSessionValid(false);
      setStep("done");
      return;
    }

    setLoadingMessage("Validating session...");

    validate(contactSessionId as string)
      .then((result) => {
        setSessionValid(result.valid);
        setStep("done");
      })
      .catch(() => {
        setSessionValid(false);
        setStep("done");
      });
  }, [step, contactSessionId, validate, setLoadingMessage]);

  useEffect(() => {
    if (step !== "done") {
      return;
    }

    const hasValidSession = contactSessionId && sessionValid;
    setScreen(hasValidSession ? "selection" : "auth");
  }, [step, contactSessionId, sessionValid, setScreen]);

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className="text-2xl">Hi there! 👋🏻</p>
          <p className="text-lg">How can we help you today?</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col items-center justify-center gap-y-4 p-4 text-primary-foreground">
        <Loader2 className="animate-spin" />
        <p className="text-sm">{loadingMessage || "Loading"}</p>
      </div>
    </>
  );
};
