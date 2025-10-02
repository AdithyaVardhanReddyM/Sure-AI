"use client";

import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";
import { WidgetHeader } from "../components/widget-header";
import { useAtomValue, useSetAtom } from "jotai";
import { errorMessageAtom, screenAtom } from "../../atoms/widget-atoms";
import { Button } from "@workspace/ui/components/button";

export const WidgetErrorScreen = () => {
  const errorMessage = useAtomValue(errorMessageAtom);
  const setScreen = useSetAtom(screenAtom);

  const handleRetry = () => {
    // Reset the screen to loading to retry the initialization
    setScreen("loading");
  };

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className="text-2xl">Hi there! 👋🏻</p>
          <p className="text-lg">How can we help you today?</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col items-center justify-center gap-y-6 p-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-20 w-20 animate-ping rounded-full bg-destructive/20"></div>
          </div>
          <div className="relative flex items-center justify-center rounded-full bg-gradient-to-br from-destructive/60 to-destructive/70 p-4 backdrop-blur-sm shadow-lg">
            <AlertTriangleIcon className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="text-center max-w-xs">
          <h2 className=" font-semibold text-foreground">
            Oops! Something went wrong
          </h2>
          <p className="mt-2 text-sm text-white/70">
            {errorMessage || "Invalid configuration"}
          </p>
        </div>
        <Button
          onClick={handleRetry}
          className="mt-2 flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs rounded-full px-6 py-2 transition-all duration-200"
        >
          <RefreshCwIcon className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    </>
  );
};
