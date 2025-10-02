import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the incoming event data
    const { conversationId, agentId, contactSessionId, status, createdAt } =
      body;

    if (!conversationId || !agentId || !contactSessionId) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: conversationId, agentId, contactSessionId",
        },
        { status: 400 }
      );
    }

    // Log the event (you can replace this with actual processing, e.g., broadcasting via SSE)
    console.log("New conversation event received:", {
      conversationId,
      agentId,
      contactSessionId,
      status,
      createdAt,
    });

    // TODO: Add logic to handle the event, e.g., notify connected clients or update cache

    return NextResponse.json(
      { message: "Conversation event received successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing conversation event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
