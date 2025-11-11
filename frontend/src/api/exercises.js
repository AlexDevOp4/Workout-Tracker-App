import { api } from "./client";

export const getExercises = async (query) => (await api.get("/api/exercises", query)).data;
export const createExercises = async (body) => (await api.post("/api/exercises/create", body)).data;
export const getExerciseById = async (id) => (await api.get(`/api/exercises/${id}`)).data;
export const updateExercise = async (id, body) => (await api.patch(`/api/exercises/${id}`, body)).data;
export const deleteExercise = async (id) => (await api.delete(`/api/exercises/${id}`)).data;
