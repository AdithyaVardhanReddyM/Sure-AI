"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Upload,
  FileText,
  User,
  Mail,
  Play,
  CheckCircle,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { createCandidate } from "@workspace/database";
import { Progress } from "@workspace/ui/components/progress";

interface TakeInterviewClientProps {
  interviewId: string;
  interview: {
    id: string;
    clerkId: string;
    replicaId: string;
    personaId: string;
    systemPrompt: string;
    Context: string | null;
  };
}

export default function TakeInterviewClient({
  interviewId,
  interview,
}: TakeInterviewClientProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === "application/pdf") {
      setResumeFile(file);

      const extractTextFromPDF = async (file: File) => {
        try {
          const pdfjsLib = await import("pdfjs-dist");
          const { GlobalWorkerOptions, getDocument } = pdfjsLib as any;

          GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

          const arrayBuffer = await file.arrayBuffer();
          const pdf = await getDocument({ data: arrayBuffer }).promise;

          let fullText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item: any) => item.str)
              .join(" ");
            fullText += `\n${pageText}`;
          }

          setResumeText(fullText);
          console.log("Resume PDF extracted text:", fullText);
        } catch (error) {
          console.error("Error processing PDF:", error);
          setResumeText(`Error processing ${file.name}: ${error}`);
        }
      };

      extractTextFromPDF(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  const handleStartInterview = async () => {
    if (!name.trim() || !email.trim() || !resumeFile) return;

    setIsStarting(true);

    try {
      // Make API call to Tavus first
      const apiKey = process.env.NEXT_PUBLIC_TAVUS_API_KEY;
      if (!apiKey) {
        throw new Error("Tavus API key not configured");
      }

      const response = await fetch("https://tavusapi.com/v2/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          replica_id: interview.replicaId,
          persona_id: interview.personaId,
          conversational_context: `Resume text: ${resumeText}`,
          callback_url: "https://sure-ai.vercel.app/api/events/tavus",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Tavus API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Tavus response:", data);

      // Create candidate in database with conversationId
      const result = await createCandidate({
        name: name.trim(),
        email: email.trim(),
        interviewId,
        conversationId: data.conversation_id,
        resumeText,
      });

      if (result.success) {
        console.log("Candidate created:", result.candidate);
        console.log("Resume text:", resumeText);

        setConversationUrl(data.conversation_url);
      } else {
        alert("Failed to start interview. Please try again.");
      }
    } catch (error) {
      console.error("Error starting interview:", error);
      alert(
        `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsStarting(false);
    }
  };

  const isFormValid = name.trim() && email.trim() && resumeFile;
  const progress =
    (((name.trim() ? 1 : 0) + (email.trim() ? 1 : 0) + (resumeFile ? 1 : 0)) /
      3) *
    100;

  if (conversationUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-8 animate-in fade-in-0 duration-700">
          {/* Success Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Interview Started Successfully!
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                Click the link below to join your interview
              </p>
            </div>
          </div>

          {/* Success Card */}
          <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-500">
            <CardContent className="p-8 text-center space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Your Interview Link</h2>
                <p className="text-muted-foreground">
                  Visit the link below to complete your interview with our AI
                  interviewer.
                </p>
              </div>
              <a
                href={conversationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Play className="w-5 h-5" />
                Join Interview
                <ExternalLink className="w-4 h-4" />
              </a>
              <p className="text-sm text-muted-foreground">
                This link will take you to a secure video interview session.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8 animate-in fade-in-0 duration-700">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-full shadow-lg animate-pulse">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Welcome to Your Interview
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              Please provide your information to begin
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-500 delay-300">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl text-center">
              Candidate Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Name Input */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 text-lg transition-all duration-200 hover:shadow-md focus:shadow-lg"
              />
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-lg transition-all duration-200 hover:shadow-md focus:shadow-lg"
              />
            </div>

            {/* Resume Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Resume (PDF only)
              </Label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : resumeFile
                      ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                      : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <input {...getInputProps()} />
                {resumeFile ? (
                  <div className="space-y-2">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                    <p className="text-lg font-medium text-green-700 dark:text-green-400">
                      {resumeFile.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Resume uploaded successfully
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                    <p className="text-lg font-medium">
                      {isDragActive
                        ? "Drop your resume here"
                        : "Upload your resume"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Drag & drop your PDF file here, or click to browse
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Start Interview Button */}
            <Button
              onClick={handleStartInterview}
              disabled={!isFormValid || isStarting}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
              size="lg"
            >
              {isStarting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Starting Interview...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start Interview
                </>
              )}
            </Button>

            {/* Progress Indicator */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Your information is secure and will only be used for this interview
            process.
          </p>
        </div>
      </div>
    </div>
  );
}
