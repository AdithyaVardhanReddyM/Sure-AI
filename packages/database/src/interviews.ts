"use server";

import { prisma } from "@workspace/database";

export async function getInterviewsByClerkId(clerkId: string) {
  try {
    const interviews = await prisma.interview.findMany({
      where: {
        clerkId: clerkId,
      },
      orderBy: {
        id: "desc",
      },
    });
    return { success: true, interviews };
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return {
      success: false,
      error: "Failed to fetch interviews",
      interviews: [],
    };
  }
}

export async function createInterview(data: {
  name: string;
  replicaId: string;
  clerkId: string;
  systemPrompt: string;
  Context?: string;
}) {
  try {
    // First, create persona via Tavus API
    const tavusResponse = await fetch("https://tavusapi.com/v2/personas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_TAVUS_API_KEY || "",
      },
      body: JSON.stringify({
        pipeline_mode: "full",
        system_prompt: data.systemPrompt,
        context: data.Context || "",
      }),
    });

    if (!tavusResponse.ok) {
      console.error("Tavus API error:", tavusResponse.statusText);
      return {
        success: false,
        error: "Failed to create persona via Tavus API",
      };
    }

    const tavusData = await tavusResponse.json();
    const personaId = tavusData.persona_id;

    if (!personaId) {
      return { success: false, error: "Invalid response from Tavus API" };
    }

    // Now create the interview with the actual personaId
    const interview = await prisma.interview.create({
      data: {
        name: data.name,
        replicaId: data.replicaId,
        clerkId: data.clerkId,
        personaId: personaId,
        systemPrompt: data.systemPrompt,
        Context: data.Context,
      },
    });
    return { success: true, interview };
  } catch (error) {
    console.error("Error creating interview:", error);
    return { success: false, error: "Failed to create interview" };
  }
}

export async function getInterviewById(interviewId: string) {
  try {
    const interview = await prisma.interview.findUnique({
      where: {
        id: interviewId,
      },
    });

    if (!interview) {
      return { success: false, error: "Interview not found" };
    }

    return { success: true, interview };
  } catch (error) {
    console.error("Error fetching interview:", error);
    return { success: false, error: "Failed to fetch interview" };
  }
}

export async function deleteInterview(interviewId: string) {
  try {
    // First delete associated candidates
    await prisma.candidate.deleteMany({
      where: {
        interviewId: interviewId,
      },
    });

    // Then delete the interview
    await prisma.interview.delete({
      where: {
        id: interviewId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting interview:", error);
    return { success: false, error: "Failed to delete interview" };
  }
}
