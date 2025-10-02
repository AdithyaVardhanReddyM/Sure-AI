import { NextRequest, NextResponse } from "next/server";

// Store SSE connections
const sseConnections = new Set<ReadableStreamDefaultController>();

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

    // Broadcast to all SSE connections
    for (const controller of sseConnections) {
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
        sseConnections.delete(controller);
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
  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      // Add this connection to the connections
      sseConnections.add(controller);

      // Send initial connection message
      const initialData = `data: ${JSON.stringify({ type: "connected" })}\n\n`;
      controller.enqueue(new TextEncoder().encode(initialData));

      // Clean up when connection closes
      request.signal.addEventListener("abort", () => {
        sseConnections.delete(controller);
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
