// clerk.service.js (ESM)

import { createClerkClient } from "@clerk/backend";
import { clerkClient } from '@clerk/express'
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

// ---- Clerk admin client (ONE source of truth) ----
export const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// Optional: uncomment once to confirm available methods
// console.log("emailAddresses methods:", Object.keys(clerk.emailAddresses || {}));

// ---- Prisma ----
export const prisma = new PrismaClient({
  log: ["query", "warn", "error"],
});

// ---- Internal REST fallback (for older Clerk SDKs) ----
const CLERK_API_URL = "https://api.clerk.com/v1";

async function clerkFetch(path, init = {}) {
  const res = await fetch(CLERK_API_URL + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      ...(init.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`Clerk ${res.status}: ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

// ---- Helpers: feature-detected wrappers ----
async function createEmailAddress(userId, email) {
  if (clerk.emailAddresses?.createEmailAddress) {
    return clerk.emailAddresses.createEmailAddress({
      userId,
      emailAddress: String(email).trim(),
    });
  }
  // REST fallback
  return clerkFetch(`/email_addresses`, {
    method: "POST",
    body: JSON.stringify({ user_id: userId, email_address: String(email).trim() }),
  });
}

async function prepareEmailVerification(emailAddressId) {
  if (clerk.emailAddresses?.prepareVerification) {
    return clerk.emailAddresses.prepareVerification(emailAddressId, { strategy: "email_code" });
  }
  return clerkFetch(`/email_addresses/${emailAddressId}/prepare_verification`, {
    method: "POST",
    body: JSON.stringify({ strategy: "email_code" }),
  });
}

async function attemptEmailVerification(emailAddressId, code) {
  if (clerk.emailAddresses?.attemptVerification) {
    return clerk.emailAddresses.attemptVerification(emailAddressId, { code: String(code).trim() });
  }
  return clerkFetch(`/email_addresses/${emailAddressId}/attempt_verification`, {
    method: "POST",
    body: JSON.stringify({ code: String(code).trim() }),
  });
}

async function promotePrimaryEmail(userId, emailAddressId) {
  if (clerk.users?.updateUser) {
    return clerk.users.updateUser(userId, { primaryEmailAddressId: emailAddressId });
  }
  return clerkFetch(`/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ primary_email_address_id: emailAddressId }),
  });
}

async function deleteEmailAddress(emailAddressId) {
  if (clerk.emailAddresses?.deleteEmailAddress) {
    return clerk.emailAddresses.deleteEmailAddress(emailAddressId);
  }
  return clerkFetch(`/email_addresses/${emailAddressId}`, { method: "DELETE" });
}

// ---- Public API ----

// 1) Start email change: create new email + send code to NEW address
export async function startEmailChange(userId, newEmail) {
  const created = await createEmailAddress(userId, newEmail);
  const newId = created.id || created?.data?.id;
  if (!newId) throw new Error("Failed to create email address.");
  await prepareEmailVerification(newId);
  return { emailAddressId: newId };
}

// 2) Verify code, promote, optionally delete old; then mirror to Prisma (optional)
export async function verifyAndPromoteEmail(
  userId,
  emailAddressId,
  code,
  deleteOldEmailId = null
) {
  await attemptEmailVerification(emailAddressId, code);
  const updatedUser = await promotePrimaryEmail(userId, emailAddressId);

  if (deleteOldEmailId) {
    try {
      await deleteEmailAddress(deleteOldEmailId);
    } catch (e) {
      console.error("Failed to delete old email:", e);
    }
  }

  return updatedUser;
}

// 3) (Optional) Single-call utility if verification is NOT enforced in your instance
//    Adds new email, promotes immediately if already verified, optionally deletes old.
export async function updateClerkUserEmail(
  userId,
  newEmail,
  { deleteOldEmailId = null, requireVerified = false } = {}
) {
  const newEmailAddress = await createEmailAddress(userId, newEmail);

  const status = newEmailAddress?.verification?.status;
  if (requireVerified && status !== "verified") {
    const err = new Error("New email must be verified before promotion.");
    err.code = "EMAIL_NOT_VERIFIED";
    err.emailAddressId = newEmailAddress.id;
    throw err;
  }

  const updatedUser = await promotePrimaryEmail(userId, newEmailAddress.id);

  if (deleteOldEmailId) {
    try {
      await deleteEmailAddress(deleteOldEmailId);
    } catch (e) {
      console.error("Failed to delete old email:", e);
    }
  }

  return { updatedUser, newPrimaryEmailId: newEmailAddress.id };
}
