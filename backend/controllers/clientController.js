import { clerkClient } from "@clerk/express";
import pkg from "@prisma/client";
const { PrismaClient, Prisma } = pkg;

export const prisma = new PrismaClient({
  log: ["query", "warn", "error"],
});

// POST /api/users
export const createUser = async (req, res) => {
  try {
    await prisma.clientProfile.create({
      
    })
  } catch (error) {
    
  }
};

// GET /api/users
export const getClerkUsers = async (req, res) => {};
