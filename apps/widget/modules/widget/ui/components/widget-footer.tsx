import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { HomeIcon, MessageSquareMore } from "lucide-react";
import React from "react";

const WidgetFooter = () => {
  const screen = "inbox" as string;
  return (
    <footer className="flex items-center justify-between border-t-[0.5px] border-primary text-primary-foreground bg-background">
      <Button
        className="h-14 flex-1 rounded-none border-r-[0.5px] border-primary bg-foreground hover:bg-secondary-foreground hover:text-primary-foreground"
        onClick={() => {}}
        size="icon"
        variant="ghost"
      >
        <HomeIcon
          className={cn("size-5", screen === "selection" && "text-purple-400")}
        />
        <span className={cn(screen === "selection" && "text-purple-400")}>
          Home
        </span>
      </Button>
      <Button
        className="h-14 flex-1 rounded-none bg-foreground hover:bg-secondary-foreground hover:text-primary-foreground"
        onClick={() => {}}
        size="icon"
        variant="ghost"
      >
        <MessageSquareMore
          className={cn("size-5", screen === "inbox" && "text-purple-400")}
        />
        <span className={cn(screen === "inbox" && "text-purple-400")}>
          Message
        </span>
      </Button>
    </footer>
  );
};

export default WidgetFooter;
