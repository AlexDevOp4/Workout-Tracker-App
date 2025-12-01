import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();
// GET /days  - list all days with their rows
export async function getDays(req, res) {
  try {
    const days = await prisma.day.findUnique({
      include: { row: true },
    });
    res.json(days);
  } catch (error) {
    console.error("Error fetching days:", error);
    return res.status(500).json({ message: "Failed to fetch days" });
  }
}

// GET /days/:id  - get single day with rows
export async function getDayById(req, res) {
  const { id } = req.params;

  try {
    const day = await prisma.day.findUnique({
      where: { id },
      include: { row: true },
    });

    if (!day) {
      return res.status(404).json({ message: "Day not found" });
    }

    return res.json(day);
  } catch (error) {
    console.error("Error fetching day:", error);
    return res.status(500).json({ message: "Failed to fetch day" });
  }
}

// POST /api/days
export const createDay = async (req, res) => {
  const {
    weekId,
    dayNumber,
    rows,
    clientProfileId,
    trainerId,
    title,
    startDate,
  } = req.body;

  const parse = dateSchema.safeParse(req.body.startDate);
  if (!parse.success)
    return res.status(400).json({ message: parse.error.issues[0].message });

  const dateStr = parse.data; // "2025-11-05"

  const utcMidnight = DateTime.fromISO(dateStr, { zone: "UTC" })
    .startOf("day")
    .toJSDate();

  try {
    const clientProfile = await prisma.clientProfile.findUniqueOrThrow({
      where: {
        id: clientProfileId,
      },
    });

    const trainer = await prisma.user.findUniqueOrThrow({
      where: {
        id: trainerId,
      },
    });

    if (clientProfile.id !== clientProfileId || trainer.role !== "TRAINER") {
      return res.status(404).json({
        error:
          "Client Profile Id has to be present and only Trainers can create programs!",
      });
    }
    const programCreated = await prisma.program.create({
      data: {
        clientId: clientProfileId,
        trainerId,
        startDate: utcMidnight,
        status: "active",
        title,
      },
    });
    const day = await prisma.day.create({
      data: {
        weekId,
        dayNumber,
        rows: {
          create: rows.map((row) => ({
            exerciseId: row.exerciseId,
            sets: row.sets,
            weightLbs: row.weightLbs,
            targetRepsMin: row.targetRepsMin,
            targetRepsMax: row.targetRepsMax,
            rir: row.rir,
            restSec: row.restSec,
            actualReps: row.actualReps,
            notes: row.notes ?? null,
          })),
        },
      },
      include: {
        rows: {
          include: {
            exercise: true,
          },
        },
      },
    });

    return res.status(201).json(day);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create day with rows" });
  }
};

// PUT /days/:id  - update a day
// Note: your Day model only has timestamps, no other fields.
// This is mostly a placeholder unless you add columns (e.g. dayNumber, weekId, name).
export async function updateDay(req, res) {
  const { id } = req.params;

  try {
    // Currently nothing to update on Day itself,
    // but this is where you'd handle it once you add fields.
    const day = await prisma.day.update({
      where: { id },
      data: {},
    });

    return res.json(day);
  } catch (error) {
    console.error("Error updating day:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Day not found" });
    }
    return res.status(500).json({ message: "Failed to update day" });
  }
}

// DELETE /days/:id  - delete a day (and maybe its rows)
export async function deleteDay(req, res) {
  const { id } = req.params;

  try {
    // If you want cascading deletes, either:
    // - configure onDelete: Cascade in the schema, OR
    // - manually delete rows first:
    await prisma.row.delet({ where: { dayId: id } });

    await prisma.day.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting day:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Day not found" });
    }
    return res.status(500).json({ message: "Failed to delete day" });
  }
}
