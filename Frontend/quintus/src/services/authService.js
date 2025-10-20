import api from "@/lib/api";

export const login = async (email, password) =>
    api.post("auth/login", { email, password });

export const logout = async () =>
    api.post("/auth/logout");

export const register = async (userDTO) =>
    api.post("/auth/register", userDTO);

export const getCurrentUser = async () =>
    api.get("auth/getCurrentUser");