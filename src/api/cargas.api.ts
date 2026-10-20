import api from "./axios";
import type { SolicitudCargaItem, AudienciaPendienteItem, ResultadoCarga } from "../models/carga";

// Normaliza fechas a formato ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss)
function normalizarFecha(fecha: any): string | null {
    if (!fecha) return null;
    if (typeof fecha === "string") {
        const limpia = fecha.trim();
        if (!limpia || limpia === "-") return null;
        return limpia;
    }
    if (fecha instanceof Date && !isNaN(fecha.getTime())) {
        return fecha.toISOString().split("T")[0];
    }
    return String(fecha);
}

// POST /cargas/solicitudes
export async function cargarSolicitudesApi(
    usuarioCarga: string,
    registros: SolicitudCargaItem[] = [],
    cabecera: Record<string, any> = {}
): Promise<ResultadoCarga> {
    const detallesSaneados = registros.map((item) => {
        const idSujeto = item.IdSujetoPasivo
            ? (!isNaN(Number(item.IdSujetoPasivo)) ? Number(item.IdSujetoPasivo) : String(item.IdSujetoPasivo).trim())
            : null;

        const folio = String(item.Folio || "").trim();
        const fechaIngreso = normalizarFecha(item.FechaIngreso);
        const fechaRespuesta = normalizarFecha(item.FechaRespuesta);
        const fechaAgendada = normalizarFecha(item.FechaAgendada);
        const nombreSujetoPasivo = String(item.NombreSujetoPasivo || "").trim();
        const cargo = String(item.Cargo || "").trim();
        const rutSujetoActivo = String(item.RutSujetoActivo || "").trim();
        const nombreSujetoActivo = String(item.NombreSujetoActivo || "").trim();
        const representado = item.Representado ? String(item.Representado).trim() : null;
        const materia = String(item.Materia || "").trim();
        const especificacionMateria = item.EspecificacionMateria ? String(item.EspecificacionMateria).trim() : null;
        const estado = String(item.Estado || "ingresada").trim().toLowerCase();

        return {
            Folio: folio,
            folio: folio,
            FechaIngreso: fechaIngreso,
            fechaIngreso: fechaIngreso,
            FechaRespuesta: fechaRespuesta,
            fechaRespuesta: fechaRespuesta,
            FechaAgendada: fechaAgendada,
            fechaAgendada: fechaAgendada,
            IdSujetoPasivo: idSujeto,
            idSujetoPasivo: idSujeto,
            NombreSujetoPasivo: nombreSujetoPasivo,
            nombreSujetoPasivo: nombreSujetoPasivo,
            Cargo: cargo,
            cargo: cargo,
            RutSujetoActivo: rutSujetoActivo,
            rutSujetoActivo: rutSujetoActivo,
            NombreSujetoActivo: nombreSujetoActivo,
            nombreSujetoActivo: nombreSujetoActivo,
            Representado: representado,
            representado: representado,
            Materia: materia,
            materia: materia,
            EspecificacionMateria: especificacionMateria,
            especificacionMateria: especificacionMateria,
            Estado: estado,
            estado: estado
        };
    });

    const payload = {
        usuarioCarga: usuarioCarga || "SISTEMA",
        usuario: usuarioCarga || "SISTEMA",
        filas: detallesSaneados,
        data: detallesSaneados,
        registros: detallesSaneados,
        detalles: detallesSaneados,
        cabecera: {
            usuarioCarga: usuarioCarga || "SISTEMA",
            fechaCarga: new Date().toISOString(),
            totalRegistros: detallesSaneados.length,
            ...cabecera
        }
    };

    const response = await api.post<ResultadoCarga>("/cargas/solicitudes", payload, {
        headers: {
            "Content-Type": "application/json"
        }
    });
    return response.data;
}

// POST /cargas/audiencias
export async function cargarAudienciasPendientesApi(
    usuarioCarga: string,
    detalles: AudienciaPendienteItem[],
    cabecera: Record<string, any> = {}
): Promise<ResultadoCarga> {
    const detallesSaneados = detalles.map((item) => {
        const folio = String(item.Folio || "").trim();
        const estado = String(item.Estado || "Realizada").trim();
        const forma = item.Forma ? String(item.Forma).trim() : "1";
        const materia = String(item.Materia || "").trim();
        const espec = item.Especificacion_materia_tratada ? String(item.Especificacion_materia_tratada).trim() : null;
        const lugar = String(item.Lugar || "").trim();
        const comuna = item.Comuna ? String(item.Comuna).trim() : null;
        const sujetoPasivo = String(item.Sujeto_pasivo || "").trim();
        const cargo = String(item.Cargo || "").trim();
        const sujetoActivo = String(item.Sujeto_activo || "").trim();
        const rut = String(item.Rut || "").trim();
        const genero = item.Genero ? String(item.Genero).trim() : "No especificado";
        const fechaInicio = normalizarFecha(item.Fecha_inicio);
        const fechaTermino = normalizarFecha(item.Fecha_termino);

        return {
            Folio: folio,
            Estado: estado,
            Forma: forma,
            Materia: materia,
            Especificacion_materia_tratada: espec,
            EspecificacionMateria: espec,
            Lugar: lugar,
            Comuna: comuna,
            Sujeto_pasivo: sujetoPasivo,
            SujetoPasivo: sujetoPasivo,
            NombreSujetoPasivo: sujetoPasivo,
            Cargo: cargo,
            Sujeto_activo: sujetoActivo,
            SujetoActivo: sujetoActivo,
            NombreSujetoActivo: sujetoActivo,
            Rut: rut,
            RutSujetoActivo: rut,
            Genero: genero,
            Fecha_inicio: fechaInicio,
            FechaInicio: fechaInicio,
            Fecha_termino: fechaTermino,
            FechaTermino: fechaTermino
        };
    });

    const payload = {
        usuarioCarga: usuarioCarga || "SISTEMA",
        usuario: usuarioCarga || "SISTEMA",
        filas: detallesSaneados,
        data: detallesSaneados,
        registros: detallesSaneados,
        detalles: detallesSaneados,
        cabecera: {
            usuarioCarga: usuarioCarga || "SISTEMA",
            fechaCarga: new Date().toISOString(),
            totalRegistros: detallesSaneados.length,
            ...cabecera
        }
    };

    try {
        const response = await api.post<ResultadoCarga>("/cargas/audiencias", payload, {
            headers: {
                "Content-Type": "application/json"
            }
        });
        return response.data;
    } catch (err: any) {
        if (err.response?.status === 404) {
            const fallbackRes = await api.post<ResultadoCarga>(
                "/cargas/audiencias/pendientes-publicacion",
                payload,
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
            return fallbackRes.data;
        }
        throw err;
    }
}

// POST /cargas/viajes/lobby
export async function cargarViajesLobbyApi(
    usuarioCarga: string,
    filas: Record<string, any>[]
): Promise<ResultadoCarga> {
    const payload = {
        usuarioCarga: usuarioCarga || "SISTEMA",
        filas,
        data: filas,
        registros: filas
    };

    const response = await api.post<ResultadoCarga>("/cargas/viajes/lobby", payload, {
        headers: {
            "Content-Type": "application/json"
        }
    });
    return response.data;
}

// POST /cargas/viajes/gydp
export async function cargarViajesGYDPApi(
    usuarioCarga: string,
    filas: Record<string, any>[]
): Promise<ResultadoCarga> {
    const payload = {
        usuarioCarga: usuarioCarga || "SISTEMA",
        filas,
        data: filas,
        registros: filas
    };

    const response = await api.post<ResultadoCarga>("/cargas/viajes/gydp", payload, {
        headers: {
            "Content-Type": "application/json"
        }
    });
    return response.data;
}