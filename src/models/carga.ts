// Basado en SAGI_TMP_Solicitudes y SAGI_$TEMPreporte_audiencias
export interface SolicitudCargaItem {
    Folio: string;
    FechaIngreso: string | null;
    FechaRespuesta: string | null;
    FechaAgendada: string | null;
    IdSujetoPasivo: number | string | null;
    NombreSujetoPasivo: string;
    Cargo: string;
    RutSujetoActivo: string;
    NombreSujetoActivo: string;
    Representado: string | null;
    Materia: string;
    EspecificacionMateria: string | null;
    Estado: string;
}

// Basado en SAGI_$TEMPaudiencias_pendientes_publicacion
export interface AudienciaPendienteItem {
    Folio: string;
    Estado: string;
    Forma?: string | null;
    Materia: string;
    Especificacion_materia_tratada?: string | null;
    Lugar: string;
    Comuna?: string | null;
    Sujeto_pasivo: string;
    Cargo: string;
    Sujeto_activo: string;
    Rut: string;
    Genero: string;
    Fecha_inicio: string;
    Fecha_termino: string;
}

export interface ResultadoCarga {
    mensaje?: string;
    totalRegistros?: number;
    insertados?: number;
    actualizados?: number;
    errores?: string[];
    [key: string]: any;
}