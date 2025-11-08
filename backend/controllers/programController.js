import pkg from "@prisma/client";
const { PrismaClient } = pkg;

import { z } from "zod";
import { DateTime } from "luxon";

const prisma = new PrismaClient();
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

// POST /api/programs
export const createProgram = async (req, res) => {
    const { clientProfileId, trainerId, title, startDate } = req.body
    const parse = dateSchema.safeParse(req.body.startDate);
    if (!parse.success) return res.status(400).json({ message: parse.error.issues[0].message });

    const dateStr = parse.data; // "2025-11-05" 

    const utcMidnight = DateTime.fromISO(dateStr, { zone: "UTC" }).startOf("day").toJSDate();


    try {

        const clientProfile = await prisma.clientProfile.findUniqueOrThrow({
            where: {
                id: clientProfileId
            }
        })

        const trainer = await prisma.user.findUniqueOrThrow({
            where: {
                id: trainerId
            }
        })

        if (clientProfile.id !== clientProfileId || trainer.role !== "TRAINER") {
            return res.status(404).json({ error: "Client Profile Id has to be present and only Trainers can create programs!" })
        }

        const programCreated = await prisma.program.create({
            data: {
                clientId: clientProfileId,
                trainerId,
                startDate: utcMidnight,
                status: "active",

            }
        })

        const startDateOut = dateStr; // or DateTime.fromJSDate(program.startDate).toISODate()

        return res.status(201).json({ ...programCreated, startDate: startDateOut })

    } catch (error) {
        res.status(404).json({ error: `Error creating program ${error}` })

    }
}

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
        if (!allowed.has(statusRaw)) return res.status(400).json({ message: "Invalid status" });
        where.status = statusRaw;
    }

    try {
        const programs = await prisma.program.findMany({
            where,
            include: { weeks: { include: { rows: true } } },
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
    const { id } = req.params

    try {

        const program = await prisma.program.findUniqueOrThrow({
            where: {
                id
            },
            include: { weeks: { include: { rows: true } } },
        })

        return res.status(200).json(program)

    } catch (error) {
        console.error("Error", error)
        return res.status(500).json({ message: "Error fetching program" })
    }
}

// PATCH /api/programs/:id
export const updateProgram = async (req, res) => {
    const programId = req.params.id
    const title = req.body.title?.toString().trim()
    const statusRaw = req.body.status?.toString().trim()

    const payload = {}

    if (title) payload.title = title

    if (statusRaw && statusRaw.toLowerCase() !== "all") {
        const allowed = new Set(["active", "completed", "archived"]);
        if (!allowed.has(statusRaw)) return res.status(400).json({ message: "Invalid status" });
        payload.status = statusRaw;
    }

    try {
        const programUpdated = await prisma.program.update({
            where: {
                id: programId
            },
            data: payload
        })

        return res.status(200).json(programUpdated)

    } catch (err) {
        console.error("[getPrograms] ERROR:", err);
        return res.status(500).json({ message: "Server error" });

    }
}

// POST /api/programs/:id/archive
export const softDeleteProgram = async (req, res) => {
    const programId = req.params.id

    try {

        const softDelete = await prisma.program.update({
            where: {
                id: programId
            },
            data: {
                status: "archived"
            }
        })

        return res.status(200).json(softDelete)

    } catch (error) {
        console.error("[getPrograms] ERROR:", err);
        return res.status(500).json({ message: "Server error" });
    }

}

//POST /api/programs/:programId/weeks/:weekNumber/roll-forward
// What it does:

// Clones prior week’s rows into weekNumber + 1.

// Applies simple progression:

// If actualReps.length ≥ sets AND every actualReps[i] ≥ targetRepsMax → weightLbs += increment.

// Else keep weight; optionally flag needsWork boolean.

// increment rule: default +5 lb upper body, +10 lb lower(config per exercise category later).

//     Acceptance:

// Creates Week N + 1 atomically.

// Copies all rows; adjusts weights where criteria met.

// Idempotent guard: 409 if Week N + 1 already exists.

export const rollForward = async (req, res) => {
    let { programId, weekNumber } = req.params
    const weekToNum = Number(weekNumber)

    try {

        const priorWeek = await prisma.program.findMany({
            where: {
                id: programId
            },
            include: {
                weeks: {
                    where: {
                        weekNumber: weekToNum
                    },
                    include: {
                        rows: true,
                    }
                }
            }
        })

        const newWeek = {
            weekNumber: priorWeek[0].weeks[0].weekNumber + 1
        }

        const rows = priorWeek[0].weeks[0].rows

        const summary = rows.map(row => {
            const metTarget = row.actualReps.every(rep => rep >= row.targetRepsMax);
            return {
                exercise: row.exercise,
                weightLbs: metTarget && row.actualReps.length >= row.sets ? row.weightLbs + 5 : row.weightLbs
            };
        });


        console.log(summary)

        return res.status(200).json(priorWeek)

    } catch (error) {
        return res.status(500).json({ message: "Server error" + error });
    }
}