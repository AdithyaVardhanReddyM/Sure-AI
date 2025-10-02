"use client";

import { AlertTriangleIcon } from "lucide-react";
import { WidgetHeader } from "../components/widget-header";
import { useAtomValue } from "jotai";
import { errorMessageAtom } from "../../atoms/widget-atoms";

export const WidgetErrorScreen = () => {
  const errorMessage = useAtomValue(errorMessageAtom);
  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className="text-2xl">Hi there! 👋🏻</p>
          <p className="text-lg">How can we help you today?</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col items-center justify-center gap-y-4 p-4 text-primary-foreground">
        <AlertTriangleIcon />
        <p className="text-sm">{errorMessage || "Invalid configuration"}</p>
      </div>
    </>
  );
};
