import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { HomeIcon, MessageSquareMore } from "lucide-react";
import React from "react";

const WidgetFooter = () => {
  const screen = "selection" as string;
  return (
    <footer className="flex items-center justify-between border-t border-primary text-primary-foreground bg-background">
      <Button
        className="h-14 flex-1 rounded-none bg-foreground"
        onClick={() => {}}
        size="icon"
        variant="ghost"
      >
        <HomeIcon
          className={cn("size-5", screen === "selection" && "text-primary")}
        />
      </Button>
      <Button
        className="h-14 flex-1 rounded-none bg-foreground"
        onClick={() => {}}
        size="icon"
        variant="ghost"
      >
        <MessageSquareMore
          className={cn("size-5", screen === "inbox" && "text-primary")}
        />
      </Button>
    </footer>
  );
};

export default WidgetFooter;
