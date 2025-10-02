import { prisma } from "./client";

export async function createUser() {
  try {
    const user = await prisma.user.create({
      data: {
        name: "adithya",
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
}

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany();
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}
