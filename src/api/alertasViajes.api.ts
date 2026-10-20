import api from "./axios";
import type { AlertaViaje, FiltroAlertaViaje } from "../models/alertaViaje";

function formatearRut(rut: any): string {
    if (!rut && rut !== 0) return "-";
    const str = String(rut).trim();
    if (str.includes("-")) return str;
    return str.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function normalizarItemViaje(item: any, index: number): AlertaViaje {
    // Une TNombres + TPaterno + TMaterno si existen, o toma las variantes
    const partes = [item.TNombres, item.TPaterno, item.TMaterno]
        .filter(Boolean)
        .map((s: string) => String(s).trim());

    const nombreCompleto =
        partes.length > 0
            ? partes.join(" ")
            : item.nombreSujetoPasivo ||
              item.NombreSujetoPasivo ||
              item.SujetoPasivo ||
              item.NombreFuncionario ||
              "Funcionario sin nombre";

    const fechaIni = item.FechaInicio || item.fechaInicio || item.FECHA_INI || null;
    const fechaTer = item.FechaTermino || item.fechaTermino || item.FECHA_TER || null;
    const destino = item.Destino || item.destino || item.LugarDestino || item.Lugar || "-";
    const rutStr = formatearRut(item.Rut || item.rut || item.RUT);

    const estado = item.estadoAlerta || item.EstadoAlerta || item.Estado || "Coincidente";
    const color = item.colorAlerta || item.ColorAlerta || (estado === "Coincidente" ? "Verde" : "Amarillo");

    return {
        idViaje: item.idViaje || item.IdViaje || index,
        rut: rutStr,
        Rut: item.Rut ?? item.rut,
        TNombres: item.TNombres,
        TPaterno: item.TPaterno,
        TMaterno: item.TMaterno,
        nombreSujetoPasivo: nombreCompleto,
        cargo: item.Cargo || item.cargo || "",
        correo: item.Correo || item.correo || null,
        destino,
        objetoViaje: item.ObjetoViaje || item.objetoViaje || item.Objeto || "",
        fechaInicio: fechaIni,
        FechaInicio: fechaIni,
        fechaTermino: fechaTer,
        FechaTermino: fechaTer,
        estadoAlerta: estado,
        colorAlerta: color,
        origen: item.origen || item.Origen || "GYDP",
        observacion: item.observacion || item.Observacion || ""
    };
}

export async function obtenerAlertasViajes(
    filtros?: Partial<FiltroAlertaViaje>
): Promise<AlertaViaje[]> {
    const params: Record<string, string> = {};

    if (filtros) {
        if (filtros.nombreSujetoPasivo?.trim()) {
            params["nombreSujetoPasivo"] = filtros.nombreSujetoPasivo.trim();
        }
        if (filtros.destino?.trim()) {
            params["destino"] = filtros.destino.trim();
        }
        if (filtros.origenDato && filtros.origenDato !== "TODOS") {
            params["origen"] = filtros.origenDato;
        }
        if (filtros.rango?.trim()) {
            params["rango"] = filtros.rango.trim();
        }
        if (filtros.rango === "PERSONALIZADO") {
            if (filtros.fechaDesde?.trim()) params["fechaDesde"] = filtros.fechaDesde.trim();
            if (filtros.fechaHasta?.trim()) params["fechaHasta"] = filtros.fechaHasta.trim();
        }
    }

    let rawList: any[] = [];

    try {
        const response = await api.get("/alertas/viajes", { params });
        rawList = Array.isArray(response.data) ? response.data : (response.data as any)?.data || [];
    } catch (err: any) {
        if (err.response?.status === 404) {
            try {
                const resFallback = await api.get("/viajes", { params });
                rawList = Array.isArray(resFallback.data) ? resFallback.data : (resFallback.data as any)?.data || [];
            } catch {
                rawList = [];
            }
        } else {
            throw err;
        }
    }

    let datos = rawList.map(normalizarItemViaje);

    // Filtros de respaldo en cliente
    if (filtros) {
        if (filtros.nombreSujetoPasivo?.trim()) {
            const nom = filtros.nombreSujetoPasivo.trim().toLowerCase();
            datos = datos.filter((item) =>
                item.nombreSujetoPasivo.toLowerCase().includes(nom)
            );
        }
        if (filtros.destino?.trim() && filtros.destino !== "-") {
            const dest = filtros.destino.trim().toLowerCase();
            datos = datos.filter((item) =>
                item.destino.toLowerCase().includes(dest)
            );
        }
        if (filtros.rango === "SEMANA") {
            const semanaAtras = new Date();
            semanaAtras.setDate(semanaAtras.getDate() - 7);
            datos = datos.filter(
                (item) => item.fechaInicio && new Date(item.fechaInicio) >= semanaAtras
            );
        } else if (filtros.rango === "MES") {
            const mesAtras = new Date();
            mesAtras.setDate(mesAtras.getDate() - 30);
            datos = datos.filter(
                (item) => item.fechaInicio && new Date(item.fechaInicio) >= mesAtras
            );
        } else if (filtros.rango === "PERSONALIZADO") {
            if (filtros.fechaDesde?.trim()) {
                const desde = new Date(filtros.fechaDesde.trim());
                datos = datos.filter(
                    (item) => item.fechaInicio && new Date(item.fechaInicio) >= desde
                );
            }
            if (filtros.fechaHasta?.trim()) {
                const hasta = new Date(filtros.fechaHasta.trim());
                hasta.setDate(hasta.getDate() + 1);
                datos = datos.filter(
                    (item) => item.fechaInicio && new Date(item.fechaInicio) <= hasta
                );
            }
        }
    }

    return datos;
}