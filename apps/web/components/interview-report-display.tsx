"use client";

import {
  FileText,
  Star,
  TrendingUp,
  Users,
  MessageSquare,
  Code,
  Lightbulb,
  CheckCircle,
  XCircle,
  AlertCircle,
  Award,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import { Separator } from "@workspace/ui/components/separator";

interface ReportData {
  overallScore: number;
  communicationSkills: {
    score: number;
    comments: string;
  };
  problemSolving: {
    score: number;
    comments: string;
  };
  technicalKnowledge: {
    score: number;
    comments: string;
  };
  culturalFit: {
    score: number;
    comments: string;
  };
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  summary: string;
}

interface InterviewReportDisplayProps {
  report: ReportData;
  candidateName: string;
  candidateEmail: string;
}

export default function InterviewReportDisplay({
  report,
  candidateName,
  candidateEmail,
}: InterviewReportDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return "bg-green-100";
    if (score >= 6) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case "Strong Hire":
        return <Award className="h-5 w-5 text-green-600" />;
      case "Hire":
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case "Maybe":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "No Hire":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "Strong Hire":
        return "bg-green-100 text-green-800 border-green-200";
      case "Hire":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Maybe":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "No Hire":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-primary">Interview Report</h2>
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <p className="text-xl font-semibold">{candidateName}</p>
            <p className="text-muted-foreground">{candidateEmail}</p>
          </div>
        </div>
      </div>

      {/* Overall Score */}
      <Card className="shadow-lg border-2 border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Star className="h-6 w-6 text-yellow-500" />
            Overall Score
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-6xl font-bold text-primary">
            {report.overallScore}/10
          </div>
          <Progress value={report.overallScore * 10} className="h-3" />
          <div className="flex items-center justify-center gap-2">
            {getRecommendationIcon(report.recommendation)}
            <Badge
              className={`text-sm px-4 py-2 ${getRecommendationColor(report.recommendation)}`}
            >
              {report.recommendation}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Communication Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">Score</span>
              <span
                className={`text-2xl font-bold ${getScoreColor(report.communicationSkills.score)}`}
              >
                {report.communicationSkills.score}/10
              </span>
            </div>
            <Progress
              value={report.communicationSkills.score * 10}
              className="h-2"
            />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {report.communicationSkills.comments}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-purple-600" />
              Problem Solving
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">Score</span>
              <span
                className={`text-2xl font-bold ${getScoreColor(report.problemSolving.score)}`}
              >
                {report.problemSolving.score}/10
              </span>
            </div>
            <Progress
              value={report.problemSolving.score * 10}
              className="h-2"
            />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {report.problemSolving.comments}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-green-600" />
              Technical Knowledge
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">Score</span>
              <span
                className={`text-2xl font-bold ${getScoreColor(report.technicalKnowledge.score)}`}
              >
                {report.technicalKnowledge.score}/10
              </span>
            </div>
            <Progress
              value={report.technicalKnowledge.score * 10}
              className="h-2"
            />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {report.technicalKnowledge.comments}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              Cultural Fit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">Score</span>
              <span
                className={`text-2xl font-bold ${getScoreColor(report.culturalFit.score)}`}
              >
                {report.culturalFit.score}/10
              </span>
            </div>
            <Progress value={report.culturalFit.score * 10} className="h-2" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {report.culturalFit.comments}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <TrendingUp className="h-5 w-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm leading-relaxed">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm leading-relaxed">{weakness}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {report.summary}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
