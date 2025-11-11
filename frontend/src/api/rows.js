import { api } from "./client";

export const getRow= async (query) => (await api.get(`/api/rows`, query)).data;
export const createRow= async (body) => (await api.post("/api/rows/create", body)).data;
export const updateRow= async (id, body) => (await api.patch(`/api/rows/${id}`, body)).data;
export const deleteRow= async (id) => (await api.delete(`/api/rows/${id}`)).data;
