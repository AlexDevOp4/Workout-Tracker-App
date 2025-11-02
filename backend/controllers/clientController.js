import { clerkClient } from "@clerk/express";
import pkg from "@prisma/client";
const { PrismaClient, Prisma } = pkg;

export const prisma = new PrismaClient({
  log: ["query", "warn", "error"],
});

// POST /api/users
export const createUser = async (req, res) => {
  try {
    const emailRaw = req.body?.email;
    if (!emailRaw)
      return res.status(400).json({ message: "email is required" });
    const email = emailRaw.trim().toLowerCase();
    const { username, password } = req.body;

    let list = await clerkClient.users.getUserList({
      emailAddress: [email],
    });

    let found = list.length ? list[0] : null;
    if (!found) {
      found = await clerkClient.users.createUser({
        emailAddress: [email],
        username,
        password,
      });
    } else {
      console.log("[CREATE] found Clerk user:", found.id);
    }

    const primaryId = found.primaryEmailAddressId;
    const primaryEntry =
      (found.emailAddresses || []).find((e) => e.id === primaryId) ||
      (found.emailAddresses || [])[0];
    const clerkEmail = primaryEntry?.emailAddress || email;

    const prismaUser = await prisma.user.upsert({
      where: { clerkId: found.id },
      create: { clerkId: found.id, email: clerkEmail, role: "CLIENT" },
      update: { email: clerkEmail },
    });

    return res.status(201).json({
      user: prismaUser,
      clerk: { id: found.id, email: clerkEmail, username: found.username },
    });
  } catch (err) {
    console.error("[CREATE] ERROR:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

// GET /api/users
export const getClerkUsers = async (req, res) => {};
