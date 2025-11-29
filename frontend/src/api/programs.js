import { api } from "./client";

export const getPrograms = async (clientId) =>
  (await api.get("/api/programs", { params: { clientId } })).data;
export const getProgram = async (id) =>
  (await api.get(`/api/programs/${id}`)).data;
export const createProgram = async (body) =>
  (await api.post("/api/programs", body)).data;
export const updateProgram = async (id, body) =>
  (await api.patch(`/api/programs/${id}`, body)).data;
export const softDeleteProgram = async (id) =>
  (await api.post(`/api/programs/${id}`)).data;
export const rollForward = async (programId, weekNumber) =>
  (await api.post(`/${programId}/weeks/${weekNumber}/roll-forward`)).data;
