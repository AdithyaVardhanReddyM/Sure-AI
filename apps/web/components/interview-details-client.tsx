"use client";
import {
  ArrowLeft,
  Users,
  FileText,
  Settings,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import Link from "next/link";
import { useState } from "react";
import InterviewReportDisplay from "./interview-report-display";

interface Interview {
  id: string;
  replicaId: string;
  clerkId: string;
  personaId: string;
  systemPrompt: string;
  Context: string | null;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  interviewId: string;
  report: any;
}

interface InterviewDetailsClientProps {
  interview: Interview;
  candidates: Candidate[];
}

export default function InterviewDetailsClient({
  interview,
  candidates,
}: InterviewDetailsClientProps) {
  const [copied, setCopied] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );

  const copyInterviewLink = async () => {
    const link = `${window.location.origin}/take-interview/${interview.id}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/interviews">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Interviews
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Interview Details
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and view interview information
            </p>
          </div>
        </div>
        <Button
          onClick={copyInterviewLink}
          className="bg-primary hover:bg-primary/90"
        >
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy Interview Link
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Interview Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Interview Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Interview ID
                  </label>
                  <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md mt-1">
                    {interview.id}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Replica ID
                  </label>
                  <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md mt-1">
                    {interview.replicaId}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Persona ID
                  </label>
                  <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md mt-1">
                    {interview.personaId}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      Active
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Prompt */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                System Prompt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                  {interview.systemPrompt}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Context */}
          {interview.Context && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Context
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                    {interview.Context}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Candidates Sidebar */}
        <div className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Candidates ({candidates.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candidates.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">
                    No candidates yet
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Candidates who take this interview will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                      onClick={() => {
                        if (candidate.report) {
                          setSelectedCandidate(candidate);
                        }
                      }}
                    >
                      <div>
                        <p className="font-medium text-sm">{candidate.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {candidate.email}
                        </p>
                      </div>
                      <Badge
                        variant={candidate.report ? "default" : "secondary"}
                        className={`text-xs ${
                          candidate.report
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {candidate.report
                          ? "Report Available"
                          : "Waiting for Report"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Total Candidates
                </span>
                <span className="font-semibold">{candidates.length}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Completed</span>
                <span className="font-semibold text-green-600">
                  {candidates.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="font-semibold text-orange-600">0</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Report Dialog */}
      <Dialog
        open={!!selectedCandidate}
        onOpenChange={() => setSelectedCandidate(null)}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Interview Report</DialogTitle>
          </DialogHeader>
          {selectedCandidate && selectedCandidate.report && (
            <InterviewReportDisplay
              report={selectedCandidate.report}
              candidateName={selectedCandidate.name}
              candidateEmail={selectedCandidate.email}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
