import { NextRequest, NextResponse } from "next/server";

// Store SSE connections by agentId
const sseConnections = new Map<string, Set<ReadableStreamDefaultController>>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the incoming event data
    const {
      messageId,
      conversationId,
      contactSessionId,
      role,
      content,
      createdAt,
    } = body;

    if (!messageId || !conversationId || !contactSessionId) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: messageId, conversationId, contactSessionId",
        },
        { status: 400 }
      );
    }

    // Get the agentId from the conversation (we need to fetch it)
    // For now, we'll broadcast to all connections since we don't have agentId in the message event
    // In a production system, you'd want to include agentId in the event or fetch it from the conversation

    // Broadcast to all SSE connections
    for (const [agentId, connections] of sseConnections) {
      for (const controller of connections) {
        try {
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({
                type: "new_message",
                messageId,
                conversationId,
                contactSessionId,
                role,
                content,
                createdAt,
              })}\n\n`
            )
          );
        } catch (error) {
          console.error("Error sending message event to SSE client:", error);
          connections.delete(controller);
        }
      }
    }

    return NextResponse.json(
      { message: "Message event received and broadcasted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing message event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agentId");

  if (!agentId) {
    return NextResponse.json(
      { error: "Missing agentId query parameter" },
      { status: 400 }
    );
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
