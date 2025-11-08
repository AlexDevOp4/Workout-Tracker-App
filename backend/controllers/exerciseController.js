import pkg from "@prisma/client";
import { clerkClient } from '@clerk/express'
const { PrismaClient, Prisma } = pkg;

const prisma = new PrismaClient();

// POST /api/exercises
export const createExercises = async (req, res) => {
    const { name, category } = req.body

    const allowedCategories = new Set(["UPPER", "LOWER"])
    if (!allowedCategories.has(String(category))) return res.status(400).json({ message: "Invalid Role" })

    try {

        const getExerciseName = await prisma.exercise.findFirst({
            where: {
                name
            }
        })

        if (getExerciseName) return res.status(400).json({ message: "Exercise already exists!" })

        const exercise = await prisma.exercise.create({
            data: { name, category }
        })

        return res.status(201).json(exercise)



    } catch (error) {

        console.error(err);
        return res.status(500).json({ message: "Failed to create exercise." });

    }
}

// GET /api/exercises?category=UPPER|LOWER&search=&page=&pageSize=
export const getExercises = async (req, res) => {
    const { category } = req.query
    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 10

    const skip = (page - 1) * pageSize;
    const take = pageSize

    try {
        const where = {};
        if (category && ["UPPER", "LOWER"].includes(category.toUpperCase())) {
            where.category = category.toUpperCase();
        }

        const exercises = await prisma.exercise.findMany({
            where,
            skip,
            take,
            orderBy: { name: "asc" },
        });

        return res.status(200).json(exercises)

    } catch (error) {
        console.error("Error", error)
        return res.status(500).json({ message: "Error fetching exercise" })
    }
}

// GET /api/exercises/:id
export const getExerciseById = async (req, res) => {
    const { id } = req.params

    try {

        const exercise = await prisma.exercise.findUniqueOrThrow({
            where: { id }
        })

        return res.status(200).json(exercise)

    } catch (error) {
        console.error("Error", error)
        return res.status(500).json({ message: "Error fetching exercise" })
    }
}

// PATCH /api/exercises/:id
export const updateExercise = async (req, res) => {
    const { id } = req.params
    const { name, category } = req.body.toString().trim()



    const payload = {}

    if (name) payload.name = name
    if (category && ["UPPER", "LOWER"].includes(category.toUpperCase())) {
        payload.category = category.toUpperCase();
    }

    try {
        const exerciseUpdated = await prisma.exercise.update({
            where: { id },
            data: payload
        })

        return res.status(200).json(exerciseUpdated)

    } catch (error) {
        if (error.code === "P2025") return res.status(404).json({ message: "User not found." })
        console.error("Error", error)
        return res.status(500).json({ message: "Error updating exercise" })
    }


}

export const deleteExercise = async (req, res) => {
    const id = req.params.id

    if (!id) return res.status(400).json({ message: "Id is required" })

    try {
        const deletedExercise = await prisma.exercise.delete({
            where: { id }
        })

        return res.status(200).json({ message: "Exercise successfully deleted.", deletedExercise })

    } catch (error) {
        if (error.code === "P2025") return res.status(404).json({ message: "User not found." })
        console.error("Error", error)
        return res.status(500).json({ message: "Error deleting exercise" })
    }



}