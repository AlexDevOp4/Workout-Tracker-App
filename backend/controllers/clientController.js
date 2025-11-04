import { clerkClient } from "@clerk/express";
import pkg from "@prisma/client";
import { json } from "express";
const { PrismaClient, Prisma } = pkg;

export const prisma = new PrismaClient({
  log: ["query", "warn", "error"],
});

// POST /api/create/:id
export const createClient = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        clerkId: req.params.id
      }
    })


    const client = await prisma.clientProfile.create({
      data: {
        user: { connect: { id: user.id } },
        trainer: { connect: { id: req.body.trainerId } },
        name: req.body.name,
        notes: req.body.notes

      }
    })

    res.status(200).json(client)
  } catch (error) {
    return res.status(404).json({ error: "Error created Client: " + error })

  }
};

// GET /api/clients
export const getClientlists = async (req, res) => {
  const { trainerId } = req.query


  try {

    const clients = await prisma.clientProfile.findMany({
      where: {
        trainerId: trainerId
      },
      omit: {
        id: true,
      }
    })


    return res.status(200).json(clients)
  } catch (error) {
    console.log(error)

    return res.status(404).json({ error: "Error fetching cleints: " + error })

  }
};

// GET /api/clients/:id
export const getClientById = async (req, res) => {
  const { trainerId } = req.query
  const { id } = req.params

  try {

    const clients = await prisma.clientProfile.findMany({
      where: {
        trainerId: trainerId
      },

      omit: {
        id: true
      }
    })

    const client = clients.filter((c) => c.userId == id)

    const clientData = {
      trainerId: client[0].trainerId,
      name: client[0].name,
      notes: client[0].notes,
      archived: client[0].archived
    }

    return res.status(200).json(clientData)

  } catch (error) {
    return res.status(404).json({ error: "Errer fetching cleint: " + error })

  }


}

// PATCH /api/clients/:id
export const updateClientById = async (req, res) => {
  const { id } = req.params

  const { name, notes, trainerId } = req.body

  const hasName = typeof name !== "undefined"
  const hasNotes = typeof notes !== "undefined"
  const hasTrainerId = typeof trainerId !== "undefined"

  const payload = {}

  try {

    if (hasName) {
      payload.name = String(name).trim()
    }

    if (hasNotes) {
      payload.notes = notes
    }

    if (hasTrainerId) {

      try {
        const trainer = await prisma.user.findUniqueOrThrow({
          where: {
            id: trainerId
          }
        })
        payload.trainerId = trainer.id

      } catch (error) {
        return res.status(500).json({ message: "User not found! " + error })
      }
    }



    const updatedClient = await prisma.clientProfile.update({
      where: { userId: id },
      data: payload
    })

    return res.status(200).json({ updatedClient, message: "Client Updated!" })

  } catch (error) {
    return res.status(404).json({ error: "Failed to update client" + error })
  }
}

// DELETE /api/clients/:id
export const softDeleteClient = async (req, res) => {
  const { id } = req.params

  try {
    const client = await prisma.clientProfile.update({
      where: { userId: id },
      data: {
        archived: true
      }
    })

    return res.status(200).json({ message: `${client.name} has been deleted!` })
  } catch (error) {
    return res.status(404).json({ error: `Couldn't delete user! ${error}` })
  }
}

// POST /api/clients/:id/restore
export const restoreClient = async (req, res) => {
  const { id } = req.params

  try {
    const client = await prisma.clientProfile.update({
      where: { userId: id },
      data: {
        archived: false
      }
    })

    return res.status(200).json({ message: `${client.name} has been restored!` })
  } catch (error) {
    return res.status(404).json({ error: `Couldn't restore user! ${error}` })
  }
}