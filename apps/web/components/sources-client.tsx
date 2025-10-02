"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getFilesByUserId, updateFileAgent } from "@workspace/database";
import { Button } from "@workspace/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { FileText, Plus, X, Upload, Play } from "lucide-react";
import Link from "next/link";

interface File {
  id: string;
  fileName: string;
  fileUrl: string;
  agentId: string | null;
  processed: boolean;
}

interface SourcesClientProps {
  agentId: string;
}

export default function SourcesClient({ agentId }: SourcesClientProps) {
  const { userId } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingFileId, setProcessingFileId] = useState<string | null>(null);
  const [processingAll, setProcessingAll] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserFiles();
    }
  }, [userId]);

  const fetchUserFiles = async () => {
    try {
      setLoading(true);
      const userFiles = await getFilesByUserId(userId!);
      setFiles(userFiles);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("Failed to fetch files");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToAgent = async (fileId: string) => {
    try {
      await updateFileAgent(fileId, agentId);
      // Update the local state
      setFiles(
        files.map((file) => (file.id === fileId ? { ...file, agentId } : file))
      );
      toast.success("File added to agent knowledge");
    } catch (error) {
      console.error("Error adding file to agent:", error);
      toast.error("Failed to add file to agent knowledge");
    }
  };

  const handleRemoveFromAgent = async (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (file?.processed) {
      toast.error("Cannot remove processed files from agent");
      return;
    }

    try {
      await updateFileAgent(fileId, null);
      // Update the local state
      setFiles(
        files.map((file) =>
          file.id === fileId ? { ...file, agentId: null } : file
        )
      );
      toast.success("File removed from agent knowledge");
    } catch (error) {
      console.error("Error removing file from agent:", error);
      toast.error("Failed to remove file from agent knowledge");
    }
  };

  const handleProcessFile = async (file: File) => {
    if (processingFileId) return;

    setProcessingFileId(file.id);
    try {
      const response = await fetch("/api/process-files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId: file.id,
          url: file.fileUrl,
          filename: file.fileName,
          agentId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process file");
      }

      // Update local state
      setFiles(
        files.map((f) => (f.id === file.id ? { ...f, processed: true } : f))
      );
      toast.success(`File "${file.fileName}" processed successfully`);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error(
        `Failed to process file: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setProcessingFileId(null);
    }
  };

  const handleProcessAllFiles = async () => {
    const agentFiles = files.filter(
      (f) => f.agentId === agentId && !f.processed
    );
    if (agentFiles.length === 0) {
      toast.error("No unprocessed files to process");
      return;
    }

    setProcessingAll(true);
    try {
      for (const file of agentFiles) {
        await handleProcessFile(file);
      }
      toast.success("All files processed successfully");
    } catch (error) {
      console.error("Error processing all files:", error);
    } finally {
      setProcessingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 border rounded-lg bg-card"
            >
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="border border-border/50 shadow-lg bg-card">
        <CardHeader className="px-6 pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-black">
                Agent Sources
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Manage and organize files that power your agent's knowledge base
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="h-9">
              <Link href="/dashboard/upload-sources">
                <Upload className="h-4 w-4 mr-2" />
                Upload New
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-xl bg-muted/30">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No sources yet</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Add files to give your agent access to custom knowledge and
                improve its responses.
              </p>
              <Button asChild className="gap-2">
                <Link href="/dashboard/upload-sources">
                  <Upload className="h-4 w-4" />
                  Upload Your First Source
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/20">
                  <TableRow>
                    <TableHead className="pl-6 font-semibold text-primary/80">
                      Source
                    </TableHead>
                    <TableHead className="font-semibold text-primary/80">
                      Status
                    </TableHead>
                    <TableHead className="text-right pr-6 font-semibold text-primary/80">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.map((file) => (
                    <TableRow
                      key={file.id}
                      className="border-b border-border/20 hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {file.fileName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ID: {file.id.slice(-8)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col gap-1">
                          {file.agentId === agentId ? (
                            <Badge
                              variant="default"
                              className="bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/10"
                            >
                              Active for this agent
                            </Badge>
                          ) : file.agentId ? (
                            <Badge
                              variant="secondary"
                              className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20 hover:bg-yellow-500/10"
                            >
                              Used by another agent
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-border text-muted-foreground"
                            >
                              Available
                            </Badge>
                          )}
                          {file.processed && (
                            <Badge
                              variant="default"
                              className="bg-blue-500/10 text-blue-700 border-blue-500/20 hover:bg-blue-500/10"
                            >
                              Processed
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6 py-4">
                        <div className="flex gap-2 justify-end">
                          {file.agentId === agentId ? (
                            <>
                              {!file.processed && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleProcessFile(file)}
                                  disabled={processingFileId === file.id}
                                  className="gap-1 h-8 px-3 text-xs border-border hover:bg-primary/5"
                                >
                                  {processingFileId === file.id ? (
                                    "Processing..."
                                  ) : (
                                    <>
                                      <Play className="h-3 w-3" />
                                      Process
                                    </>
                                  )}
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveFromAgent(file.id)}
                                disabled={file.processed}
                                className="gap-1 h-8 px-3 text-xs border-border hover:bg-destructive/5"
                              >
                                <X className="h-3 w-3" />
                                Remove
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleAddToAgent(file.id)}
                              disabled={!!file.agentId}
                              className="gap-1 h-8 px-3 text-xs"
                            >
                              <Plus className="h-3 w-3" />
                              Add to Agent
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {files.length > 0 && (
                <div className="px-6 py-4 bg-muted/20 border-t border-border/20">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {files.filter((f) => f.agentId === agentId).length} of{" "}
                      {files.length} sources active for this agent
                      {files.filter((f) => f.agentId === agentId && f.processed)
                        .length > 0 && (
                        <span className="ml-2">
                          •{" "}
                          {
                            files.filter(
                              (f) => f.agentId === agentId && f.processed
                            ).length
                          }{" "}
                          processed
                        </span>
                      )}
                    </p>
                    {files.filter((f) => f.agentId === agentId && !f.processed)
                      .length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleProcessAllFiles}
                        disabled={processingAll || processingFileId !== null}
                        className="gap-1 h-8 px-3 text-xs"
                      >
                        {processingAll ? (
                          "Processing All..."
                        ) : (
                          <>
                            <Play className="h-3 w-3" />
                            Process All (
                            {
                              files.filter(
                                (f) => f.agentId === agentId && !f.processed
                              ).length
                            }
                            )
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
