import api from "./axios";
import type { SolicitudCargaItem, AudienciaPendienteItem, ResultadoCarga } from "../models/carga";

// POST /cargas/solicitudes
export async function cargarSolicitudesApi(
    usuarioCarga: string,
    registros: SolicitudCargaItem[] = [],
    cabecera: Record<string, any> = {}
): Promise<ResultadoCarga> {
    // Saneamiento de datos antes de enviar
    const detallesSaneados = registros.map(item => ({
        Folio: String(item.Folio || "").trim(),
        FechaIngreso: item.FechaIngreso || null,
        FechaRespuesta: item.FechaRespuesta || null,
        FechaAgendada: item.FechaAgendada || null,
        IdSujetoPasivo: item.IdSujetoPasivo ? Number(item.IdSujetoPasivo) || item.IdSujetoPasivo : null,
        NombreSujetoPasivo: String(item.NombreSujetoPasivo || "").trim(),
        Cargo: String(item.Cargo || "").trim(),
        RutSujetoActivo: String(item.RutSujetoActivo || "").trim(),
        NombreSujetoActivo: String(item.NombreSujetoActivo || "").trim(),
        Representado: item.Representado ? String(item.Representado).trim() : null,
        Materia: String(item.Materia || "").trim(),
        EspecificacionMateria: item.EspecificacionMateria ? String(item.EspecificacionMateria).trim() : null,
        Estado: String(item.Estado || "ingresada").trim().toLowerCase()
    }));

    // Se envía con compatibilidad dual: formato cabecera/detalles y registros directo
    const payload = {
        usuarioCarga,
        cabecera: {
            usuarioCarga,
            fechaCarga: new Date().toISOString(),
            totalRegistros: detallesSaneados.length,
            ...cabecera
        },
        detalles: detallesSaneados,
        registros: detallesSaneados
    };

    const response = await api.post<ResultadoCarga>("/cargas/solicitudes", payload);
    return response.data;
}

// POST /cargas/audiencias/pendientes-publicacion
export async function cargarAudienciasPendientesApi(
    usuarioCarga: string,
    detalles: AudienciaPendienteItem[],
    cabecera: Record<string, any> = {}
): Promise<ResultadoCarga> {
    // Saneamiento y compatibilidad de campos para SAGI_$TEMPaudiencias_pendientes_publicacion
    const detallesSaneados = detalles.map(item => ({
        Folio: String(item.Folio || "").trim(),
        Estado: String(item.Estado || "Realizada").trim(),
        Forma: item.Forma ? String(item.Forma).trim() : "1",
        Materia: String(item.Materia || "").trim(),
        Especificacion_materia_tratada: item.Especificacion_materia_tratada ? String(item.Especificacion_materia_tratada).trim() : null,
        EspecificacionMateria: item.Especificacion_materia_tratada ? String(item.Especificacion_materia_tratada).trim() : null,
        Lugar: String(item.Lugar || "").trim(),
        Comuna: item.Comuna ? String(item.Comuna).trim() : null,
        Sujeto_pasivo: String(item.Sujeto_pasivo || "").trim(),
        SujetoPasivo: String(item.Sujeto_pasivo || "").trim(),
        NombreSujetoPasivo: String(item.Sujeto_pasivo || "").trim(),
        Cargo: String(item.Cargo || "").trim(),
        Sujeto_activo: String(item.Sujeto_activo || "").trim(),
        SujetoActivo: String(item.Sujeto_activo || "").trim(),
        NombreSujetoActivo: String(item.Sujeto_activo || "").trim(),
        Rut: String(item.Rut || "").trim(),
        RutSujetoActivo: String(item.Rut || "").trim(),
        Genero: item.Genero ? String(item.Genero).trim() : "No especificado",
        Fecha_inicio: item.Fecha_inicio || null,
        FechaInicio: item.Fecha_inicio || null,
        Fecha_termino: item.Fecha_termino || null,
        FechaTermino: item.Fecha_termino || null
    }));

    const payload = {
        usuarioCarga,
        cabecera: {
            usuarioCarga,
            fechaCarga: new Date().toISOString(),
            totalRegistros: detallesSaneados.length,
            ...cabecera
        },
        detalles: detallesSaneados,
        registros: detallesSaneados
    };

    const response = await api.post<ResultadoCarga>("/cargas/audiencias/pendientes-publicacion", payload);
    return response.data;
}