import { api } from "./client";

export const getClients = async () => (await api.get("/api/clients")).data;
export const getClient = async (id) => (await api.get(`/api/clients/${id}`)).data
export const createClient = async (id, body) => (await api.post(`/api/clients/create/${id}`, body)).data;
export const updateClient = async (id, body) => (await api.patch(`/api/clients/${id}`, body)).data;
export const deleteClient = async (id) => (await api.delete(`/api/clients/${id}`)).data;
export const restoreClient = async (id) => (await api.post(`/api/clients/${id}/restore`)).data
