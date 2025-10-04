"use client";

import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { useEffect, useState } from "react";
import { getEmailTemplatesByAgentId } from "@workspace/database";
import { usePathname } from "next/navigation";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Mail, Edit } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";

const stripHtml = (html: string) => {
  return html.replace(/<[^>]*>/g, "").substring(0, 100) + "...";
};

export const EmailTemplatesView = () => {
  const pathname = usePathname();
  const agentId = pathname.split("/")[2];
  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex flex-col gap-y-6 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Email Templates</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all email templates for this agent
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-background px-3 py-2 shadow-sm">
          <div className="text-sm font-medium">Total Templates</div>
          <div className="text-xl font-bold text-primary">
            {emailTemplates.length}
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
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Template
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{template.name}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                          <div
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{
                              __html: template.htmlContent,
                            }}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
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
