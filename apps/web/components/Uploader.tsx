"use client";

import { FileRejection, useDropzone } from "react-dropzone";
import { useCallback, useState, useEffect } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import {
  Loader2,
  Trash2,
  FileText,
  File,
  Upload,
  X,
  ExternalLink,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import { Separator } from "@workspace/ui/components/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

export function Uploader() {
  const { user } = useUser();
  const [files, setFiles] = useState<
    Array<{
      id: string;
      file: File;
      uploading: boolean;
      progress: number;
      key?: string;
      isDeleting: boolean;
      error: boolean;
    }>
  >([]);
  const [existingFiles, setExistingFiles] = useState<
    Array<{
      id: string;
      fileName: string;
      fileUrl: string;
      userId: string;
      processed?: boolean;
      isDeleting?: boolean;
    }>
  >([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  async function removeFile(fileId: string) {
    try {
      const fileToRemove = files.find((f) => f.id === fileId);

      if (!fileToRemove?.key) {
        toast.error("File key not found. Cannot delete file.");
        return;
      }

      setFiles((prevFiles) =>
        prevFiles.map((f) => (f.id === fileId ? { ...f, isDeleting: true } : f))
      );

      const response = await fetch("/api/s3/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: fileToRemove.key }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || "Failed to remove file from storage.");
        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.id === fileId ? { ...f, isDeleting: false, error: true } : f
          )
        );
        return;
      }

      // Delete from database
      if (user?.id) {
        try {
          const response = await fetch("/api/files", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileUrl: `${process.env.NEXT_PUBLIC_AWS_ENDPOINT_URL_S3}/${fileToRemove.key}`,
            }),
          });
          if (!response.ok) {
            throw new Error("Failed to delete from database");
          }
          // Refresh existing files list
          const filesResponse = await fetch("/api/files");
          if (filesResponse.ok) {
            const files = await filesResponse.json();
            setExistingFiles(files);
          }
        } catch (dbError) {
          console.error("Failed to delete from database:", dbError);
          toast.error(
            "File removed from storage but failed to delete from database"
          );
        }
      }

      setFiles((prevFiles) => prevFiles.filter((f) => f.id !== fileId));
      toast.success("File removed successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to remove file from storage.");
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.id === fileId ? { ...f, isDeleting: false, error: true } : f
        )
      );
    }
  }

  async function removeExistingFile(fileId: string, fileUrl: string) {
    try {
      // Extract key from fileUrl
      const urlParts = fileUrl.split("/");
      const key = urlParts[urlParts.length - 1];

      if (!key) {
        toast.error("File key not found in URL. Cannot delete file.");
        return;
      }

      // Optimistically update UI
      setExistingFiles((prevFiles) =>
        prevFiles.map((f) => (f.id === fileId ? { ...f, isDeleting: true } : f))
      );

      // Delete from S3
      const response = await fetch("/api/s3/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Failed to remove file from storage."
        );
      }

      // Delete from database
      if (user?.id) {
        try {
          const response = await fetch("/api/files", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileUrl }),
          });
          if (!response.ok) {
            throw new Error("Failed to delete from database");
          }
          // Refresh existing files list
          const filesResponse = await fetch("/api/files");
          if (filesResponse.ok) {
            const files = await filesResponse.json();
            setExistingFiles(files);
          }
        } catch (dbError) {
          console.error("Failed to delete from database:", dbError);
          toast.error(
            "File removed from storage but failed to delete from database"
          );
          // Revert optimistic update
          const filesResponse = await fetch("/api/files");
          if (filesResponse.ok) {
            const files = await filesResponse.json();
            setExistingFiles(files);
          }
          return;
        }
      }

      // Remove from existingFiles state
      setExistingFiles((prevFiles) => prevFiles.filter((f) => f.id !== fileId));
      toast.success("File removed successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to remove file: " + (error as Error).message);
      // Revert optimistic update
      const filesResponse = await fetch("/api/files");
      if (filesResponse.ok) {
        const files = await filesResponse.json();
        setExistingFiles(files);
      }
    }
  }

  const uploadFile = async (file: File) => {
    setFiles((prevFiles) =>
      prevFiles.map((f) => (f.file === file ? { ...f, uploading: true } : f))
    );

    try {
      // 1. Get presigned URL
      const presignedResponse = await fetch("/api/s3/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });

      if (!presignedResponse.ok) {
        toast.error("Failed to get presigned URL");

        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.file === file
              ? { ...f, uploading: false, progress: 0, error: true }
              : f
          )
        );

        return;
      }

      const { presignedUrl, key } = await presignedResponse.json();

      // Set the key immediately
      setFiles((prevFiles) =>
        prevFiles.map((f) => (f.file === file ? { ...f, key: key } : f))
      );

      // 2. Upload file to S3

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setFiles((prevFiles) =>
              prevFiles.map((f) =>
                f.file === file
                  ? { ...f, progress: Math.round(percentComplete) }
                  : f
              )
            );
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 204) {
            // 3. File fully uploaded - set progress to 100
            setFiles((prevFiles) =>
              prevFiles.map((f) =>
                f.file === file
                  ? { ...f, progress: 100, uploading: false, error: false }
                  : f
              )
            );

            toast.success("File uploaded successfully");
            resolve();
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Upload failed"));
        };

        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      // 3. Update database after successful upload
      if (user?.id) {
        try {
          const fileUrl = `${process.env.NEXT_PUBLIC_AWS_ENDPOINT_URL_S3}/${key}`;
          const response = await fetch("/api/files", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileName: file.name, fileUrl }),
          });
          if (!response.ok) {
            throw new Error("Failed to save to database");
          }
          // Refresh existing files list
          const filesResponse = await fetch("/api/files");
          if (filesResponse.ok) {
            const files = await filesResponse.json();
            setExistingFiles(files);
          }
        } catch (dbError) {
          console.error("Failed to update database:", dbError);
          toast.error("File uploaded but failed to save to database");
        }
      }
    } catch {
      toast.error("Something went wrong");

      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.file === file
            ? { ...f, uploading: false, progress: 0, error: true }
            : f
        )
      );
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length) {
      setFiles((prevFiles) => [
        ...prevFiles,
        ...acceptedFiles.map((file) => ({
          id: uuidv4(),
          file,
          uploading: false,
          progress: 0,
          isDeleting: false,
          error: false,
        })),
      ]);

      acceptedFiles.forEach(uploadFile);
    }
  }, []);

  const rejectedFiles = useCallback((fileRejection: FileRejection[]) => {
    if (fileRejection.length) {
      const toomanyFiles = fileRejection.find(
        (rejection) => rejection.errors[0]?.code === "too-many-files"
      );

      const fileSizetoBig = fileRejection.find(
        (rejection) => rejection.errors[0]?.code === "file-too-large"
      );

      if (toomanyFiles) {
        toast.error("Too many files selected, max is 5");
      }

      if (fileSizetoBig) {
        toast.error("File size exceeds 5mb limit");
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: rejectedFiles,
    maxFiles: 5,
    maxSize: 1024 * 1024 * 10, // 10mb
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
    },
  });

  useEffect(() => {
    return () => {
      // Cleanup if needed
    };
  }, [files]);

  useEffect(() => {
    const fetchExistingFiles = async () => {
      if (!user?.id) return;

      setLoadingFiles(true);
      try {
        const response = await fetch("/api/files");
        if (!response.ok) {
          throw new Error("Failed to fetch files");
        }
        const files = await response.json();
        setExistingFiles(files);
      } catch (error) {
        console.error("Failed to fetch files:", error);
        toast.error("Failed to load existing files");
      } finally {
        setLoadingFiles(false);
      }
    };

    fetchExistingFiles();
  }, [user?.id]);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card
          {...getRootProps()}
          className={cn(
            "relative border-2 border-dashed transition-all duration-200 ease-in-out cursor-pointer",
            isDragActive
              ? "border-primary bg-primary/5 scale-[1.02] shadow-lg"
              : "border-muted-foreground/25 hover:border-primary hover:bg-primary/5"
          )}
        >
          <CardHeader className="text-center pb-2">
            <CardTitle className="flex items-center justify-center gap-2 text-lg">
              <Upload className="w-5 h-5" />
              Upload Source Files
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-muted">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              {isDragActive ? (
                <div className="text-center">
                  <p className="text-lg font-medium text-primary">
                    Drop your files here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Release to upload
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <p className="text-base">Drag and drop your files here</p>
                  <p className="text-sm text-muted-foreground">or</p>
                  <Button variant="outline" size="sm">
                    Browse Files
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supports PDF and TXT files (max 10MB each)
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Uploaded Files ({files.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {files.map(
                ({ id, file, uploading, progress, isDeleting, error }) => {
                  const isPdf = file.type === "application/pdf";
                  const isTxt = file.type === "text/plain";
                  const Icon = isPdf ? File : isTxt ? FileText : File;

                  return (
                    <div key={id} className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="p-2 rounded-md bg-background">
                            <Icon className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {file.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {isPdf ? "PDF" : isTxt ? "TXT" : "File"}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {uploading && !isDeleting && (
                            <div className="flex items-center gap-2 min-w-[100px]">
                              <Progress value={progress} className="w-16 h-2" />
                              <span className="text-xs text-muted-foreground w-8">
                                {progress}%
                              </span>
                            </div>
                          )}
                          {error && (
                            <Badge variant="destructive" className="text-xs">
                              Error
                            </Badge>
                          )}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(id)}
                                disabled={isDeleting}
                                className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                              >
                                {isDeleting ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <X className="w-4 h-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Remove file</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                      {uploading && !isDeleting && (
                        <Progress value={progress} className="w-full h-1" />
                      )}
                    </div>
                  );
                }
              )}
            </CardContent>
          </Card>
        )}

        {/* Existing Files Section */}
        {(existingFiles.length > 0 || loadingFiles) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Your Uploaded Files ({existingFiles.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingFiles ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Loading files...</span>
                </div>
              ) : (
                existingFiles.map((file) => {
                  const isPdf = file.fileName.toLowerCase().endsWith(".pdf");
                  const isTxt = file.fileName.toLowerCase().endsWith(".txt");
                  const Icon = isPdf ? File : isTxt ? FileText : File;
                  const isDeleting = file.isDeleting ?? false;

                  return (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 rounded-md bg-background">
                          <Icon className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {file.fileName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {isPdf ? "PDF" : isTxt ? "TXT" : "File"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                removeExistingFile(file.id, file.fileUrl)
                              }
                              disabled={isDeleting || file.processed}
                              className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                            >
                              {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete file</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="h-8 w-8 p-0"
                            >
                              <a
                                href={file.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View file</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
}
