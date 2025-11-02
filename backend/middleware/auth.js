import pkg from "@prisma/client";
const { PrismaClient, Prisma } = pkg;

const prisma = new PrismaClient();

// requireAuth: rejects if no valid Clerk session; attaches { userId, email } to req.auth.
const authMiddleware = async (req, res, next) => {
  try {
    const { userId } = req.auth || {};

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });

    if (!user) {
      createUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email,
          role: "CLIENT",
        },
      });
    }
    next();
  } catch (error) {
    console.log(error, "error");
    return res.status(403).json({ message: "Forbidden - Invalid token" });
  }
};

export default authMiddleware;

// requireRole('TRAINER'|'CLIENT'): reads your DB user’s role (not the client’s claim) and 403s on mismatch.
