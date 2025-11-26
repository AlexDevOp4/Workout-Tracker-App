import { api } from "./client";

export const getClients = async (trainerId) =>
  (await api.get("/api/client", { params: { trainerId } })).data;
export const getClient = async (id) =>
  (await api.get(`/api/client/${id}`)).data;
export const createClient = async (id, body) =>
  (await api.post(`/api/client/create/${id}`, body)).data;
export const updateClient = async (id, body) =>
  (await api.patch(`/api/client/${id}`, body)).data;
export const deleteClient = async (id) =>
  (await api.delete(`/api/client/${id}`)).data;
export const restoreClient = async (id) =>
  (await api.post(`/api/client/${id}/restore`)).data;
