"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";

type Defaults = {
  conversationStartMessage: string | null;
  suggestion: unknown | null;
  links: unknown | null;
};

type QuickLink = {
  imageurl: string;
  description: string;
  link: string;
};

function coerceQuickLinks(value: unknown): QuickLink[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((v) => {
        if (v && typeof v === "object") {
          const o = v as any;
          return {
            imageurl: typeof o.imageurl === "string" ? o.imageurl : "",
            description: typeof o.description === "string" ? o.description : "",
            link: typeof o.link === "string" ? o.link : "",
          } as QuickLink;
        }
        return { imageurl: "", description: "", link: "" } as QuickLink;
      })
      .filter(Boolean);
  }
  return [];
}

function coerceSuggestions(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((v) => (typeof v === "string" ? v : ""));
  }
  return [];
}

export default function SettingsForm({
  defaults,
  action,
}: {
  defaults: Defaults | null;
  action: (formData: FormData) => Promise<void>;
}) {
  const pathname = usePathname();

  const agentId = React.useMemo(() => {
    // Extract per requirement: agentId can be retrieved from pathname.split()[3]
    // We make it robust while still using split-based logic.
    const parts = (pathname || "").split("/").filter(Boolean);
    const idx = parts.indexOf("agent");
    const id = idx >= 0 ? parts[idx + 1] : parts[2] || "";
    return id || "";
  }, [pathname]);

  const [conversationStartMessage, setConversationStartMessage] =
    React.useState<string>(
      (defaults?.conversationStartMessage as string) || ""
    );

  // Suggestions as array of strings with +/- controls
  const [suggestionsArray, setSuggestionsArray] = React.useState<string[]>(
    coerceSuggestions(defaults?.suggestion)
  );

  // Quick Links as an array UI (imageurl, description, link) with +/- controls
  const [linksArray, setLinksArray] = React.useState<QuickLink[]>(
    coerceQuickLinks(defaults?.links)
  );

  const [pending, setPending] = React.useState(false);

  const beautify = (current: string, fieldLabel: string) => {
    if (!current.trim()) {
      toast.info(`${fieldLabel} is empty`);
      return current;
    }
    try {
      const parsed = JSON.parse(current);
      toast.success(`${fieldLabel} beautified`);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      toast.error(`${fieldLabel} is not valid JSON`);
      return current;
    }
  };

  const validateJsonIfPresent = (text: string, fieldName: string): boolean => {
    if (!text.trim()) return true;
    try {
      JSON.parse(text);
      return true;
    } catch {
      toast.error(`${fieldName} must be valid JSON`);
      return false;
    }
  };

  const serializedLinksJson = React.useMemo(
    () => JSON.stringify(linksArray),
    [linksArray]
  );

  const serializedSuggestionsJson = React.useMemo(
    () => JSON.stringify(suggestionsArray),
    [suggestionsArray]
  );

  const addLink = () => {
    setLinksArray((prev) => [
      ...prev,
      { imageurl: "", description: "", link: "" },
    ]);
  };

  const removeLink = (index: number) => {
    setLinksArray((prev) => prev.filter((_, i) => i !== index));
  };

  const updateLink =
    (index: number, key: keyof QuickLink) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLinksArray((prev) => {
        const next = [...prev];
        const current: QuickLink = next[index] ?? {
          imageurl: "",
          description: "",
          link: "",
        };
        const updated: QuickLink = {
          imageurl: key === "imageurl" ? value : current.imageurl,
          description: key === "description" ? value : current.description,
          link: key === "link" ? value : current.link,
        };
        next[index] = updated;
        return next;
      });
    };

  // Suggestion item helpers
  const addSuggestion = () => {
    setSuggestionsArray((prev) => [...prev, ""]);
  };

  const removeSuggestion = (index: number) => {
    setSuggestionsArray((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSuggestion =
    (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSuggestionsArray((prev) => {
        const next = [...prev];
        next[index] = value;
        return next;
      });
    };

  const loadExampleLinks = () => {
    setLinksArray([
      {
        imageurl:
          "https://images.unsplash.com/photo-1557264337-e8a93017fe92?w=400&auto=format&fit=crop&q=60",
        description: "Documentation",
        link: "https://docs.example.com",
      },
      {
        imageurl:
          "https://images.unsplash.com/photo-1560472355-536de3962603?w=400&auto=format&fit=crop&q=60",
        description: "Pricing",
        link: "https://example.com/pricing",
      },
    ]);
  };

  const loadExampleSuggestions = () => {
    setSuggestionsArray([
      "What are your pricing plans?",
      "Book a demo",
      "Talk to sales",
    ]);
  };

  async function onAction(formData: FormData) {
    setPending(true);
    try {
      await action(formData);
      toast.success("Widget settings saved");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save settings");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 to-gray-100 p-6 pt-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Widget Customisation
          </h1>
          <p className="text-gray-600">
            Tailor your support widget's greeting, suggestions and quick links.
          </p>
        </div>

        <form
          action={onAction}
          className="space-y-8"
          onSubmit={(e) => {
            // no-op: suggestions and links are structured inputs
          }}
        >
          {/* Agent ID for the server action */}
          <input type="hidden" name="agentId" value={agentId} />

          {/* Hidden structured fields */}
          <input
            type="hidden"
            name="suggestion"
            value={serializedSuggestionsJson}
          />
          <input type="hidden" name="links" value={serializedLinksJson} />

          <Card className="border-0 shadow-lg bg-gradient-to-b from-white to-gray-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">Conversation Start</CardTitle>
              <CardDescription>
                The first message shown to users when they open your widget.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="conversationStartMessage">Start message</Label>
                <Textarea
                  id="conversationStartMessage"
                  name="conversationStartMessage"
                  placeholder="Hi! How can I help you today?"
                  value={conversationStartMessage}
                  onChange={(e) => setConversationStartMessage(e.target.value)}
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">
                  Keep it concise and friendly.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg bg-gradient-to-b from-white to-gray-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Suggestions</CardTitle>
                <CardDescription>
                  An array of suggestion prompts shown in the widget.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {suggestionsArray.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No suggestions added yet.
                  </p>
                ) : null}

                <div className="grid gap-3">
                  {suggestionsArray.map((text, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border p-3 bg-white/70 flex items-center gap-3"
                    >
                      <div className="grow">
                        <Label
                          htmlFor={`suggestion-${idx}`}
                          className="sr-only"
                        >
                          Suggestion {idx + 1}
                        </Label>
                        <Input
                          id={`suggestion-${idx}`}
                          placeholder="Type a helpful prompt..."
                          value={text}
                          onChange={updateSuggestion(idx)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => removeSuggestion(idx)}
                        aria-label={`Remove suggestion ${idx + 1}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={addSuggestion}>
                  <Plus className="size-4 mr-1.5" /> Add suggestion
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={loadExampleSuggestions}
                >
                  Load examples
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-b from-white to-gray-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Quick Links</CardTitle>
                <CardDescription>
                  An array of objects with imageurl, description and link. Use
                  the controls to add or remove items; data will be saved as
                  JSON.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {linksArray.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No quick links added yet.
                  </p>
                ) : null}

                <div className="grid gap-4">
                  {linksArray.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border p-4 bg-white/70 grid gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm text-gray-700">
                          Link {idx + 1}
                        </h4>
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => removeLink(idx)}
                          aria-label={`Remove link ${idx + 1}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                          <Label htmlFor={`imageurl-${idx}`}>Image URL</Label>
                          <Input
                            id={`imageurl-${idx}`}
                            placeholder="https://..."
                            value={item.imageurl}
                            onChange={updateLink(idx, "imageurl")}
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <Label htmlFor={`link-${idx}`}>Link</Label>
                          <Input
                            id={`link-${idx}`}
                            placeholder="https://example.com/page"
                            value={item.link}
                            onChange={updateLink(idx, "link")}
                          />
                        </div>
                      </div>

                      <div className="grid gap-1.5">
                        <Label htmlFor={`description-${idx}`}>
                          Description
                        </Label>
                        <Input
                          id={`description-${idx}`}
                          placeholder="Short description"
                          value={item.description}
                          onChange={updateLink(idx, "description")}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={addLink}>
                  <Plus className="size-4 mr-1.5" /> Add link
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={loadExampleLinks}
                >
                  Load examples
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setConversationStartMessage(
                  defaults?.conversationStartMessage || ""
                );
                setSuggestionsArray(coerceSuggestions(defaults?.suggestion));
                setLinksArray(coerceQuickLinks(defaults?.links));
                toast.info("Reverted to last saved values");
              }}
            >
              Reset
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
