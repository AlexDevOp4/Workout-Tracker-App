import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

// POST /api/rows/create
export const createRow = async (req, res) => {
    const {
        weekId,
        dayNumber,
        exercise,
        sets,
        weightLbs,
        targetRepsMin,
        targetRepsMax,
        rir,
        restSec,
        actualReps,
        notes
    } = req.body
    // Rule: (weekId, dayNumber) can repeat (multiple exercises per day),
    // but order is implicit by createdAt; if you want explicit order, add orderIndex.

    const required = { weekId, dayNumber, exercise, sets, weightLbs, targetRepsMin, targetRepsMax, rir, restSec, actualReps };

    for (const [key, value] of Object.entries(required)) {
        if (value === undefined || value === null || value === "") {
            return res.status(400).json({ message: `${key} is required` });
        }
    }

    try {

        const row = await prisma.row.create({
            data: {
                weekId,
                dayNumber,
                exercise,
                sets,
                weightLbs,
                targetRepsMin,
                targetRepsMax,
                rir,
                restSec,
                actualReps,
                notes
            }
        })

        return res.status(201).json(row)

    } catch (error) {

        return res.status(500).json({ error: "Failed to create row: " + error })

    }
}

// GET /api/rows?weekId=...&dayNumber?=...
export const getRow = async (req, res) => {
    const { weekId, dayNumber } = req.query

    if (!weekId) return res.status(400).json({ message: `Week Id is required` });

    const where = {}
    if (weekId) where.weekId = weekId
    if (dayNumber) where.dayNumber = Number(dayNumber)


    try {
        const row = await prisma.row.findMany({ where })
        return res.status(200).json(row)

    } catch (error) {
        return res.status(500).json({ error: "Failed to create row: " + error })
    }
}

// PATCH /api/rows/:id
export const updateRow = async (req, res) => {
    const id = req.params.id
    if (!id) return res.status(400).json({ message: `Id is required` });

    const {
        weekId,
        dayNumber,
        exercise,
        sets,
        weightLbs,
        targetRepsMin,
        targetRepsMax,
        rir,
        restSec,
        actualReps,
        notes
    } = req.body

    const payload = {}

    // Strings
    if (weekId !== undefined) payload.weekId = String(weekId).trim();
    if (exercise !== undefined) payload.exercise = String(exercise).trim();
    if (notes !== undefined) payload.notes = String(notes);

    // Integers
    if (dayNumber !== undefined) payload.dayNumber = Number(dayNumber);
    if (sets !== undefined) payload.sets = Number(sets);
    if (weightLbs !== undefined) payload.weightLbs = Number(weightLbs);
    if (targetRepsMin !== undefined) payload.targetRepsMin = Number(targetRepsMin);
    if (targetRepsMax !== undefined) payload.targetRepsMax = Number(targetRepsMax);
    if (rir !== undefined) payload.rir = Number(rir);
    if (restSec !== undefined) payload.restSec = Number(restSec);

    // Arrays
    if (actualReps !== undefined) {
        if (!Array.isArray(actualReps)) {
            return res.status(400).json({ message: "actualReps must be an array" });
        }
        payload.actualReps = actualReps.map(Number);
    }

    if (Object.keys(payload).length === 0) {
        return res.status(400).json({ message: "No fields to update" });
    }


    try {
        const row = await prisma.row.update({
            where: { id },
            data: payload
        })
        return res.status(200).json(row)

    } catch (error) {
        return res.status(500).json({ error: "Failed to fetching row: " + error })
    }
}

// DELETE /api/rows/:id
export const deleteRow = async (req, res) => {
    const id = req.params.id
    if (!id) return res.status(400).json({ message: `Id is required` });

    try {

        const deleted = await prisma.row.delete({
            where: { id }
        })

        return res.status(200).json({ message: "Row successfully deleted!", deleted })

    } catch (error) {
        if (error.code === "P2025") return res.status(400).json({ messasge: "Row not found." })
        return res.status(500).json({ error: "Failed to delete row: " + error })
    }
}