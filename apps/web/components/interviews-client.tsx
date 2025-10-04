"use client";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  PlusCircle,
  Loader2,
  Trash2,
  FileText,
  Sparkles,
  Users,
} from "lucide-react";
import { useState } from "react";
import { createInterview, deleteInterview } from "@workspace/database";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import Link from "next/link";

interface Interview {
  id: string;
  name: string;
  replicaId: string;
  clerkId: string;
  personaId: string;
  systemPrompt: string;
  Context: string | null;
}

interface InterviewsClientProps {
  interviews: Interview[];
}

export default function InterviewsClient({
  interviews: initialInterviews,
}: InterviewsClientProps) {
  const { userId } = useAuth();
  const [interviews, setInterviews] = useState(initialInterviews);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [replicaId, setReplicaId] = useState("r92debe21318");
  const [systemPrompt, setSystemPrompt] =
    useState(`You are James, a Product Manager at a fast-growing tech company. You're conducting a first-round interview for candidates applying to a Software Development Engineer (SDE) role. You are professional yet approachable, aiming to assess both communication skills and fundamental problem-solving abilities.

Your job is to guide the candidate through a structured but conversational technical interview. This round is not meant to be overly challenging or deeply technical, but rather to evaluate the candidate's ability to reason through problems, communicate clearly, and demonstrate sound thinking.

Structure the conversation like a real human interviewer would: Begin with a friendly introduction about yourself and the company. Ask a few background questions to learn about the candidate. Explain the interview format clearly. Present a technical scenario in a conversational manner. Ask broad questions that assess structured thinking in coding, system design, and problem-solving. Respond thoughtfully to the candidate's answers. Provide guidance when the candidate seems stuck. Ask follow-up questions to better understand their thought process. Capture information about the candidate's background and approach. End with time for the candidate to ask questions about the company or role.

Your responses will be spoken aloud, so: Speak naturally as an experienced interviewer would. Avoid any formatting, bullet points, or stage directions. Use a conversational tone with appropriate pauses. Never refer to yourself as an AI, assistant, or language model.

Pay attention to the flow of the interview. This first-round interview should be more supportive than challenging, helping the candidate showcase their potential while gathering information about their fit for the team.`);
  const [context, setContext] =
    useState(`You are James, a Product Manager at Arcadia Technologies, a company that builds scalable cloud-based collaboration tools. You're conducting a first-round interview for an SDE role on your product engineering team.

This round will include:
- Introduction and background questions (5 minutes).
- A simple coding or problem-solving exercise (10 minutes).
- A light system design or product-focused technical scenario (10 minutes).
- Time for candidate questions about the company, role, or team (5 minutes).
- Wrap-up and next steps (2 minutes).

Your evaluation criteria:
- Communication skills and clarity of expression.
- Ability to break down problems logically.
- Basic coding and algorithmic reasoning.
- Understanding of software design fundamentals.
- Cultural fit and professional demeanor.

The interview should feel conversational. You'll be assessing whether the candidate can think clearly under light pressure, explain their reasoning, and demonstrate the kind of collaborative problem-solving mindset that works well in cross-functional teams.

If the candidate struggles, guide them by asking clarifying questions or reframing the problem. Do not expect perfect code or complete solutions; focus instead on their reasoning process.

At the end, if the candidate asks about results or feedback, respond with: "Thank you for your time today. Our recruiting team will be reviewing all candidate assessments and will reach out to you with next steps. We typically aim to provide updates within two weeks." Maintain a positive, professional tone while redirecting to the formal process.`);

  const handleCreateInterview = async () => {
    if (!userId || !name.trim() || !replicaId.trim() || !systemPrompt.trim())
      return;

    setIsLoading(true);
    const result = await createInterview({
      name: name.trim(),
      replicaId: replicaId.trim(),
      clerkId: userId,
      systemPrompt: systemPrompt.trim(),
      Context: context.trim() || undefined,
    });

    if (result.success && result.interview) {
      setInterviews([result.interview, ...interviews]);
      setIsOpen(false);
      setName("");
      setReplicaId("r92debe21318");
      setSystemPrompt(`You are James, a Product Manager at a fast-growing tech company. You're conducting a first-round interview for candidates applying to a Software Development Engineer (SDE) role. You are professional yet approachable, aiming to assess both communication skills and fundamental problem-solving abilities.

Your job is to guide the candidate through a structured but conversational technical interview. This round is not meant to be overly challenging or deeply technical, but rather to evaluate the candidate's ability to reason through problems, communicate clearly, and demonstrate sound thinking.

Structure the conversation like a real human interviewer would: Begin with a friendly introduction about yourself and the company. Ask a few background questions to learn about the candidate. Explain the interview format clearly. Present a technical scenario in a conversational manner. Ask broad questions that assess structured thinking in coding, system design, and problem-solving. Respond thoughtfully to the candidate's answers. Provide guidance when the candidate seems stuck. Ask follow-up questions to better understand their thought process. Capture information about the candidate's background and approach. End with time for the candidate to ask questions about the company or role.

Your responses will be spoken aloud, so: Speak naturally as an experienced interviewer would. Avoid any formatting, bullet points, or stage directions. Use a conversational tone with appropriate pauses. Never refer to yourself as an AI, assistant, or language model.

Pay attention to the flow of the interview. This first-round interview should be more supportive than challenging, helping the candidate showcase their potential while gathering information about their fit for the team.`);

      setContext(`You are James, a Product Manager at Arcadia Technologies, a company that builds scalable cloud-based collaboration tools. You're conducting a first-round interview for an SDE role on your product engineering team.

This round will include:
- Introduction and background questions (5 minutes).
- A simple coding or problem-solving exercise (10 minutes).
- A light system design or product-focused technical scenario (10 minutes).
- Time for candidate questions about the company, role, or team (5 minutes).
- Wrap-up and next steps (2 minutes).

Your evaluation criteria:
- Communication skills and clarity of expression.
- Ability to break down problems logically.
- Basic coding and algorithmic reasoning.
- Understanding of software design fundamentals.
- Cultural fit and professional demeanor.

The interview should feel conversational. You'll be assessing whether the candidate can think clearly under light pressure, explain their reasoning, and demonstrate the kind of collaborative problem-solving mindset that works well in cross-functional teams.

If the candidate struggles, guide them by asking clarifying questions or reframing the problem. Do not expect perfect code or complete solutions; focus instead on their reasoning process.

At the end, if the candidate asks about results or feedback, respond with: "Thank you for your time today. Our recruiting team will be reviewing all candidate assessments and will reach out to you with next steps. We typically aim to provide updates within two weeks." Maintain a positive, professional tone while redirecting to the formal process.`);
    }
    setIsLoading(false);
  };

  const handleDeleteInterview = async (interviewId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this interview? This will also delete all associated candidates."
      )
    )
      return;

    const result = await deleteInterview(interviewId);
    if (result.success) {
      setInterviews(
        interviews.filter((interview) => interview.id !== interviewId)
      );
    } else {
      alert("Failed to delete interview");
    }
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Interviews
        </h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Interview
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Create New Interview
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Configure your interview settings.
              </p>
            </DialogHeader>
            <div className="space-y-4 pr-2">
              <div>
                <label htmlFor="name" className="text-sm font-medium">
                  Interview Name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter interview name"
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="replicaId" className="text-sm font-medium">
                  Replica ID
                </label>
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  Choose your replica ID from{" "}
                  <a
                    href="https://platform.tavus.io/replicas"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    https://platform.tavus.io/replicas
                  </a>
                </p>
                <Input
                  id="replicaId"
                  value={replicaId}
                  onChange={(e) => setReplicaId(e.target.value)}
                  placeholder="Enter replica ID"
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="systemPrompt" className="text-sm font-medium">
                  System Prompt
                </label>
                <Textarea
                  id="systemPrompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Enter system prompt"
                  className="mt-1 min-h-[100px]"
                />
              </div>
              <div>
                <label htmlFor="context" className="text-sm font-medium">
                  Context (Optional)
                </label>
                <Textarea
                  id="context"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Enter context"
                  className="mt-1 min-h-[80px]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateInterview}
                  disabled={
                    !name.trim() ||
                    !replicaId.trim() ||
                    !systemPrompt.trim() ||
                    isLoading
                  }
                  className="bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Interview"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {interviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-8 rounded-2xl border border-primary/20">
              <div className="flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-xl mb-4 mx-auto">
                <FileText className="w-12 h-12 text-white" />
              </div>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">
                  AI-Powered Interviews
                </span>
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              </div>
            </div>
          </div>

          <div className="text-center max-w-md">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Create Your First Interview
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Set up intelligent, conversational interviews powered by AI.
              Evaluate candidates with structured assessments and get detailed
              insights.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="flex flex-col items-center p-4 bg-card rounded-lg border border-border/50">
                <Users className="w-8 h-8 text-primary mb-2" />
                <span className="text-sm font-medium">Smart Evaluation</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-card rounded-lg border border-border/50">
                <FileText className="w-8 h-8 text-primary mb-2" />
                <span className="text-sm font-medium">Detailed Reports</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-card rounded-lg border border-border/50">
                <Sparkles className="w-8 h-8 text-primary mb-2" />
                <span className="text-sm font-medium">AI Insights</span>
              </div>
            </div>

            <Button
              size="lg"
              onClick={() => setIsOpen(true)}
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Create Interview
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviews.map((interview) => (
            <Card
              key={interview.id}
              className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-card/50 hover:from-card hover:to-card/80"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <CardHeader className="relative pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/interviews/${interview.id}`}
                      className="block"
                    >
                      <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-200 cursor-pointer truncate">
                        {interview.name}
                      </CardTitle>
                    </Link>
                    <div className="flex items-center mt-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-xs text-muted-foreground font-medium">
                        Active Interview
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteInterview(interview.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200 ml-2 flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <Link href={`/interviews/${interview.id}`}>
                <CardContent className="relative cursor-pointer pt-0">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground mb-1">
                          System Prompt
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {interview.systemPrompt.length > 120
                            ? `${interview.systemPrompt.substring(0, 120)}...`
                            : interview.systemPrompt}
                        </p>
                      </div>
                    </div>

                    {interview.Context && (
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground mb-1">
                            Context
                          </p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {interview.Context.length > 120
                              ? `${interview.Context.substring(0, 120)}...`
                              : interview.Context}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">
                            AI
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Powered by AI
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Replica: {interview.replicaId}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
