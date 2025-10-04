"use client";

import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import ElementRenderer from "./element-renderer";
import { BaseElement } from "./types";
import React from "react";

// ---- Props ----
interface DroppableAreaProps {
  elements: BaseElement[];
  onElementSelect: (element: BaseElement) => void;
  onElementDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  selectedElementId?: string;
}

interface SortableElementProps {
  element: BaseElement;
  onElementSelect: (element: BaseElement) => void;
  onElementDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  selectedElementId?: string;
}

// ---- Component ----
export default function DroppableArea({
  elements,
  onElementSelect,
  onElementDelete,
  onMoveUp,
  onMoveDown,
  selectedElementId,
}: DroppableAreaProps) {
  const { setNodeRef } = useDroppable({
    id: "droppable-area",
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[600px] ${elements.length === 0 ? "flex flex-col items-center justify-center" : ""}`}
    >
      {elements.length === 0 ? (
        <div className="text-center p-6 border-2 border-dashed rounded-md">
          <div className="text-muted-foreground mb-2">
            <div className="h-10 w-10 mx-auto mb-2 opacity-50 flex items-center justify-center border-2 border-dashed rounded-full">
              <span className="text-lg">+</span>
            </div>
            <h3 className="font-medium">Add Elements</h3>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            Drag and drop elements from the sidebar to start building your email
            template
          </p>
        </div>
      ) : (
        elements.map((element, index) => (
          <SortableElement
            key={element.id}
            element={element}
            onElementSelect={onElementSelect}
            onElementDelete={onElementDelete}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            isSelected={element.id === selectedElementId}
            isFirst={index === 0}
            isLast={index === elements.length - 1}
            selectedElementId={selectedElementId}
          />
        ))
      )}
    </div>
  );
}

// ---- Column Droppable Area ----
function ColumnDroppableArea({
  element,
  columnIndex,
  onElementSelect,
  onElementDelete,
  selectedElementId,
}: {
  element: BaseElement;
  columnIndex: number;
  onElementSelect: (element: BaseElement) => void;
  onElementDelete: (id: string) => void;
  selectedElementId?: string;
}) {
  const { setNodeRef } = useDroppable({
    id: `column-${element.id}-${columnIndex}`,
  });

  const columnContent = element[columnIndex.toString()] as BaseElement;

  return (
    <div
      ref={setNodeRef}
      className="min-h-[100px] border border-dashed border-muted-foreground/20 rounded-md flex items-center justify-center"
    >
      {columnContent ? (
        <div
          className={`w-full h-full p-2 relative ${
            columnContent.id === selectedElementId
              ? "outline outline-2 outline-blue-500"
              : ""
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onElementSelect(columnContent);
          }}
        >
          <ElementRenderer element={columnContent} />

          {columnContent.id === selectedElementId && (
            <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex flex-col gap-1 bg-white rounded-md shadow-sm p-1 z-10">
              {/* Delete */}
              <button
                className="text-red-500 hover:bg-red-50 rounded-md p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onElementDelete(columnContent.id);
                }}
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">
          Drop elements here
        </span>
      )}
    </div>
  );
}

// ---- Sortable Element ----
function SortableElement({
  element,
  onElementSelect,
  onElementDelete,
  onMoveUp,
  onMoveDown,
  isSelected,
  isFirst,
  isLast,
  selectedElementId,
}: SortableElementProps) {
  // Handle column elements specially
  if (element.type === "column") {
    const numOfCol = element.numOfCol || 2;
    const gridColsClass =
      {
        1: "grid-cols-1",
        2: "grid-cols-2",
        3: "grid-cols-3",
        4: "grid-cols-4",
      }[numOfCol] || "grid-cols-2";
    const gridClass = `grid ${gridColsClass} gap-4`;

    const sortable = useSortable({ id: element.id });
    const droppable = useDroppable({ id: `layout-${element.id}` });

    const refCallback = (node: HTMLDivElement | null) => {
      sortable.setNodeRef(node);
      droppable.setNodeRef(node);
    };

    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(
        sortable.transform || { x: 0, y: 0, scaleX: 1, scaleY: 1 }
      ),
      transition: sortable.transition,
      opacity: sortable.isDragging ? 0.5 : 1,
      position: "relative",
    };

    return (
      <div
        ref={refCallback}
        style={style}
        className={`relative group ${
          isSelected ? "outline outline-2 outline-blue-500" : ""
        }`}
        onClick={() => onElementSelect(element)}
        {...sortable.attributes}
        {...sortable.listeners}
      >
        <div
          className={`border-2 border-dashed p-2 m-2 rounded-md ${droppable.isOver ? "border-blue-500 bg-blue-50" : "border-muted-foreground/20"}`}
        >
          <div className={gridClass}>
            {Array(numOfCol)
              .fill(null)
              .map((_, index) => (
                <ColumnDroppableArea
                  key={index}
                  element={element}
                  columnIndex={index}
                  onElementSelect={onElementSelect}
                  onElementDelete={onElementDelete}
                  selectedElementId={selectedElementId}
                />
              ))}
          </div>
        </div>

        {isSelected && (
          <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex flex-col gap-1 bg-white rounded-md shadow-sm p-1 z-10">
            {/* Move Up */}
            <button
              className="text-gray-600 hover:bg-gray-100 rounded-md p-1 disabled:opacity-30"
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp(element.id);
              }}
              disabled={isFirst}
              title="Move Up"
            >
              <ArrowUp className="h-4 w-4" />
            </button>

            {/* Move Down */}
            <button
              className="text-gray-600 hover:bg-gray-100 rounded-md p-1 disabled:opacity-30"
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown(element.id);
              }}
              disabled={isLast}
              title="Move Down"
            >
              <ArrowDown className="h-4 w-4" />
            </button>

            {/* Delete */}
            <button
              className="text-red-500 hover:bg-red-50 rounded-md p-1"
              onClick={(e) => {
                e.stopPropagation();
                onElementDelete(element.id);
              }}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Handle regular elements
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: element.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${
        isSelected ? "outline outline-2 outline-blue-500" : ""
      }`}
      onClick={() => onElementSelect(element)}
      {...attributes}
      {...listeners}
    >
      <ElementRenderer element={element} />

      {isSelected && (
        <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex flex-col gap-1 bg-white rounded-md shadow-sm p-1 z-10">
          {/* Move Up */}
          <button
            className="text-gray-600 hover:bg-gray-100 rounded-md p-1 disabled:opacity-30"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp(element.id);
            }}
            disabled={isFirst}
            title="Move Up"
          >
            <ArrowUp className="h-4 w-4" />
          </button>

          {/* Move Down */}
          <button
            className="text-gray-600 hover:bg-gray-100 rounded-md p-1 disabled:opacity-30"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown(element.id);
            }}
            disabled={isLast}
            title="Move Down"
          >
            <ArrowDown className="h-4 w-4" />
          </button>

          {/* Delete */}
          <button
            className="text-red-500 hover:bg-red-50 rounded-md p-1"
            onClick={(e) => {
              e.stopPropagation();
              onElementDelete(element.id);
            }}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
