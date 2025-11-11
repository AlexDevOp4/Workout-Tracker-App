import { api } from "./client";

export const getWeekByProgramId = async (query) => (await api.get("/api/weeks", query)).data;
export const createWeeks = async (body) => (await api.post("/api/weeks/create", body)).data;
export const updateDeloadWeek = async (id, body) => (await api.patch(`/api/weeks/${id}`, body)).data;
export const getWeekById = async (id) => (await api.get(`/api/weeks/${id}`)).data;
