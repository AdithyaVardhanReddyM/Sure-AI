"use client";

import { useDraggable } from "@dnd-kit/core";
import { LucideIcon } from "lucide-react";

// Define the layout type
export interface Layout {
  label: string;
  type: string;
  numOfCol: number;
  icon: LucideIcon; // Lucide icons are React components
}

// Props type
interface LayoutItemProps {
  layout: Layout;
  id: string;
}

export default function LayoutItem({ layout, id }: LayoutItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
    });

  const style: React.CSSProperties | undefined = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 1000 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      className="border rounded-md p-3 flex flex-col items-center justify-center gap-1 bg-white hover:border-primary/50 hover:shadow-sm cursor-grab transition-all"
      style={style}
      {...listeners}
      {...attributes}
    >
      <layout.icon className="h-5 w-5 text-primary/80" />
      <span className="text-xs font-medium">{layout.label}</span>
    </div>
  );
}
