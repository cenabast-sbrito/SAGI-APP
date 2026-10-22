import api from "./axios";
import type { DashboardData, DashboardFiltros } from "../models/dashboard";

/**
 * Obtiene las métricas consolidadas del Dashboard de Alertas SAGI
 * @param filtros Opciones de filtrado por rango o fechas personalizadas
 */
export async function obtenerDashboard(filtros?: DashboardFiltros): Promise<DashboardData> {
    const params: Record<string, string> = {};

    if (filtros) {
        if (filtros.rango) {
            params["rango"] = filtros.rango;
        }

        if (filtros.rango === "PERSONALIZADO") {
            if (filtros.fechaDesde?.trim()) {
                params["fechaDesde"] = filtros.fechaDesde.trim();
            }
            if (filtros.fechaHasta?.trim()) {
                params["fechaHasta"] = filtros.fechaHasta.trim();
            }
        }
    }

    const response = await api.get<DashboardData>("/dashboard", { params });
    return response.data;
}