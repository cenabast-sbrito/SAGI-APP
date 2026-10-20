import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
    cargarSolicitudesApi,
    cargarAudienciasPendientesApi,
    cargarViajesLobbyApi,
    cargarViajesGYDPApi
} from "../api/cargas.api";
import {
    parsearExcelSolicitudes,
    parsearExcelPendientes,
    extraerFilasPorCabecera
} from "../utils/excelParser";
import type { ResultadoCarga } from "../models/carga";

type TipoPlanilla =
    | "SOLICITUDES"
    | "PENDIENTES_PUBLICACION"
    | "VIAJES_LOBBY"
    | "VIAJES_GYDP"
    | "DESCONOCIDO";

interface RegistroHistorial {
    id: string;
    nombreArchivo: string;
    tipo: TipoPlanilla;
    totalFilas: number;
    fechaHora: string;
    estado: "EXITO" | "ERROR";
    mensaje: string;
}

const CABECERAS_VIAJES_LOBBY = [
    "Fecha inicio",
    "Fecha término",
    "Destino",
    "Sujeto pasivo"
];

const CABECERAS_VIAJES_GYDP = [
    "Rut",
    "Nombre Funcionario",
    "Fecha Inicio",
    "Fecha Término",
    "Lugar Destino"
];

const CABECERAS_VIAJES_GYDP_VARIANTE = [
    "RUT",
    "NOMBRES",
    "FECHA_INI",
    "FECHA_TER"
];

function obtenerUsuarioLogueado(): string {
    const usuarioStorage = sessionStorage.getItem("usuario");
    if (usuarioStorage?.trim()) return usuarioStorage.trim();

    const token = sessionStorage.getItem("token");
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.usuario || payload.user || payload.username || payload.sub || "SISTEMA";
        } catch {
            return "SISTEMA";
        }
    }
    return "SISTEMA";
}

export default function CargaGeneral() {
    const [usuarioCarga, setUsuarioCarga] = useState(obtenerUsuarioLogueado);
    const [archivoActual, setArchivoActual] = useState<File | null>(null);
    const [tipoDetectado, setTipoDetectado] = useState<TipoPlanilla>("DESCONOCIDO");
    const [datosParseados, setDatosParseados] = useState<any[]>([]);
    const [cargando, setCargando] = useState(false);
    const [mensajeFeedback, setMensajeFeedback] = useState<{ texto: string; error?: boolean } | null>(null);
    const [historialCargas, setHistorialCargas] = useState<RegistroHistorial[]>([]);
    const [mostrarModalVistaPrevia, setMostrarModalVistaPrevia] = useState(false);

    useEffect(() => {
        setUsuarioCarga(obtenerUsuarioLogueado());
    }, []);

    const procesarArchivo = async (file: File) => {
        setArchivoActual(file);
        setCargando(true);
        setMensajeFeedback(null);
        setDatosParseados([]);
        setTipoDetectado("DESCONOCIDO");

        try {
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
            const hoja = workbook.Sheets[workbook.SheetNames[0]];
            const filas: any[][] = XLSX.utils.sheet_to_json(hoja, { header: 1, defval: "" });

            // Busca texto en las primeras 15 filas
            const textoCabeceras = filas
                .slice(0, 15)
                .map((f) => f.join(" ").toLowerCase())
                .join(" ");

            // 1. Detección: Viajes Lobby
            if (
                textoCabeceras.includes("destino") &&
                textoCabeceras.includes("sujeto pasivo") &&
                (textoCabeceras.includes("viaje") || textoCabeceras.includes("id sujeto pasivo") || textoCabeceras.includes("objeto"))
            ) {
                const data = await extraerFilasPorCabecera(file, CABECERAS_VIAJES_LOBBY);
                setTipoDetectado("VIAJES_LOBBY");
                setDatosParseados(data);
                return;
            }

            // 2. Detección: Viajes GYDP
            if (
                (textoCabeceras.includes("lugar destino") && textoCabeceras.includes("nombre funcionario")) ||
                (textoCabeceras.includes("fecha_ini") && textoCabeceras.includes("nombres"))
            ) {
                let data: Record<string, any>[];
                try {
                    data = await extraerFilasPorCabecera(file, CABECERAS_VIAJES_GYDP);
                } catch {
                    data = await extraerFilasPorCabecera(file, CABECERAS_VIAJES_GYDP_VARIANTE);
                }
                setTipoDetectado("VIAJES_GYDP");
                setDatosParseados(data);
                return;
            }

            // 3. Detección: Solicitudes Lobby
            if (
                textoCabeceras.includes("fecha respuesta") ||
                (textoCabeceras.includes("sujeto pasivo id") && textoCabeceras.includes("folio"))
            ) {
                const data = await parsearExcelSolicitudes(file);
                setTipoDetectado("SOLICITUDES");
                setDatosParseados(data);
                return;
            }

            // 4. Detección: Audiencias Pendientes
            if (
                textoCabeceras.includes("especificación materia tratada") ||
                textoCabeceras.includes("especificacion materia tratada") ||
                (textoCabeceras.includes("fecha inicio") && textoCabeceras.includes("lugar") && textoCabeceras.includes("folio"))
            ) {
                const data = await parsearExcelPendientes(file);
                setTipoDetectado("PENDIENTES_PUBLICACION");
                setDatosParseados(data);
                return;
            }

            setTipoDetectado("DESCONOCIDO");
            setMensajeFeedback({
                texto: "No se reconoció el formato de la planilla. Verifique que corresponda a Solicitudes, Audiencias o Viajes (Lobby / GYDP).",
                error: true
            });
        } catch (err: any) {
            setMensajeFeedback({ texto: err.message || "Error al leer el archivo Excel/CSV.", error: true });
            setDatosParseados([]);
            setTipoDetectado("DESCONOCIDO");
        } finally {
            setCargando(false);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        procesarArchivo(file);
    };

    const ejecutarCarga = async () => {
        if (!datosParseados.length || tipoDetectado === "DESCONOCIDO" || !archivoActual) return;

        setCargando(true);
        setMensajeFeedback(null);

        try {
            let res: ResultadoCarga;
            if (tipoDetectado === "SOLICITUDES") {
                res = await cargarSolicitudesApi(usuarioCarga, datosParseados);
            } else if (tipoDetectado === "PENDIENTES_PUBLICACION") {
                res = await cargarAudienciasPendientesApi(usuarioCarga, datosParseados);
            } else if (tipoDetectado === "VIAJES_LOBBY") {
                res = await cargarViajesLobbyApi(usuarioCarga, datosParseados);
            } else if (tipoDetectado === "VIAJES_GYDP") {
                res = await cargarViajesGYDPApi(usuarioCarga, datosParseados);
            } else {
                throw new Error("Tipo de planilla no reconocido.");
            }

            const exitoMsg = res.mensaje || `Carga procesada con éxito (${datosParseados.length} registros).`;
            setMensajeFeedback({ texto: exitoMsg });

            setHistorialCargas((prev) => [
                {
                    id: Math.random().toString(36).substring(2, 9),
                    nombreArchivo: archivoActual.name,
                    tipo: tipoDetectado,
                    totalFilas: datosParseados.length,
                    fechaHora: new Date().toLocaleTimeString(),
                    estado: "EXITO",
                    mensaje: exitoMsg
                },
                ...prev
            ]);
        } catch (err: any) {
            const errorMsg =
                err.response?.data?.message ||
                err.response?.data?.mensaje ||
                err.message ||
                "Error al procesar la carga en el servidor.";
            setMensajeFeedback({ texto: errorMsg, error: true });

            setHistorialCargas((prev) => [
                {
                    id: Math.random().toString(36).substring(2, 9),
                    nombreArchivo: archivoActual.name,
                    tipo: tipoDetectado,
                    totalFilas: datosParseados.length,
                    fechaHora: new Date().toLocaleTimeString(),
                    estado: "ERROR",
                    mensaje: errorMsg
                },
                ...prev
            ]);
        } finally {
            setCargando(false);
        }
    };

    const getNombreTipo = (tipo: TipoPlanilla): string => {
        switch (tipo) {
            case "SOLICITUDES":
                return "Solicitudes de Audiencia";
            case "PENDIENTES_PUBLICACION":
                return "Audiencias Pendientes de Publicación";
            case "VIAJES_LOBBY":
                return "Viajes Ley de Lobby";
            case "VIAJES_GYDP":
                return "Viajes GYDP";
            default:
                return "Desconocido";
        }
    };

    const columnasVistaPrevia = datosParseados.length > 0 ? Object.keys(datosParseados[0]) : [];

    return (
        <div style={{ padding: "24px", maxWidth: "1280px", margin: "0 auto", textAlign: "left" }}>
            <h2 style={{ margin: "0 0 6px 0", color: "#212529" }}>Carga General de Planillas</h2>
            <p style={{ margin: "0 0 20px 0", color: "#6c757d", fontSize: "14px" }}>
                Sube cualquier planilla (Solicitudes, Audiencias Pendientes, Viajes Lobby o Viajes GYDP); el sistema detectará el formato automáticamente por sus cabeceras.
            </p>

            {/* Panel de Carga */}
            <div
                style={{
                    background: "#ffffff",
                    padding: "20px 24px",
                    borderRadius: "8px",
                    border: "1px solid #EEEEEE",
                    marginBottom: "20px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                }}
            >
                <div style={{ display: "flex", gap: "16px", alignItems: "flex-end", flexWrap: "wrap" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "#495057", marginBottom: "4px" }}>
                            SELECCIONAR ARCHIVO (.xlsx, .xls, .csv)
                        </label>
                        <input
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            style={{ border: "1px solid gray", padding: "6px 10px", borderRadius: "2px" }}
                            onChange={handleFileInput}
                        />
                    </div>

                    <button
                        onClick={ejecutarCarga}
                        disabled={cargando || !datosParseados.length || tipoDetectado === "DESCONOCIDO"}
                        style={{
                            height: "38px",
                            padding: "0 24px",
                            backgroundColor:
                                cargando || !datosParseados.length || tipoDetectado === "DESCONOCIDO"
                                    ? "#6c757d"
                                    : "#0d6efd",
                            color: "#fff",
                            border: "none",
                            borderRadius: "2px",
                            cursor:
                                cargando || !datosParseados.length || tipoDetectado === "DESCONOCIDO"
                                    ? "not-allowed"
                                    : "pointer",
                            fontWeight: 600
                        }}
                    >
                        {cargando ? "Procesando Carga..." : `Procesar e Insertar (${datosParseados.length})`}
                    </button>
                </div>

                {archivoActual && tipoDetectado !== "DESCONOCIDO" && (
                    <div
                        style={{
                            marginTop: "14px",
                            fontSize: "13px",
                            color: "#198754",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            flexWrap: "wrap"
                        }}
                    >
                        <span>
                            ✓ Formato detectado: <strong>{getNombreTipo(tipoDetectado)}</strong> ({datosParseados.length} registros listos)
                        </span>
                        <button
                            type="button"
                            onClick={() => setMostrarModalVistaPrevia(true)}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#0d6efd",
                                textDecoration: "underline",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: 600,
                                padding: 0
                            }}
                        >
                            Ver datos de la planilla
                        </button>
                    </div>
                )}
            </div>

            {/* Mensajes de feedback */}
            {mensajeFeedback && (
                <div
                    style={{
                        padding: "12px 16px",
                        borderRadius: "4px",
                        marginBottom: "20px",
                        backgroundColor: mensajeFeedback.error ? "#f8d7da" : "#d1e7dd",
                        color: mensajeFeedback.error ? "#842029" : "#0f5132",
                        border: mensajeFeedback.error ? "1px solid #f5c2c7" : "1px solid #badbcc"
                    }}
                >
                    {mensajeFeedback.texto}
                </div>
            )}

            {/* Historial de planillas procesadas */}
            {historialCargas.length > 0 && (
                <div style={{ marginTop: "24px" }}>
                    <h3 style={{ fontSize: "16px", marginBottom: "10px" }}>Planillas Procesadas en esta Sesión</h3>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", background: "#ffffff", border: "1px solid #e9ecef" }}>
                        <thead>
                            <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                                <th style={{ padding: "8px 12px", textAlign: "left" }}>Hora</th>
                                <th style={{ padding: "8px 12px", textAlign: "left" }}>Archivo</th>
                                <th style={{ padding: "8px 12px", textAlign: "left" }}>Tipo Detectado</th>
                                <th style={{ padding: "8px 12px", textAlign: "center" }}>Registros</th>
                                <th style={{ padding: "8px 12px", textAlign: "center" }}>Resultado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historialCargas.map((item) => (
                                <tr key={item.id} style={{ borderBottom: "1px solid #f1f3f5" }}>
                                    <td style={{ padding: "8px 12px" }}>{item.fechaHora}</td>
                                    <td style={{ padding: "8px 12px" }}>{item.nombreArchivo}</td>
                                    <td style={{ padding: "8px 12px" }}>{getNombreTipo(item.tipo)}</td>
                                    <td style={{ padding: "8px 12px", textAlign: "center" }}>{item.totalFilas}</td>
                                    <td style={{ padding: "8px 12px", textAlign: "center" }}>
                                        <span
                                            style={{
                                                padding: "3px 8px",
                                                borderRadius: "4px",
                                                color: "#ffffff",
                                                fontSize: "11px",
                                                fontWeight: 600,
                                                backgroundColor: item.estado === "EXITO" ? "#198754" : "#dc3545"
                                            }}
                                        >
                                            {item.estado}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de Vista Previa */}
            {mostrarModalVistaPrevia && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1050
                    }}
                    onClick={() => setMostrarModalVistaPrevia(false)}
                >
                    <div
                        style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "8px",
                            width: "92%",
                            maxWidth: "1180px",
                            maxHeight: "85vh",
                            display: "flex",
                            flexDirection: "column",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                            overflow: "hidden"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            style={{
                                padding: "16px 20px",
                                borderBottom: "1px solid #dee2e6",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}
                        >
                            <div>
                                <h3 style={{ margin: 0, fontSize: "16px", color: "#212529" }}>
                                    Vista Previa: {archivoActual?.name}
                                </h3>
                                <span style={{ fontSize: "12px", color: "#6c757d" }}>
                                    Tipo: {getNombreTipo(tipoDetectado)} — {datosParseados.length} filas
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setMostrarModalVistaPrevia(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: "20px",
                                    cursor: "pointer",
                                    color: "#6c757d"
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ padding: "16px 20px", overflowY: "auto", flex: 1 }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                                <thead>
                                    <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                                        {columnasVistaPrevia.map((col) => (
                                            <th key={col} style={{ padding: "8px 10px", textAlign: "left", whiteSpace: "nowrap" }}>
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {datosParseados.slice(0, 100).map((row, idx) => (
                                        <tr key={idx} style={{ borderBottom: "1px solid #f1f3f5" }}>
                                            {columnasVistaPrevia.map((col) => (
                                                <td
                                                    key={`${idx}-${col}`}
                                                    style={{
                                                        padding: "8px 10px",
                                                        maxWidth: "240px",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis"
                                                    }}
                                                    title={String(row[col] ?? "")}
                                                >
                                                    {String(row[col] ?? "-")}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {datosParseados.length > 100 && (
                                <p style={{ fontSize: "12px", color: "#6c757d", marginTop: "10px", textAlign: "center" }}>
                                    Mostrando las primeras 100 filas de {datosParseados.length}...
                                </p>
                            )}
                        </div>

                        <div
                            style={{
                                padding: "12px 20px",
                                borderTop: "1px solid #dee2e6",
                                display: "flex",
                                justifyContent: "flex-end"
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => setMostrarModalVistaPrevia(false)}
                                style={{
                                    padding: "6px 16px",
                                    backgroundColor: "#6c757d",
                                    color: "#ffffff",
                                    border: "none",
                                    borderRadius: "2px",
                                    cursor: "pointer",
                                    fontSize: "13px"
                                }}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}