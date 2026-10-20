import * as XLSX from "xlsx";
import type { SolicitudCargaItem, AudienciaPendienteItem } from "../models/carga";

// Convierte fechas variadas (DD-MM-YYYY, números seriales de Excel, etc.) a ISO YYYY-MM-DD
function formatearFecha(val: any): string | null {
    if (val === null || val === undefined || val === "") return null;

    if (val instanceof Date) {
        return val.toISOString().split("T")[0];
    }

    if (typeof val === "number") {
        const date = new Date(Math.round((val - 25569) * 86400 * 1000));
        return date.toISOString().split("T")[0];
    }

    const str = String(val).trim();
    if (!str) return null;

    const partes = str.split(/[-/]/);
    if (partes.length === 3 && partes[0].length <= 2 && partes[2].length === 4) {
        const dia = partes[0].padStart(2, "0");
        const mes = partes[1].padStart(2, "0");
        const anio = partes[2];
        return `${anio}-${mes}-${dia}`;
    }

    if (partes.length === 3 && partes[0].length === 4) {
        return str.substring(0, 10);
    }

    return str;
}

// Convierte fechas con hora a ISO string
function formatearFechaHora(val: any): string {
    if (!val) return new Date().toISOString();
    if (val instanceof Date) return val.toISOString();
    if (typeof val === "number") {
        const date = new Date(Math.round((val - 25569) * 86400 * 1000));
        return date.toISOString();
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

/**
 * Normaliza una cadena eliminando acentos, caracteres especiales y espacios múltiples
 */
function normalizarTexto(val: string): string {
    return val
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[_\s]+/g, " ")
        .trim();
}

/**
 * Lee un archivo (.xlsx, .xls, .csv, .txt) y retorna filas como matrices de strings
 */
async function leerFilasDeArchivo(archivo: File): Promise<string[][]> {
    const buffer = await archivo.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
    const primeraHojaNombre = workbook.SheetNames[0];
    const hoja = workbook.Sheets[primeraHojaNombre];

    const datos: any[][] = XLSX.utils.sheet_to_json(hoja, { header: 1, defval: "" });
    return datos.map(fila =>
        fila.map(celda => (celda !== null && celda !== undefined ? String(celda).trim() : ""))
    );
}

/**
 * Extrae filas dinámicamente comprobando que la fila de cabecera cumpla con columnas mínimas requeridas.
 */
export async function extraerFilasPorCabecera(
    archivo: File,
    columnasRequeridas: string[]
): Promise<Record<string, any>[]> {
    const filas = await leerFilasDeArchivo(archivo);
    const requeridasNorm = columnasRequeridas.map(normalizarTexto);

    // Encontrar el índice de la fila cabecera que contenga todas las columnas requeridas
    const indiceCabecera = filas.findIndex((fila) => {
        const filaNorm = fila.map(normalizarTexto);
        return requeridasNorm.every((req) => filaNorm.some((col) => col.includes(req)));
    });

    if (indiceCabecera === -1) {
        throw new Error(
            `El archivo no contiene las cabeceras requeridas: ${columnasRequeridas.join(", ")}`
        );
    }

    const cabecerasOriginales = filas[indiceCabecera];
    const registros: Record<string, any>[] = [];

    for (let i = indiceCabecera + 1; i < filas.length; i++) {
        const fila = filas[i];
        if (!fila || fila.every((c) => !c || c.trim() === "")) continue;

        const obj: Record<string, any> = {};
        cabecerasOriginales.forEach((header, colIdx) => {
            const clave = header.trim();
            if (clave) {
                obj[clave] = fila[colIdx] !== undefined ? fila[colIdx].trim() : "";
            }
        });

        registros.push(obj);
    }

    return registros;
}

/**
 * Procesa la planilla de Solicitudes de Audiencia (SAGI_TMP_Solicitudes)
 */
export async function parsearExcelSolicitudes(archivo: File): Promise<SolicitudCargaItem[]> {
    const filas = await leerFilasDeArchivo(archivo);

    const indiceCabecera = filas.findIndex(fila => {
        const filaStr = fila.map(c => c.toLowerCase()).join(" ");
        return filaStr.includes("folio") && filaStr.includes("sujeto pasivo");
    });

    if (indiceCabecera === -1) {
        throw new Error("No se encontró la fila de cabecera con 'Folio' y 'Sujeto Pasivo'.");
    }

    const cabecera = filas[indiceCabecera].map(c => c.toLowerCase());
    const getIdx = (nombre: string) => cabecera.findIndex(c => c.includes(nombre.toLowerCase()));

    const colFolio = getIdx("folio");
    const colFechaIngreso = getIdx("fecha ingreso");
    const colFechaRespuesta = getIdx("fecha respuesta");
    const colFechaAgendada = getIdx("fecha agendada");
    const colSujetoPasivo = getIdx("sujeto pasivo");
    const colCargo = getIdx("cargo");
    const colSujetoPasivoId = getIdx("sujeto pasivo id");
    const colSujetoActivo = getIdx("sujeto activo");
    const colRut = getIdx("rut");
    const colRepresentado = getIdx("representado");
    const colMateria = getIdx("materia");
    const colEspecMateria = getIdx("especificación materia") !== -1 ? getIdx("especificación materia") : getIdx("especificacion materia");
    const colEstado = getIdx("estado");

    const registros: SolicitudCargaItem[] = [];

    for (let i = indiceCabecera + 1; i < filas.length; i++) {
        const f = filas[i];
        const folio = colFolio !== -1 ? f[colFolio] : "";
        if (!folio) continue;

        const idRaw = colSujetoPasivoId !== -1 ? f[colSujetoPasivoId] : null;
        const idSujetoPasivo = idRaw && !isNaN(Number(idRaw)) ? Number(idRaw) : null;

        registros.push({
            Folio: folio,
            FechaIngreso: formatearFecha(colFechaIngreso !== -1 ? f[colFechaIngreso] : null),
            FechaRespuesta: formatearFecha(colFechaRespuesta !== -1 ? f[colFechaRespuesta] : null),
            FechaAgendada: formatearFecha(colFechaAgendada !== -1 ? f[colFechaAgendada] : null),
            IdSujetoPasivo: idSujetoPasivo,
            NombreSujetoPasivo: colSujetoPasivo !== -1 ? f[colSujetoPasivo] : "",
            Cargo: colCargo !== -1 ? f[colCargo] : "",
            RutSujetoActivo: colRut !== -1 ? f[colRut] : "",
            NombreSujetoActivo: colSujetoActivo !== -1 ? f[colSujetoActivo] : "",
            Representado: colRepresentado !== -1 ? f[colRepresentado] || null : null,
            Materia: colMateria !== -1 ? f[colMateria] : "",
            EspecificacionMateria: colEspecMateria !== -1 ? f[colEspecMateria] || null : null,
            Estado: colEstado !== -1 && f[colEstado] ? f[colEstado] : "ingresada"
        });
    }

    return registros;
}

/**
 * Procesa la planilla de Audiencias Pendientes de Publicación (SAGI_$TEMPaudiencias_pendientes_publicacion)
 */
export async function parsearExcelPendientes(archivo: File): Promise<AudienciaPendienteItem[]> {
    const filas = await leerFilasDeArchivo(archivo);

    const indiceCabecera = filas.findIndex(fila => {
        const filaStr = fila.map(c => c.toLowerCase()).join(" ");
        return filaStr.includes("folio") && (filaStr.includes("sujeto") || filaStr.includes("materia"));
    });

    if (indiceCabecera === -1) {
        throw new Error("No se encontró la cabecera con las columnas requeridas (Folio, Sujeto Pasivo, etc.).");
    }

    const cabecera = filas[indiceCabecera].map(c => c.toLowerCase());
    const getIdx = (nombre: string) => cabecera.findIndex(c => c.includes(nombre.toLowerCase()));

    const colFolio = getIdx("folio");
    const colEstado = getIdx("estado");
    const colForma = getIdx("forma");
    const colMateria = getIdx("materia");
    const colEspecMateria = getIdx("especificación") !== -1 ? getIdx("especificación") : getIdx("especificacion");
    const colLugar = getIdx("lugar");
    const colComuna = getIdx("comuna");
    const colSujetoPasivo = getIdx("sujeto_pasivo") !== -1 ? getIdx("sujeto_pasivo") : getIdx("sujeto pasivo");
    const colCargo = getIdx("cargo");
    const colSujetoActivo = getIdx("sujeto_activo") !== -1 ? getIdx("sujeto_activo") : getIdx("sujeto activo");
    const colRut = getIdx("rut");
    const colGenero = getIdx("género") !== -1 ? getIdx("género") : (getIdx("genero") !== -1 ? getIdx("genero") : -1);
    const colFechaInicio = getIdx("fecha_inicio") !== -1 ? getIdx("fecha_inicio") : getIdx("fecha inicio");
    const colFechaTermino = getIdx("fecha_término") !== -1 ? getIdx("fecha_término") : (getIdx("fecha termino") !== -1 ? getIdx("fecha termino") : -1);

    const registros: AudienciaPendienteItem[] = [];

    for (let i = indiceCabecera + 1; i < filas.length; i++) {
        const f = filas[i];
        const folio = colFolio !== -1 ? f[colFolio] : "";
        if (!folio) continue;

        registros.push({
            Folio: folio,
            Estado: colEstado !== -1 && f[colEstado] ? f[colEstado] : "Realizada",
            Forma: colForma !== -1 ? f[colForma] || "1" : "1",
            Materia: colMateria !== -1 ? f[colMateria] : "",
            Especificacion_materia_tratada: colEspecMateria !== -1 ? f[colEspecMateria] || null : null,
            Lugar: colLugar !== -1 && f[colLugar] ? f[colLugar] : "No especificado",
            Comuna: colComuna !== -1 ? f[colComuna] || null : null,
            Sujeto_pasivo: colSujetoPasivo !== -1 ? f[colSujetoPasivo] : "",
            Cargo: colCargo !== -1 ? f[colCargo] : "",
            Sujeto_activo: colSujetoActivo !== -1 ? f[colSujetoActivo] : "",
            Rut: colRut !== -1 ? f[colRut] : "",
            Genero: colGenero !== -1 ? f[colGenero] : "No especificado",
            Fecha_inicio: formatearFechaHora(colFechaInicio !== -1 ? f[colFechaInicio] : null),
            Fecha_termino: formatearFechaHora(colFechaTermino !== -1 ? f[colFechaTermino] : null)
        });
    }

    return registros;
}