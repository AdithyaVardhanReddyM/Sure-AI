import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { useAtomValue, useSetAtom } from "jotai";
import { HomeIcon, Inbox, MessageSquareMore } from "lucide-react";
import React from "react";
import { screenAtom } from "../../atoms/widget-atoms";

const WidgetFooter = () => {
  const screen = useAtomValue(screenAtom);
  const setScreen = useSetAtom(screenAtom);
  return (
    <footer className="flex items-center justify-between border-t-[0.5px] border-primary text-primary-foreground bg-background">
      <Button
        className="h-14 flex-1 rounded-none border-r-[0.5px] border-primary bg-secondary-foreground/95 hover:bg-secondary-foreground hover:text-primary-foreground"
        onClick={() => setScreen("selection")}
        size="icon"
        variant="ghost"
      >
        <HomeIcon
          className={cn("size-5", screen === "selection" && "text-purple-400")}
        />
        {/* <span className={cn(screen === "selection" && "text-purple-400")}>
          Home
        </span> */}
      </Button>
      <Button
        className="h-14 flex-1 rounded-none bg-secondary-foreground/95 hover:bg-secondary-foreground hover:text-primary-foreground"
        onClick={() => setScreen("inbox")}
        size="icon"
        variant="ghost"
      >
        <Inbox
          className={cn("size-5", screen === "inbox" && "text-purple-400")}
        />
        {/* <span className={cn(screen === "inbox" && "text-purple-400")}>
          Message
        </span> */}
      </Button>
    </footer>
  );
};

export default WidgetFooter;
