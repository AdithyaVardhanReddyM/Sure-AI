import { ArrowRightIcon, ArrowUpIcon, CheckIcon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface ConversationStatusIconProps {
  status: "notEscalated" | "escalated";
}

const statusConfig = {
  escalated: {
    icon: ArrowUpIcon,
    bgColor: "bg-destructive",
  },
  notEscalated: {
    icon: ArrowRightIcon,
    bgColor: "bg-primary",
  },
} as const;

export const ConversationStatusIcon = ({
  status,
}: ConversationStatusIconProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full p-1.5",
        config.bgColor
      )}
    >
      <Icon className="size-3 stroke-3 text-white" />
    </div>
  );
};
