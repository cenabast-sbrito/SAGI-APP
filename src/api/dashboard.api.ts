import api from "./axios";
import type { Dashboard as DashboardModel } from "../models/dashboard";

export async function obtenerDashboard() {
    const response = await api.get<DashboardModel>("/dashboard");
    return response.data;
}