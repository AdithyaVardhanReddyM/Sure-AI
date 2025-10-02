import { Button } from "@workspace/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { cn } from "@workspace/ui/lib/utils";
import { useAtomValue, useSetAtom } from "jotai";
import { HomeIcon, Inbox } from "lucide-react";
import React from "react";
import { screenAtom } from "../../atoms/widget-atoms";

const WidgetFooter = () => {
  const screen = useAtomValue(screenAtom);
  const setScreen = useSetAtom(screenAtom);
  return (
    <footer className="fixed inset-x-0 bottom-0 z-50 mx-auto mb-4 flex w-[94%] max-w-md rounded-2xl border border-border/60 bg-gradient-to-r from-violet-600/50 via-violet-500/40 to-violet-600/50 text-primary-foreground shadow-lg shadow-purple-900/20 supports-[backdrop-filter]:backdrop-blur-xl">
      <TooltipProvider delayDuration={150}>
        <div className="flex h-14 w-full items-center justify-between rounded-2xl">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className={cn(
                  "group relative flex-1 rounded-none rounded-l-2xl bg-transparent",
                  "hover:bg-transparent transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
                )}
                onClick={() => setScreen("selection")}
                size="icon"
                variant="ghost"
                aria-label="Home"
                aria-pressed={screen === "selection"}
                aria-current={screen === "selection" ? "page" : undefined}
              >
                <div className="flex flex-col items-center justify-center gap-1">
                  <HomeIcon
                    className={cn(
                      "size-5 transition-all",
                      screen === "selection"
                        ? "text-purple-100 scale-110"
                        : "text-purple-200 group-hover:text-purple-100"
                    )}
                  />
                  <span
                    className={cn(
                      "h-0.5 w-8 rounded-full transition-all",
                      screen === "selection"
                        ? "bg-purple-100 scale-x-100"
                        : "bg-purple-200 group-hover:bg-purple-100/60 scale-x-0"
                    )}
                  />
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" align="center">
              Home
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className={cn(
                  "group relative flex-1 rounded-none rounded-r-2xl bg-transparent",
                  "hover:bg-transparent transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
                )}
                onClick={() => setScreen("inbox")}
                size="icon"
                variant="ghost"
                aria-label="Inbox"
                aria-pressed={screen === "inbox"}
                aria-current={screen === "inbox" ? "page" : undefined}
              >
                <div className="flex flex-col items-center justify-center gap-1">
                  <Inbox
                    className={cn(
                      "size-5 transition-all",
                      screen === "inbox"
                        ? "text-purple-200 scale-110"
                        : "text-purple-300/80 group-hover:text-purple-100"
                    )}
                  />
                  <span
                    className={cn(
                      "h-0.5 w-8 rounded-full transition-all",
                      screen === "inbox"
                        ? "bg-purple-200 scale-x-100"
                        : "bg-purple-300/40 group-hover:bg-purple-100/60 scale-x-0"
                    )}
                  />
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" align="center">
              Inbox
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </footer>
  );
};

export default WidgetFooter;
