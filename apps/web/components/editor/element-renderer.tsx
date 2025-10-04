"use client";

import React from "react";
import { BaseElement, SocialIcon } from "./types";

interface ElementRendererProps {
  element: BaseElement;
}

export default function ElementRenderer({ element }: ElementRendererProps) {
  // Handle column elements with nested content
  if (element.type === "column") {
    const numOfCol = element.numOfCol || 2; // fallback
    // Tailwind needs safelisting for grid-cols-{n} if dynamic
    const gridClass = `grid grid-cols-${numOfCol} gap-4`;

    return (
      <div className="border-2 border-dashed border-muted-foreground/20 p-2 m-2 rounded-md">
        <div className={gridClass}>
          {Array(numOfCol)
            .fill(null)
            .map((_, index) => {
              const columnContent = element[index.toString()];
              return (
                <div
                  key={index}
                  className="min-h-[100px] border border-dashed border-muted-foreground/20 rounded-md flex items-center justify-center"
                >
                  {columnContent ? (
                    <ElementRenderer element={columnContent} />
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Drop elements here
                    </span>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    );
  }

  // Handle regular elements
  switch (element.type) {
    case "Button":
      return (
        <div style={element.outerStyle} className="py-2">
          <a
            href={element.url || "#"}
            style={element.style}
            className="inline-block"
          >
            {element.content}
          </a>
        </div>
      );

    case "Text":
      return (
        <div style={element.outerStyle}>
          <div
            style={element.style}
            dangerouslySetInnerHTML={{ __html: element.textarea || "" }}
          />
        </div>
      );

    case "Image":
      return (
        <div style={element.outerStyle}>
          <img
            src={element.imageUrl || "/placeholder.svg?height=300&width=400"}
            alt={element.alt || "Image"}
            style={element.style}
            className="max-w-full"
          />
        </div>
      );

    case "Logo":
    case "LogoHeader":
      return (
        <div style={element.outerStyle}>
          <img
            src={element.imageUrl || "/placeholder.svg?height=100&width=200"}
            alt={element.alt || "Logo"}
            style={element.style}
            className="max-w-full"
          />
        </div>
      );

    case "Divider":
      return (
        <hr
          style={{
            border: "none",
            borderTop: "1px solid #e2e8f0",
            margin: "10px 0",
            ...element.style,
          }}
        />
      );

    case "SocialIcons":
      return (
        <div style={element.outerStyle} className="flex justify-center py-2">
          {element.socialIcons?.map((icon: SocialIcon, index: number) => (
            <a
              key={index}
              href={icon.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="mx-1"
            >
              <img
                src={icon.icon || "/placeholder.svg?height=40&width=40"}
                alt="Social Icon"
                width={element.style?.width || 40}
                height={element.style?.height || 40}
              />
            </a>
          ))}
        </div>
      );

    default:
      return <div>Unknown element type: {element.type}</div>;
  }
}
