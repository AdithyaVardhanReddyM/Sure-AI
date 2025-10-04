"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Element } from "@/lib/html-generator";
import { sampleSchema } from "@/lib/sampleSchema";

type EmailElement = Element & { id: string };
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  pointerWithin,
  CollisionDetection,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { Button } from "@workspace/ui/components/button";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Menu, Settings, Eye, Edit } from "lucide-react";
import elements from "@/constants/elements";
import layouts from "@/constants/layout";
import ElementItem from "@/components/editor/element-item";
import LayoutItem from "@/components/editor/layout-item";
import DroppableArea from "@/components/editor/droppable-area";
import PropertyPanel from "@/components/editor/property-panel";
import { generateHtmlFromElements } from "@/lib/html-generator";
import { getEmailTemplateById, updateEmailTemplate } from "@workspace/database";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Code, Save, Loader2 } from "lucide-react";
import { CopyButton } from "@/components/editor/copy-button";

import { Suspense } from "react";

const customCollisionDetection: CollisionDetection = (args) => {
  const pointerWithinResult = pointerWithin(args);
  if (pointerWithinResult.length > 0) {
    // Prefer layout over column if both are detected
    const layout = pointerWithinResult.find(
      (d) => typeof d.id === "string" && d.id.startsWith("layout-")
    );
    if (layout) return [layout];
    return pointerWithinResult;
  }
  return pointerWithinResult;
};

function Editor() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.Id as string;

  const [viewMode, setViewMode] = useState("editor"); // 'editor' or 'preview'
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<EmailElement | null>(
    null
  );
  const [emailElements, setEmailElements] = useState<EmailElement[]>([]);
  const [htmlContent, setHtmlContent] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [openSheet, setOpenSheet] = useState("");
  const [isDndReady, setIsDndReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const previewIframeRef = useRef<HTMLIFrameElement>(null);

  // Update HTML content when elements change
  useEffect(() => {
    if (emailElements.length > 0) {
      const newHtmlContent = generateHtmlFromElements(emailElements);
      setHtmlContent(newHtmlContent);
    }
  }, [emailElements]);

  // Check if viewport is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    // This ensures DnD is only initialized on the client side
    const initDnd = async () => {
      setIsDndReady(true);
    };

    initDnd();
  }, []);

  useEffect(() => {
    const loadTemplate = async () => {
      const result = await getEmailTemplateById(templateId);
      if (result.success && result.emailTemplate) {
        setTemplateName(result.emailTemplate.name);
        if (result.emailTemplate.schema) {
          const initialElements = (result.emailTemplate.schema as any[]).map(
            (element: any) => ({
              ...element,
              id: `email-element-${Date.now()}-${Math.random()}`,
            })
          );
          setEmailElements(initialElements);
        } else {
          // Fallback to sampleSchema if no schema stored
          const initialElements = sampleSchema.map((element: any) => ({
            ...element,
            id: `email-element-${Date.now()}-${Math.random()}`,
          }));
          setEmailElements(initialElements);
        }
      }
    };
    loadTemplate();
  }, [templateId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: any) => {
    const { active } = event;
    setActiveId(active.id);
    setIsDragging(true);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setIsDragging(false);
    setActiveId(null);

    if (!over) return;

    // Handle dropping a new element
    if (active.id.startsWith("element-") && over.id === "droppable-area") {
      const elementType = active.id.replace("element-", "");
      const element = elements.find((el) => el.type === elementType);

      if (element) {
        const newElement = {
          ...element,
          id: `email-element-${Date.now()}`,
        } as unknown as EmailElement;

        setEmailElements([...emailElements, newElement]);
        setSelectedElement(newElement);
      }
    }
    // Handle dropping a new layout
    else if (active.id.startsWith("layout-") && over.id === "droppable-area") {
      const layoutId = active.id.replace("layout-", "");
      const [type, numOfColStr] = layoutId.split("-");
      const numOfCol = parseInt(numOfColStr);
      const layout = layouts.find(
        (l) => l.type === type && l.numOfCol === numOfCol
      );

      if (layout) {
        const newElement = {
          type: layout.type,
          numOfCol: layout.numOfCol,
          id: `email-element-${Date.now()}`,
        } as unknown as EmailElement;

        setEmailElements([...emailElements, newElement]);
        setSelectedElement(newElement);
      }
    }
    // Handle dropping elements into column areas
    else if (
      active.id.startsWith("element-") &&
      over.id.startsWith("column-")
    ) {
      const elementType = active.id.replace("element-", "");
      const element = elements.find((el) => el.type === elementType);
      const [, parentId, columnIndexStr] = over.id.split("-");
      const columnIndex = parseInt(columnIndexStr);

      if (element && parentId) {
        const parentElement = emailElements.find((el) => el.id === parentId);
        if (parentElement && parentElement.type === "column") {
          const newElement = {
            ...element,
            id: `email-element-${Date.now()}`,
          } as unknown as EmailElement;

          // Add the element to the column
          const updatedParent = {
            ...parentElement,
            [columnIndex.toString()]: newElement,
          };

          setEmailElements(
            emailElements.map((el) => (el.id === parentId ? updatedParent : el))
          );
          setSelectedElement(newElement);
        }
      }
    }
    // Handle dropping layouts into column areas
    else if (active.id.startsWith("layout-") && over.id.startsWith("column-")) {
      const layoutId = active.id.replace("layout-", "");
      const [type, numOfColStr] = layoutId.split("-");
      const numOfCol = parseInt(numOfColStr || "1");
      const layout = layouts.find(
        (l) => l.type === type && l.numOfCol === numOfCol
      );
      const [, parentId, columnIndexStr] = over.id.split("-");
      const columnIndex = parseInt(columnIndexStr);

      if (layout && parentId) {
        const parentElement = emailElements.find((el) => el.id === parentId);
        if (parentElement && parentElement.type === "column") {
          const newElement = {
            type: layout.type,
            numOfCol: layout.numOfCol,
            id: `email-element-${Date.now()}`,
          } as unknown as EmailElement;

          // Add the element to the column
          const updatedParent = {
            ...parentElement,
            [columnIndex.toString()]: newElement,
          };

          setEmailElements(
            emailElements.map((el) => (el.id === parentId ? updatedParent : el))
          );
          setSelectedElement(newElement);
        }
      }
    }
    // Handle dropping elements into layout areas
    else if (
      active.id.startsWith("element-") &&
      over.id.startsWith("layout-")
    ) {
      const elementType = active.id.replace("element-", "");
      const element = elements.find((el) => el.type === elementType);
      const parentId = over.id.replace("layout-", "");

      if (element && parentId) {
        const parentElement = emailElements.find((el) => el.id === parentId);
        if (parentElement && parentElement.type === "column") {
          const newElement = {
            ...element,
            id: `email-element-${Date.now()}`,
          } as unknown as EmailElement;

          // Find the first empty column
          let added = false;
          for (let i = 0; i < (parentElement.numOfCol || 2); i++) {
            if (!parentElement[i.toString()]) {
              const updatedParent = {
                ...parentElement,
                [i.toString()]: newElement,
              };

              setEmailElements(
                emailElements.map((el) =>
                  el.id === parentId ? updatedParent : el
                )
              );
              setSelectedElement(newElement);
              added = true;
              break;
            }
          }

          // If no empty column, add to the first column (overwrite)
          if (!added) {
            const updatedParent = {
              ...parentElement,
              "0": newElement,
            };

            setEmailElements(
              emailElements.map((el) =>
                el.id === parentId ? updatedParent : el
              )
            );
            setSelectedElement(newElement);
          }
        }
      }
    }
    // Handle dropping layouts into layout areas
    else if (active.id.startsWith("layout-") && over.id.startsWith("layout-")) {
      const layoutId = active.id.replace("layout-", "");
      const [type, numOfColStr] = layoutId.split("-");
      const numOfCol = parseInt(numOfColStr || "1");
      const layout = layouts.find(
        (l) => l.type === type && l.numOfCol === numOfCol
      );
      const parentId = over.id.replace("layout-", "");

      if (layout && parentId) {
        const parentElement = emailElements.find((el) => el.id === parentId);
        if (parentElement && parentElement.type === "column") {
          const newElement = {
            type: layout.type,
            numOfCol: layout.numOfCol,
            id: `email-element-${Date.now()}`,
          } as unknown as EmailElement;

          // Find the first empty column
          let added = false;
          for (let i = 0; i < (parentElement.numOfCol || 2); i++) {
            if (!parentElement[i.toString()]) {
              const updatedParent = {
                ...parentElement,
                [i.toString()]: newElement,
              };

              setEmailElements(
                emailElements.map((el) =>
                  el.id === parentId ? updatedParent : el
                )
              );
              setSelectedElement(newElement);
              added = true;
              break;
            }
          }

          // If no empty column, add to the first column (overwrite)
          if (!added) {
            const updatedParent = {
              ...parentElement,
              "0": newElement,
            };

            setEmailElements(
              emailElements.map((el) =>
                el.id === parentId ? updatedParent : el
              )
            );
            setSelectedElement(newElement);
          }
        }
      }
    }
    // Handle reordering existing elements
    else if (active.id.startsWith("email-") && over.id.startsWith("email-")) {
      const oldIndex = emailElements.findIndex((el) => el.id === active.id);
      const newIndex = emailElements.findIndex((el) => el.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        setEmailElements(arrayMove(emailElements, oldIndex, newIndex));
      }
    }
  };

  const handleElementSelect = (element: EmailElement) => {
    setSelectedElement(element);
    if (isMobile) {
      setOpenSheet("settings");
    }
  };

  const handleElementUpdate = (updatedElement: EmailElement) => {
    // Check if the element is nested in a column
    let found = false;
    const updatedElements = emailElements.map((el) => {
      if (el.type === "column") {
        const updatedEl = { ...el };
        for (let i = 0; i < (el.numOfCol || 2); i++) {
          if (
            updatedEl[i.toString()] &&
            (updatedEl[i.toString()] as any).id === updatedElement.id
          ) {
            updatedEl[i.toString()] = updatedElement;
            found = true;
          }
        }
        return updatedEl;
      }
      return el;
    });

    if (found) {
      setEmailElements(updatedElements);
    } else {
      // Element is at top level
      setEmailElements(
        emailElements.map((el) =>
          el.id === updatedElement.id ? updatedElement : el
        )
      );
    }
    setSelectedElement(updatedElement);
  };

  const handleElementDelete = (elementId: string) => {
    // Check if the element is nested in a column
    let found = false;
    const updatedElements = emailElements.map((el) => {
      if (el.type === "column") {
        const updatedEl = { ...el };
        for (let i = 0; i < (el.numOfCol || 2); i++) {
          if (
            updatedEl[i.toString()] &&
            (updatedEl[i.toString()] as any).id === elementId
          ) {
            delete updatedEl[i.toString()];
            found = true;
          }
        }
        return updatedEl;
      }
      return el;
    });

    if (found) {
      setEmailElements(updatedElements);
    } else {
      // Element is at top level
      setEmailElements(emailElements.filter((el) => el.id !== elementId));
    }

    if (selectedElement && selectedElement.id === elementId) {
      setSelectedElement(null);
    }
  };

  const moveElementUp = (elementId: string) => {
    const index = emailElements.findIndex((el) => el.id === elementId);
    if (index > 0) {
      setEmailElements(arrayMove(emailElements, index, index - 1));
    }
  };

  const moveElementDown = (elementId: string) => {
    const index = emailElements.findIndex((el) => el.id === elementId);
    if (index < emailElements.length - 1) {
      setEmailElements(arrayMove(emailElements, index, index + 1));
    }
  };

  const handleSaveTemplate = async () => {
    setIsSaving(true);
    try {
      const result = await updateEmailTemplate(
        templateId,
        undefined, // name not updated
        htmlContent,
        emailElements
      );
      if (result.success) {
        toast.success("Email template saved successfully");
      } else {
        toast.error("Failed to save email template");
      }
    } catch (error) {
      console.error("Error saving email template:", error);
      toast.error("Failed to save email template");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-muted/30">
      {/* Main Content with Tabs */}{" "}
      <Tabs
        value={viewMode}
        onValueChange={setViewMode}
        className="flex-1 flex flex-col"
      >
        <div className="border-b bg-background px-4 py-2 flex justify-between items-center">
          <TabsList className="grid w-[180px] grid-cols-2">
            <TabsTrigger value="editor" className="flex items-center gap-1">
              <Edit className="h-3.5 w-3.5" />
              <span>Editor</span>
            </TabsTrigger>

            <TabsTrigger value="preview" className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              <span>Preview</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Code className="h-4 w-4" />
                  <span>HTML</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[600px] p-0" align="end">
                <div className="flex items-center justify-between bg-zinc-950 p-2 rounded-t-md">
                  <span className="text-xs font-mono text-zinc-400">
                    HTML Code
                  </span>
                  <CopyButton value={htmlContent} />
                </div>
                <div className="bg-zinc-950 p-4 rounded-b-md max-h-[400px] overflow-auto">
                  <pre className="text-xs font-mono text-zinc-100 whitespace-pre-wrap">
                    {htmlContent}
                  </pre>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleSaveTemplate}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Saving...</span>
                  <span className="sm:hidden">Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Save Template</span>
                  <span className="sm:hidden">Save</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <TabsContent value="editor" className="flex-1 overflow-hidden m-0 p-0">
          {isDndReady ? (
            <DndContext
              sensors={sensors}
              collisionDetection={customCollisionDetection}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToWindowEdges]}
            >
              <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                {/* Sidebar - Desktop */}
                <div className="w-full md:w-64 border-r bg-background overflow-y-auto hidden md:block custom-scrollbar">
                  <div className="p-4">
                    <h3 className="font-medium text-sm mb-2">Layouts</h3>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {layouts.map((layout) => (
                        <LayoutItem
                          key={`layout-${layout.type}-${layout.numOfCol}`}
                          layout={layout}
                          id={`layout-${layout.type}-${layout.numOfCol}`}
                        />
                      ))}
                    </div>
                    <h3 className="font-medium text-sm mb-2">Elements</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {elements.map((element) => (
                        <ElementItem
                          key={`element-${element.type}`}
                          element={element}
                          id={`element-${element.type}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {/* Main Canvas */}
                <div className="flex-1 overflow-y-auto bg-muted/50 p-6 flex justify-center custom-scrollbar">
                  <div className="bg-white shadow-sm border w-[600px] min-h-[600px]">
                    <SortableContext
                      items={emailElements.map((el) => el.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <DroppableArea
                        elements={emailElements as any}
                        onElementSelect={handleElementSelect as any}
                        onElementDelete={handleElementDelete}
                        onMoveUp={moveElementUp}
                        onMoveDown={moveElementDown}
                        selectedElementId={selectedElement?.id}
                      />
                    </SortableContext>
                  </div>
                </div>
                {/* Properties Panel - Desktop */}
                {selectedElement && (
                  <div className="w-full md:w-72 border-l bg-background overflow-y-auto hidden md:block custom-scrollbar">
                    <div className="p-4 border-b flex items-center justify-between">
                      <h3 className="font-medium">Settings</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedElement(null)}
                      >
                        Close
                      </Button>
                    </div>

                    <PropertyPanel
                      element={selectedElement as any}
                      onUpdate={handleElementUpdate as any}
                    />
                  </div>
                )}
                {/* Drag Overlay */}
                <DragOverlay>
                  {activeId &&
                    activeId.startsWith("element-") &&
                    (() => {
                      const elementType = activeId.replace("element-", "");
                      const element = elements.find(
                        (el) => el.type === elementType
                      );
                      if (element) {
                        return (
                          <div className="bg-background border rounded-md p-3 shadow-md opacity-80 w-48">
                            <div className="flex items-center gap-2">
                              <element.icon className="h-4 w-4" />
                              <span>{element.label}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  {activeId &&
                    activeId.startsWith("layout-") &&
                    (() => {
                      const layoutId = activeId.replace("layout-", "");
                      const [type, numOfColStr] = layoutId.split("-");
                      const numOfCol = parseInt(numOfColStr || "1");
                      const layout = layouts.find(
                        (l) => l.type === type && l.numOfCol === numOfCol
                      );
                      if (layout) {
                        return (
                          <div className="bg-background border rounded-md p-3 shadow-md opacity-80 w-48">
                            <div className="flex items-center gap-2">
                              <layout.icon className="h-4 w-4" />
                              <span>{layout.label}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                </DragOverlay>
              </div>
            </DndContext>
          ) : (
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-pulse text-center">
                  <div className="h-8 w-32 bg-muted rounded mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading editor...</p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="preview" className="flex-1 overflow-hidden m-0 p-0">
          <div className="h-full w-full flex justify-center bg-muted/50 p-6 overflow-auto">
            <div className="bg-white shadow-sm border w-[600px] h-full overflow-auto">
              {htmlContent ? (
                <iframe
                  ref={previewIframeRef}
                  srcDoc={htmlContent}
                  title="Email Preview"
                  className="w-full h-full border-0"
                  sandbox="allow-same-origin"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <div className="text-muted-foreground mb-2">
                    <Eye className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <h3 className="font-medium">No content to preview</h3>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Add elements to your email template to see a preview
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      {/* Mobile Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-2 flex justify-around">
          <Button
            variant={openSheet === "elements" ? "default" : "outline"}
            size="sm"
            onClick={() =>
              setOpenSheet(openSheet === "elements" ? "" : "elements")
            }
            className="flex-1 mx-1"
          >
            <span className="mr-2">+</span>
            Elements
          </Button>
          <Button
            variant={openSheet === "settings" ? "default" : "outline"}
            size="sm"
            onClick={() =>
              setOpenSheet(openSheet === "settings" ? "" : "settings")
            }
            className="flex-1 mx-1"
            disabled={!selectedElement}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      )}
      {/* Elements Sheet for Mobile */}
      <Sheet
        open={openSheet === "elements"}
        onOpenChange={(open) => !open && setOpenSheet("")}
      >
        <SheetContent side="left" className="w-full sm:max-w-md p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Elements</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto h-full pb-20 custom-scrollbar">
            <div className="p-4">
              <h3 className="font-medium text-sm mb-2">Layouts</h3>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {layouts.map((layout) => (
                  <LayoutItem
                    key={`layout-${layout.type}-${layout.numOfCol}`}
                    layout={layout}
                    id={`layout-${layout.type}-${layout.numOfCol}`}
                  />
                ))}
              </div>
              <h3 className="font-medium text-sm mb-2">Elements</h3>
              <div className="grid grid-cols-2 gap-2">
                {elements.map((element) => (
                  <ElementItem
                    key={`element-${element.type}`}
                    element={element}
                    id={`element-${element.type}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      {/* Settings Sheet for Mobile */}
      <Sheet
        open={openSheet === "settings"}
        onOpenChange={(open) => !open && setOpenSheet("")}
      >
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Element Settings</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto h-full pb-20 custom-scrollbar">
            <PropertyPanel
              element={selectedElement as any}
              onUpdate={handleElementUpdate as any}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense>
      <Editor />
    </Suspense>
  );
}
