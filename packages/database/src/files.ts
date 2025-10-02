import { prisma } from "@workspace/database";

export async function uploadFile(
  userId: string,
  fileName: string,
  fileUrl: string,
  agentId?: string
): Promise<void> {
  await prisma.files.create({
    data: {
      userId,
      fileName,
      fileUrl,
      agentId: agentId || null,
    },
  });
}

export async function deleteFile(fileUrl: string): Promise<void> {
  await prisma.files.deleteMany({
    where: {
      fileUrl,
    },
  });
}

export async function getFilesByUserId(userId: string) {
  return await prisma.files.findMany({
    where: {
      userId,
    },
    orderBy: {
      fileName: "asc",
    },
  });
}
