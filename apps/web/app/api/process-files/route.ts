import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { updateFileProcessed } from "@workspace/database";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fileId, url, filename, agentId } = body;

    if (!fileId || !url || !filename || !agentId) {
      return NextResponse.json(
        { error: "Missing required fields: fileId, url, filename, agentId" },
        { status: 400 }
      );
    }

    // Send request to localhost:8000/process-file
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/process-file`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          filename,
          agentId,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Processing failed:", errorText);
      return NextResponse.json(
        { error: `Processing failed: ${errorText}` },
        { status: response.status }
      );
    }

    // Update the file as processed in the database
    await updateFileProcessed(fileId, true);

    const result = await response.json();
    return NextResponse.json({
      message: "File processed successfully",
      result,
    });
  } catch (error) {
    console.error("Failed to process file:", error);
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 }
    );
  }
}
