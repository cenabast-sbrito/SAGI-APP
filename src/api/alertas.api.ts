import api from "./axios";
import type { Alerta } from "../models/alerta";
import type { ResumenAlerta } from "../models/resumenAlerta";
import type { FiltroAlerta } from "../components/PanelFiltrosAlertas";

export async function obtenerAlertas(filtros?: Partial<FiltroAlerta>): Promise<Alerta[]> {
    const params: Record<string, string> = {};

    if (filtros) {
        if (filtros.estado?.trim()) {
            params["Estado"] = filtros.estado.trim();
            params["estado"] = filtros.estado.trim();
        }
        if (filtros.nombreSujetoPasivo?.trim()) {
            params["NombreSujetoPasivo"] = filtros.nombreSujetoPasivo.trim();
            params["nombreSujetoPasivo"] = filtros.nombreSujetoPasivo.trim();
            params["sujetoPasivo"] = filtros.nombreSujetoPasivo.trim();
        }
        if (filtros.cargo?.trim()) {
            params["Cargo"] = filtros.cargo.trim();
            params["cargo"] = filtros.cargo.trim();
        }
        if (filtros.folio?.trim()) {
            params["Folio"] = filtros.folio.trim();
            params["folio"] = filtros.folio.trim();
        }
        if (filtros.color?.trim()) {
            params["Color"] = filtros.color.trim();
            params["color"] = filtros.color.trim();
        }
        if (filtros.tipoAlerta?.trim()) {
            params["TipoAlerta"] = filtros.tipoAlerta.trim();
            params["tipoAlerta"] = filtros.tipoAlerta.trim();
        }
        if (filtros.rango?.trim()) {
            params["Rango"] = filtros.rango.trim();
            params["rango"] = filtros.rango.trim();
        }
        if (filtros.rango === "PERSONALIZADO") {
            if (filtros.fechaDesde?.trim()) {
                params["FechaDesde"] = filtros.fechaDesde.trim();
                params["fechaDesde"] = filtros.fechaDesde.trim();
            }
            if (filtros.fechaHasta?.trim()) {
                params["FechaHasta"] = filtros.fechaHasta.trim();
                params["fechaHasta"] = filtros.fechaHasta.trim();
            }
        }
    }

    const response = await api.get<Alerta[]>("/alertas", { params });
    let datos = Array.isArray(response.data) ? response.data : [];

    // Fallback de filtrado en cliente
    if (filtros) {
        if (filtros.folio?.trim()) {
            const f = filtros.folio.trim().toLowerCase();
            datos = datos.filter(item => item.Folio?.toLowerCase().includes(f));
        }
        if (filtros.nombreSujetoPasivo?.trim()) {
            const n = filtros.nombreSujetoPasivo.trim().toLowerCase();
            datos = datos.filter(item => String(item.NombreSujetoPasivo ?? "").toLowerCase().includes(n));
        }
        if (filtros.cargo?.trim()) {
            const c = filtros.cargo.trim().toLowerCase();
            datos = datos.filter(item => item.Cargo?.toLowerCase().includes(c));
        }
        if (filtros.estado?.trim()) {
            const e = filtros.estado.trim().toLowerCase();
            datos = datos.filter(item => item.Estado?.toLowerCase() === e);
        }
        if (filtros.color?.trim()) {
            const col = filtros.color.trim().toLowerCase();
            datos = datos.filter(item => item.EstadoPlazoRespuesta?.toLowerCase() === col);
        }
        if (filtros.tipoAlerta?.trim()) {
            const t = filtros.tipoAlerta.trim().toLowerCase();
            datos = datos.filter(item => item.TipoAlerta?.toLowerCase() === t);
        }
        if (filtros.rango === "SEMANA") {
            const sieteDiasAtras = new Date();
            sieteDiasAtras.setDate(sieteDiasAtras.getDate() - 7);
            datos = datos.filter(item => item.FechaIngreso && new Date(item.FechaIngreso) >= sieteDiasAtras);
        } else if (filtros.rango === "MES") {
            const unMesAtras = new Date();
            unMesAtras.setMonth(unMesAtras.getMonth() - 1);
            datos = datos.filter(item => item.FechaIngreso && new Date(item.FechaIngreso) >= unMesAtras);
        } else if (filtros.rango === "PERSONALIZADO") {
            if (filtros.fechaDesde?.trim()) {
                const desde = new Date(filtros.fechaDesde.trim());
                datos = datos.filter(item => item.FechaIngreso && new Date(item.FechaIngreso) >= desde);
            }
            if (filtros.fechaHasta?.trim()) {
                const hasta = new Date(filtros.fechaHasta.trim());
                hasta.setDate(hasta.getDate() + 1);
                datos = datos.filter(item => item.FechaIngreso && new Date(item.FechaIngreso) <= hasta);
            }
        }
    }

    return datos;
}

export async function obtenerResumenAlertas(): Promise<ResumenAlerta[]> {
    const response = await api.get<ResumenAlerta[]>("/alertas/resumen");
    return response.data;
}