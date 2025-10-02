import { NextRequest, NextResponse } from "next/server";

// Store SSE connections by agentId
const sseConnections = new Map<string, Set<ReadableStreamDefaultController>>();

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

    // Broadcast to all SSE connections for this agentId
    const connections = sseConnections.get(agentId);

    if (connections) {
      const eventData = `data: ${JSON.stringify({
        type: "new_conversation",
        conversationId,
        agentId,
        contactSessionId,
        status,
        createdAt,
      })}\n\n`;

      for (const controller of connections) {
        try {
          controller.enqueue(new TextEncoder().encode(eventData));
        } catch (error) {
          console.error("Error sending SSE event:", error);
          connections.delete(controller);
        }
      }
    }

    return NextResponse.json(
      { message: "Conversation event received and broadcasted successfully" },
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agentId");
  const test = searchParams.get("test");

  if (!agentId) {
    return NextResponse.json(
      { error: "Missing agentId query parameter" },
      { status: 400 }
    );
  }

  // If this is a test request, broadcast a test event
  if (test === "true") {
    const connections = sseConnections.get(agentId);
    if (connections) {
      const testEventData = `data: ${JSON.stringify({
        type: "new_conversation",
        conversationId: "test-" + Date.now(),
        agentId,
        contactSessionId: "test-session",
        status: "notEscalated",
        createdAt: new Date().toISOString(),
      })}\n\n`;

      for (const controller of connections) {
        try {
          controller.enqueue(new TextEncoder().encode(testEventData));
        } catch (error) {
          console.error("Error sending test SSE event:", error);
          connections.delete(controller);
        }
      }
    }

    return NextResponse.json({ message: "Test event broadcasted" });
  }

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      // Add this connection to the agent's connections
      if (!sseConnections.has(agentId)) {
        sseConnections.set(agentId, new Set());
      }
      sseConnections.get(agentId)!.add(controller);

      // Send initial connection message
      const initialData = `data: ${JSON.stringify({ type: "connected", agentId })}\n\n`;
      controller.enqueue(new TextEncoder().encode(initialData));

      // Clean up when connection closes
      request.signal.addEventListener("abort", () => {
        const connections = sseConnections.get(agentId);
        if (connections) {
          connections.delete(controller);
          if (connections.size === 0) {
            sseConnections.delete(agentId);
          }
        }
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
