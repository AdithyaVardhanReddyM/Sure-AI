"use server";

import { prisma } from "@workspace/database";

export async function getEmailTemplatesByAgentId(agentId: string) {
  try {
    const emailTemplates = await prisma.emailTemplates.findMany({
      where: {
        agentId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, emailTemplates };
  } catch (error) {
    console.error("Error fetching email templates:", error);
    return {
      success: false,
      error: "Failed to fetch email templates",
      emailTemplates: [],
    };
  }
}

export async function createEmailTemplate(
  agentId: string,
  name: string,
  htmlContent: string,
  schema?: any
) {
  try {
    const emailTemplate = await prisma.emailTemplates.create({
      data: {
        agentId,
        name,
        htmlContent,
        schema,
      },
    });
    return { success: true, emailTemplate };
  } catch (error) {
    console.error("Error creating email template:", error);
    return {
      success: false,
      error: "Failed to create email template",
    };
  }
}

export async function deleteEmailTemplate(id: string) {
  try {
    await prisma.emailTemplates.delete({
      where: {
        id,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting email template:", error);
    return {
      success: false,
      error: "Failed to delete email template",
    };
  }
}

export async function getEmailTemplateById(id: string) {
  try {
    const emailTemplate = await prisma.emailTemplates.findUnique({
      where: {
        id,
      },
    });
    return { success: true, emailTemplate };
  } catch (error) {
    console.error("Error fetching email template:", error);
    return {
      success: false,
      error: "Failed to fetch email template",
    };
  }
}

export async function updateEmailTemplate(
  id: string,
  name?: string,
  htmlContent?: string,
  schema?: any
) {
  try {
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (htmlContent !== undefined) updateData.htmlContent = htmlContent;
    if (schema !== undefined) updateData.schema = schema;

    const emailTemplate = await prisma.emailTemplates.update({
      where: {
        id,
      },
      data: updateData,
    });
    return { success: true, emailTemplate };
  } catch (error) {
    console.error("Error updating email template:", error);
    return {
      success: false,
      error: "Failed to update email template",
    };
  }
}

export async function generateEmailSchema(prompt: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/generate-email-schema`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      }
    );
    const data = await response.json();
    return { success: true, schema: data.schema };
  } catch (error) {
    console.error("Error generating email schema:", error);
    return {
      success: false,
      error: "Failed to generate schema",
    };
  }
}
