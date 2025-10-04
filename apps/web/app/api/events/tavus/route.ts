import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@workspace/database";
import Cerebras from "@cerebras/cerebras_cloud_sdk";

const reportSchema = {
  type: "object",
  properties: {
    overallScore: { type: "number" },
    communicationSkills: {
      type: "object",
      properties: {
        score: { type: "number" },
        comments: { type: "string" },
      },
      required: ["score", "comments"],
    },
    problemSolving: {
      type: "object",
      properties: {
        score: { type: "number" },
        comments: { type: "string" },
      },
      required: ["score", "comments"],
    },
    technicalKnowledge: {
      type: "object",
      properties: {
        score: { type: "number" },
        comments: { type: "string" },
      },
      required: ["score", "comments"],
    },
    culturalFit: {
      type: "object",
      properties: {
        score: { type: "number" },
        comments: { type: "string" },
      },
      required: ["score", "comments"],
    },
    strengths: { type: "array", items: { type: "string" } },
    weaknesses: { type: "array", items: { type: "string" } },
    recommendation: {
      type: "string",
      enum: ["Strong Hire", "Hire", "Maybe", "No Hire"],
    },
    summary: { type: "string" },
  },
  required: [
    "overallScore",
    "communicationSkills",
    "problemSolving",
    "technicalKnowledge",
    "culturalFit",
    "strengths",
    "weaknesses",
    "recommendation",
    "summary",
  ],
};

async function generateInterviewReport(
  transcript: any[],
  resumeText: string,
  systemPrompt: string,
  context?: string
) {
  const client = new Cerebras({
    apiKey: process.env["CEREBRAS_API_KEY"],
  });

  const prompt = `You are an expert interviewer evaluating a candidate's performance in a software development engineer interview. Analyze the following interview transcript, candidate's resume, and interview context to provide a comprehensive evaluation.

Interview Context: ${context || "N/A"}
Candidate Resume: ${resumeText}
Interview Transcript: ${JSON.stringify(transcript)}

Please evaluate the candidate based on:
- Communication skills and clarity of expression
- Ability to break down problems logically
- Basic coding and algorithmic reasoning
- Understanding of software design fundamentals
- Cultural fit and professional demeanor

IMPORTANT: All scores must be numbers between 1 and 10 (inclusive).
Provide a detailed report with scores (1-10 scale), comments, strengths, weaknesses, and an overall recommendation from: "Strong Hire", "Hire", "Maybe", "No Hire".`;

  const completion = await client.chat.completions.create({
    model: "llama-4-scout-17b-16e-instruct",
    messages: [
      {
        role: "system",
        content:
          "You are an expert interviewer providing structured evaluations of candidate performance.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "interview_report",
        strict: true,
        schema: reportSchema,
      },
    },
  });

  const report = JSON.parse((completion as any).choices[0].message.content);
  return report;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the webhook payload
    const { event_type, conversation_id, properties, timestamp } = body;

    if (!event_type || !conversation_id) {
      return NextResponse.json(
        { error: "Missing required fields: event_type, conversation_id" },
        { status: 400 }
      );
    }

    // Handle transcription_ready event
    if (event_type === "application.transcription_ready") {
      const { transcript } = properties;

      if (!transcript || !Array.isArray(transcript)) {
        return NextResponse.json(
          { error: "Invalid transcript data" },
          { status: 400 }
        );
      }

      // Find the candidate by conversation_id
      const candidate = await prisma.candidate.findFirst({
        where: {
          conversationId: conversation_id,
        },
      });

      if (!candidate) {
        console.warn(
          `Candidate not found for conversation_id: ${conversation_id}`
        );
        return NextResponse.json(
          { error: "Candidate not found for this conversation" },
          { status: 404 }
        );
      }

      // Get the interview details
      const interview = await prisma.interview.findUnique({
        where: {
          id: candidate.interviewId,
        },
      });

      if (!interview) {
        console.warn(`Interview not found for candidate ${candidate.id}`);
        return NextResponse.json(
          { error: "Interview not found for this candidate" },
          { status: 404 }
        );
      }

      // Generate the interview report using AI
      const report = await generateInterviewReport(
        transcript,
        candidate.resumeText,
        interview.systemPrompt,
        interview.Context || undefined
      );

      // Store the report in the candidate's report field
      await prisma.candidate.update({
        where: {
          id: candidate.id,
        },
        data: {
          report: report,
        },
      });

      console.log(
        `Report generated and stored for candidate ${candidate.id}, conversation ${conversation_id}`
      );

      return NextResponse.json(
        { message: "Report generated and stored successfully" },
        { status: 200 }
      );
    }

    // For other event types, just acknowledge receipt
    console.log(
      `Received Tavus webhook event: ${event_type} for conversation: ${conversation_id}`
    );

    return NextResponse.json(
      { message: `Event ${event_type} received successfully` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing Tavus webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
