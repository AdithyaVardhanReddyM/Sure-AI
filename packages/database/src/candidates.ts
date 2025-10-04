"use server";

import { prisma } from "@workspace/database";

export async function getCandidatesByInterviewId(interviewId: string) {
  try {
    const candidates = await prisma.candidate.findMany({
      where: {
        interviewId: interviewId,
      },
      orderBy: {
        name: "asc",
      },
    });
    return { success: true, candidates };
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return {
      success: false,
      error: "Failed to fetch candidates",
      candidates: [],
    };
  }
}

export async function createCandidate(data: {
  name: string;
  email: string;
  interviewId: string;
  conversationId: string;
  resumeText: string;
}) {
  try {
    const candidate = await prisma.candidate.create({
      data: {
        name: data.name,
        email: data.email,
        interviewId: data.interviewId,
        conversationId: data.conversationId,
        resumeText: data.resumeText,
      },
    });
    return { success: true, candidate };
  } catch (error) {
    console.error("Error creating candidate:", error);
    return { success: false, error: "Failed to create candidate" };
  }
}
