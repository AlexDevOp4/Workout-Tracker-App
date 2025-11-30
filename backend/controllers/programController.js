import pkg from "@prisma/client";
const { PrismaClient } = pkg;

import { z } from "zod";
import { DateTime } from "luxon";

const prisma = new PrismaClient();
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

// POST /api/programs
export const createProgram = async (req, res) => {
  const { clientProfileId, trainerId, title, startDate } = req.body;
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

    const startDateOut = dateStr; // or DateTime.fromJSDate(program.startDate).toISODate()

    return res.status(201).json({ ...programCreated, startDate: startDateOut });
  } catch (error) {
    res.status(404).json({ error: `Error creating program ${error}` });
  }
};

// GET /api/programs
export const getPrograms = async (req, res) => {
  const clientId = req.query.clientProfileId?.toString().trim();
  const trainerId = req.query.trainerId?.toString().trim();
  const statusRaw = req.query.status?.toString().trim();

  const where = {};

  if (clientId) where.clientId = clientId;
  if (trainerId) where.trainerId = trainerId;

  if (statusRaw && statusRaw.toLowerCase() !== "all") {
    const allowed = new Set(["active", "completed", "archived"]);
    if (!allowed.has(statusRaw))
      return res.status(400).json({ message: "Invalid status" });
    where.status = statusRaw;
  }

  try {
    const programs = await prisma.program.findMany({
      where,
      include: {
        weeks: {
          include: {
            days: {
              orderBy: { dayNumber: "asc" }, // optional but useful
              include: {
                rows: {
                  include: {
                    exercise: true, // ✅ this is on Row
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(programs);
  } catch (err) {
    console.error("[getPrograms] ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/programs/:id
export const getProgramById = async (req, res) => {
  const { id } = req.params;

  try {
    const program = await prisma.program.findUniqueOrThrow({
      where: { id },
      include: {
        weeks: {
          include: {
            days: {
              orderBy: { dayNumber: "asc" }, // optional but useful
              include: {
                rows: {
                  include: {
                    exercise: true, // ✅ this is on Row
                  },
                },
              },
            },
          },
        },
        client: {
          include: {
            user: true,
          },
        },
        trainer: {
          include: {
            trainerProfile: true,
          },
        },
      },
    });

    return res.status(200).json(program);
  } catch (error) {
    console.error("Error", error);
    return res.status(500).json({ message: "Error fetching program" });
  }
};

// PATCH /api/programs/:id
export const updateProgram = async (req, res) => {
  const programId = req.params.id;
  const title = req.body.title?.toString().trim();
  const statusRaw = req.body.status?.toString().trim();

  const payload = {};

  if (title) payload.title = title;

  if (statusRaw && statusRaw.toLowerCase() !== "all") {
    const allowed = new Set(["active", "completed", "archived"]);
    if (!allowed.has(statusRaw))
      return res.status(400).json({ message: "Invalid status" });
    payload.status = statusRaw;
  }

  try {
    const programUpdated = await prisma.program.update({
      where: {
        id: programId,
      },
      data: payload,
    });

    return res.status(200).json(programUpdated);
  } catch (err) {
    console.error("[getPrograms] ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/programs/:id/archive
export const softDeleteProgram = async (req, res) => {
  const programId = req.params.id;

  try {
    const softDelete = await prisma.program.update({
      where: {
        id: programId,
      },
      data: {
        status: "archived",
      },
    });

    return res.status(200).json(softDelete);
  } catch (error) {
    console.error("[getPrograms] ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

//POST /api/programs/:programId/weeks/:weekNumber/roll-forward
export const rollForward = async (req, res) => {
  let { programId, weekNumber } = req.params;
  let weekToNumber = Number(weekNumber);

  try {
    const baseWeek = await prisma.week.findFirst({
      where: { programId, weekNumber: weekToNumber },
      include: {
        rows: {
          include: { exercise: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!baseWeek)
      return res.status(404).json({
        error: { code: "WEEK_NOT_FOUND", message: "Base week not found" },
        data: null,
      });

    const nextNumber = weekToNumber + 1;
    const existingNext = await prisma.week.findFirst({
      where: { programId, weekNumber: nextNumber },
    });
    if (existingNext)
      return res.status(409).json({
        error: {
          code: "WEEK_EXISTS",
          message: `Week ${nextNumber} already exists`,
        },
        data: null,
      });

    await prisma.$transaction(async (tx) => {
      const newWeek = await tx.week.create({
        data: { programId, weekNumber: nextNumber, isDeload: false },
      });

      const newRows = baseWeek.rows.map((row) => {
        const increment = row.exercise.category === "UPPER" ? 5 : 10;

        const allSetsLogged =
          Array.isArray(row.actualReps) && row.actualReps.length >= row.sets;
        const hitTop =
          allSetsLogged &&
          row.actualReps.every(
            (r) => Number.isInteger(r) && r >= row.targetRepsMax
          );

        const nextWeight = hitTop ? row.weightLbs + increment : row.weightLbs;

        return {
          weekId: newWeek.id,
          exerciseId: row.exerciseId,
          dayNumber: row.dayNumber,
          sets: row.sets,
          weightLbs: nextWeight,
          targetRepsMin: row.targetRepsMin,
          targetRepsMax: row.targetRepsMax,
          rir: row.rir,
          restSec: row.restSec,
          actualReps: [],
          notes: null,
          updatedBy: "SYSTEM",
        };
      });

      if (newRows.length === 0) {
        throw new Error("NO_ROWS_TO_CLONE");
      }

      await tx.row.createMany({ data: newRows });
    });

    return res.status(201).json({
      data: { newWeekNumber: nextNumber, rowsCreated: baseWeek.rows.length },
      error: null,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" + error });
  }
};
