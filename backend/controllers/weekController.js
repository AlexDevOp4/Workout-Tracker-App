import pkg from "@prisma/client";
const { PrismaClient } = pkg;

import { z } from "zod";
import { DateTime } from "luxon";

const prisma = new PrismaClient();

// POST /api/weeks/create
export const createWeeks = async (req, res) => {
    const { programId, weekNumber, isDeload } = req.body

    if (!programId || !weekNumber || !isDeload) return res.status(400).json({ message: "All fields are required." })
    if (typeof weekNumber !== 'number') return res.status(400).json({ message: "Week Number must be a number" })

    try {

        const latestWeek = await prisma.week.findFirst({
            where: { programId },
            orderBy: { weekNumber: "desc" }
        })

        const nextWeekNumber = latestWeek ? latestWeek.weekNumber + 1 : 1;

        if (weekNumber !== nextWeekNumber) {
            return res.status(400).json({
                message: `Invalid weekNumber. Must be ${nextWeekNumber}`
            })
        }

        const week = await prisma.week.create({
            data: { programId, weekNumber, isDeload }
        })

        return res.status(200).json(week)

    } catch (error) {
        return res.status(404).json({ error: "Failed to create week: " + error })
    }
}

// GET /api/weeks?programId=
export const getWeekByProgramId = async (req, res) => {
    const programId = req.query.programId?.toString().trim();
    if (!programId) return res.status(400).json({ message: "programId is required" });


    try {
        const week = await prisma.week.findMany({
            where: { programId },
            orderBy: { weekNumber: 'asc' }
        })

        return res.status(200).json(week)
    } catch (error) {
        return res.status(404).json({ error: `Error fetching week ${error}` })

    }
}

// GET /api/weeks/:id
export const getWeekById = async (req, res) => {
    const { id } = req.params
    if (!id) return res.status(400).json({ message: "Id is required." })
    try {
        const week = await prisma.week.findUniqueOrThrow({
            where: { id },
            include: { _count: { select: { rows: true } } }
        })

        return res.status(200).json(week)

    } catch (error) {
        return res.status(404).json({ error: `Error ${error}` })

    }
}

// PATCH /api/weeks/:id (isDeload only).
export const updateDeloadWeek = async (req, res) => {
    const { id } = req.params
    if (!id) return res.status(400).json({ message: "Id is required." })

    try {

        const week = await prisma.week.findUniqueOrThrow({ where: { id } })

        if (!week) return res.status(404).json({ message: "Week not found" });

        const updatedWeek = await prisma.week.update({
            where: { id },
            data: {
                isDeload: !week.isDeload
            }
        })

        return res.status(200).json(updatedWeek);

    } catch (error) {
        return res.status(404).json({ error: `Error ${error}` })
    }
}