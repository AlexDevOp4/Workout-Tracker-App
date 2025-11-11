import { api } from "./client";

export const getUsers = async () => (await api.get("/api/users")).data;
export const getUser = async (id) => (await api.get(`/api/users${id}`)).data;
export const createUser = async (body) => (await api.post("/api/users/create", body)).data;
export const updateUser = async (id, body) => (await api.patch(`/api/users/${id}`, body)).data;
export const deleteUser = async (id) => (await api.delete(`/api/users/${id}`)).data;
