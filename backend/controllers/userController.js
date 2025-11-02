import pkg from "@prisma/client";
import { clerkClient } from '@clerk/express'
const { PrismaClient, Prisma } = pkg;

const prisma = new PrismaClient();

// GET /api/users
export const getUsers = async (req, res) => {
  try {
    const allUsers = await prisma.user.findMany();
    const users = await clerkClient.users.getUserList();

    return res.status(200).json({ "users": allUsers, "clerk_users": users });
  } catch (error) {
    return res.status(404).json({ error: "Error fetching users " + error });
  }
};

// GET /api/users/:id
export const getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        clerkId: req.params.id,
      },
    });

    return res.status(200).json(user);
  } catch (error) {
    return res.status(404).json({ error: "Error fetchin user " + error });
  }
};

// POST /api/users/create
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

      await prisma.user.create({
        clerkId: found.id,
        email: email,
        role: "CLIENT"
      })
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
      create: { clerkId: found.id, email: clerkEmail },
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



// PATCH /users/:id
export const updateUserById = async (req, res) => {
  try {
    const { role, email } = req.body;
    const clerkId = req.params.id;

    const hasRole = typeof role !== "undefined";
    const hasEmail = typeof email !== "undefined";

    if (!hasRole && !hasEmail) {
      return res.status(400).json({ message: "No updatable fields provided." });
    }

    if (hasEmail) {
      await clerkClient.emailAddresses.createEmailAddress({
        userId: req.params.id,
        emailAddress: req.body.email,
        verified: true,
        primary: true
      })
    }

    const payload = {};
    if (hasRole) {
      const allowed = new Set(["TRAINER", "CLIENT"]);
      if (!allowed.has(String(role))) {
        return res.status(400).json({ message: "Invalid role." });
      }
      payload.role = String(role);
    }
    if (hasEmail) {
      payload.email = String(email).trim();
    }

    const user = await prisma.user.update({
      where: { clerkId },
      data: payload,
    });

    return res.status(200).json({ user, message: "User updated." });
  } catch (err) {
    if (err && err.code === "EMAIL_NOT_VERIFIED") {
      return res.status(409).json({
        message:
          "Email added but not verified. Verify the new address before it can be set as primary.",
        emailAddressId: err.emailAddressId,
      });
    }
    console.error(err);
    return res.status(500).json({ message: "Failed to update user." });
  }
};


// DELETE /api/users/:id
export const deleteUserById = async (req, res) => {
  const clerkId = req.params.id

  try {
    await clerkClient.users.deleteUser(clerkId);

    await prisma.user.delete({
      where: {
        clerkId: clerkId,
      },
    });

    return res.status(200).json({ message: "User deleted" });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: "Error deleting user:" + error });
  }
}