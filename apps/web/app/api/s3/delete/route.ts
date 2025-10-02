import { NextResponse } from "next/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { S3 } from "@/lib/S3Client";
import { auth } from "@clerk/nextjs/server";
import { deleteFile } from "@workspace/database";

const BUCKET_NAME = process.env.S3_BUCKET_NAME;
const S3_ENDPOINT = "https://saya.t3.storage.dev"; // From S3Client configuration

export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const key = body.key;

    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid object key." },
        { status: 400 }
      );
    }

    const fileUrl = `${S3_ENDPOINT}/${key}`;

    // Delete database record first
    await deleteFile(fileUrl);

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await S3.send(command);

    return NextResponse.json(
      { message: "File deleted successfully" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to delete file." },
      { status: 500 }
    );
  }
}
