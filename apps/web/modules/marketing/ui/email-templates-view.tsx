"use client";

import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { useEffect, useState } from "react";
import {
  getEmailTemplatesByAgentId,
  createEmailTemplate,
  deleteEmailTemplate,
  generateEmailSchema,
} from "@workspace/database";
import { usePathname, useRouter } from "next/navigation";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Mail, Edit, Plus, Trash2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { generateHtmlFromElements } from "@/lib/html-generator";
import { toast } from "sonner";

const stripHtml = (html: string) => {
  return html.replace(/<[^>]*>/g, "").substring(0, 100) + "...";
};

export const EmailTemplatesView = () => {
  const pathname = usePathname();
  const router = useRouter();
  const agentId = pathname.split("/")[2];
  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setLoading(true);
    getEmailTemplatesByAgentId(agentId!)
      .then((data) => {
        setEmailTemplates(data.emailTemplates || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [agentId]);

  const handleCreateTemplate = async () => {
    if (!templateName.trim() || !prompt.trim()) return;

    setCreating(true);
    const schemaResult = await generateEmailSchema(prompt);
    if (!schemaResult.success) {
      toast.error("Failed to generate schema");
      setCreating(false);
      return;
    }
    const htmlContent = generateHtmlFromElements(schemaResult.schema);
    const result = await createEmailTemplate(
      agentId!,
      templateName,
      htmlContent,
      schemaResult.schema
    );

    if (result.success) {
      setEmailTemplates([result.emailTemplate, ...emailTemplates]);
      setTemplateName("");
      setPrompt("");
      setCreateDialogOpen(false);
      toast.success("Email template created successfully");
    } else {
      toast.error("Failed to create email template");
    }
    setCreating(false);
  };

  const handleDeleteTemplate = async (id: string) => {
    const result = await deleteEmailTemplate(id);
    if (result.success) {
      setEmailTemplates(emailTemplates.filter((t) => t.id !== id));
      toast.success("Email template deleted successfully");
    } else {
      toast.error("Failed to delete email template");
    }
  };

  return (
    <div className="flex flex-col gap-y-6 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Email Templates</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all email templates for this agent
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Create Email Template
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="template-name"
                    className="flex items-center gap-2 text-base font-medium"
                  >
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Template Name
                  </Label>
                  <Input
                    id="template-name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., Welcome Email, Product Launch"
                    className="h-10"
                  />
                  <p className="text-sm text-muted-foreground">
                    Give your email template a unique and descriptive name.
                  </p>
                </div>
                <div className="space-y-3">
                  <Label
                    htmlFor="prompt"
                    className="flex items-center gap-2 text-base font-medium"
                  >
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                    AI Generation Prompt
                  </Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the email you want to create. Include details like purpose, tone, key messages, and any specific elements."
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-sm text-muted-foreground">
                    Provide a detailed prompt for the AI to generate the email
                    schema. Be specific about the content, style, and structure.
                  </p>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateTemplate}
                    disabled={
                      creating || !templateName.trim() || !prompt.trim()
                    }
                    className="px-6"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Template"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <div className="flex items-center gap-2 rounded-lg bg-background px-3 py-2 shadow-sm">
            <div className="text-sm font-medium">Total Templates</div>
            <div className="text-xl font-bold text-primary">
              {emailTemplates.length}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-background shadow-sm">
        <ScrollArea className="h-[60vh]">
          {loading ? (
            <SkeletonTemplates />
          ) : emailTemplates.length === 0 ? (
            <div className="flex h-[60vh] items-center justify-center">
              <div className="text-center">
                <Mail className="mx-auto h-16 w-16 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No templates yet</h3>
                <p className="mt-2 text-muted-foreground">
                  Email templates will appear here once created
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {emailTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="group hover:shadow-xl hover:scale-105 transition-all duration-300 border border-border bg-gradient-to-br from-card to-muted/10 hover:from-card hover:to-primary/5 m-4"
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <span className="truncate text-xl">{template.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
                        onClick={() => router.push(`/editor/${template.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

const SkeletonTemplates = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="border border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
