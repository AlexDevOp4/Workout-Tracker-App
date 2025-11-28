import { api } from "./client";

export const getClients = async (trainerId) =>
  (await api.get(`/api/client/${trainerId}`)).data;
export const getClientsUsers = async (clerkId) =>
  (await api.get(`/api/client/user/${clerkId}`)).data;
export const getAllClients = async () =>
  (await api.get("/api/client/all")).data;
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
