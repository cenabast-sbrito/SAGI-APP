import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { cargarSolicitudesApi, cargarAudienciasPendientesApi } from "../api/cargas.api";
import { parsearExcelSolicitudes, parsearExcelPendientes } from "../utils/excelParser";
import type { ResultadoCarga } from "../models/carga";

type TipoPlanilla = "SOLICITUDES" | "PENDIENTES_PUBLICACION" | "DESCONOCIDO";

interface RegistroHistorial {
    id: string;
    nombreArchivo: string;
    tipo: TipoPlanilla;
    totalFilas: number;
    fechaHora: string;
    estado: "EXITO" | "ERROR";
    mensaje: string;
}

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

    // Detecta automáticamente las cabeceras del archivo
    const procesarArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setArchivoActual(file);
        setCargando(true);
        setMensajeFeedback(null);

        try {
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
            const hoja = workbook.Sheets[workbook.SheetNames[0]];
            const filas: any[][] = XLSX.utils.sheet_to_json(hoja, { header: 1, defval: "" });

            const textoCabeceras = filas.slice(0, 10).map(f => f.join(" ").toLowerCase()).join(" ");

            if (textoCabeceras.includes("fecha respuesta") || textoCabeceras.includes("sujeto pasivo id")) {
                const data = await parsearExcelSolicitudes(file);
                setTipoDetectado("SOLICITUDES");
                setDatosParseados(data);
            } else if (textoCabeceras.includes("fecha inicio") || textoCabeceras.includes("especificación materia tratada") || textoCabeceras.includes("lugar")) {
                const data = await parsearExcelPendientes(file);
                setTipoDetectado("PENDIENTES_PUBLICACION");
                setDatosParseados(data);
            } else {
                setTipoDetectado("DESCONOCIDO");
                setDatosParseados([]);
                setMensajeFeedback({ texto: "No se reconoció el formato de la planilla. Verifique columnas requeridas.", error: true });
            }
        } catch (err: any) {
            setMensajeFeedback({ texto: err.message || "Error al leer archivo", error: true });
            setDatosParseados([]);
        } finally {
            setCargando(false);
        }
    };

    const ejecutarCarga = async () => {
        if (!datosParseados.length || tipoDetectado === "DESCONOCIDO" || !archivoActual) return;

        setCargando(true);
        setMensajeFeedback(null);

        try {
            let res: ResultadoCarga;
            if (tipoDetectado === "SOLICITUDES") {
                res = await cargarSolicitudesApi(usuarioCarga, datosParseados);
            } else {
                res = await cargarAudienciasPendientesApi(usuarioCarga, datosParseados);
            }

            const exitoMsg = res.mensaje || `Carga procesada con éxito (${datosParseados.length} registros).`;
            setMensajeFeedback({ texto: exitoMsg });

            // Agregar al historial de planillas cargadas
            setHistorialCargas(prev => [
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
            const errorMsg = err.response?.data?.message || err.message || "Error al procesar la carga en el servidor.";
            setMensajeFeedback({ texto: errorMsg, error: true });

            setHistorialCargas(prev => [
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

    return (
        <div style={{ padding: "24px", maxWidth: "1280px", margin: "0 auto" }}>
            <h2>Carga General de Planillas (Lobby)</h2>
            <p style={{ color: "#6c757d" }}>
                Sube cualquier planilla (Solicitudes o Audiencias Pendientes); el sistema detectará el tipo automáticamente.
            </p>

            {/* Formulario de carga */}
            <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #EEEEEE;", marginBottom: "20px" }}>
                <div style={{ display: "flex", gap: "16px", alignItems: "flex-end", flexWrap: "wrap" }}>
                    <div hidden>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: "bold" }}>USUARIO</label>
                        <input
                            type="text"
                            value={usuarioCarga}
                            onChange={(e) => setUsuarioCarga(e.target.value)}
                            style={{ height: "36px", padding: "6px 10px" }}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: "bold" }}>PLANILLA EXCEL / CSV</label>
                        <input type="file" accept=".xlsx, .xls, .csv" style={{ border: '1px solid', borderColor: 'gray', padding: '7px' }} onChange={procesarArchivo} />
                    </div>

                    <button
                        onClick={ejecutarCarga}
                        disabled={cargando || !datosParseados.length}
                        style={{
                            height: "38px",
                            padding: "0 24px",
                            backgroundColor: cargando || !datosParseados.length ? "#6c757d" : "#0d6efd",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: cargando || !datosParseados.length ? "not-allowed" : "pointer"
                        }}
                    >
                        {cargando ? "Procesando Carga..." : `Procesar e Insertar (${datosParseados.length})`}
                    </button>
                </div>

                {archivoActual && tipoDetectado !== "DESCONOCIDO" && (
                    <div style={{
                        marginTop: "12px",
                        fontSize: "14px",
                        color: "#198754",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        flexWrap: "wrap"
                    }}>
                        <span>
                            ✓ Tipo detectado: <strong>{tipoDetectado === "SOLICITUDES" ? "Solicitudes de Audiencia" : "Audiencias Pendientes de Publicación"}</strong> ({datosParseados.length} registros leídos)
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
                <div style={{
                    padding: "12px",
                    borderRadius: "6px",
                    marginBottom: "20px",
                    backgroundColor: mensajeFeedback.error ? "#f8d7da" : "#d1e7dd",
                    color: mensajeFeedback.error ? "#842029" : "#0f5132"
                }}>
                    {mensajeFeedback.texto}
                </div>
            )}

            {/* Historial de planillas cargadas en la sesión */}
            {historialCargas.length > 0 && (
                <div style={{ marginTop: "24px" }}>
                    <h3>Planillas Cargadas en esta Sesión</h3>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", background: "#fff" }}>
                        <thead>
                            <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                                <th style={{ padding: "8px", textAlign: "left" }}>Hora</th>
                                <th style={{ padding: "8px", textAlign: "left" }}>Archivo</th>
                                <th style={{ padding: "8px", textAlign: "left" }}>Tipo Detectado</th>
                                <th style={{ padding: "8px", textAlign: "center" }}>Registros</th>
                                <th style={{ padding: "8px", textAlign: "center" }}>Resultado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historialCargas.map((item) => (
                                <tr key={item.id} style={{ borderBottom: "1px solid #f1f3f5" }}>
                                    <td style={{ padding: "8px" }}>{item.fechaHora}</td>
                                    <td style={{ padding: "8px" }}>{item.nombreArchivo}</td>
                                    <td style={{ padding: "8px" }}>
                                        {item.tipo === "SOLICITUDES" ? "Solicitudes" : "Audiencias Pendientes"}
                                    </td>
                                    <td style={{ padding: "8px", textAlign: "center" }}>{item.totalFilas}</td>
                                    <td style={{ padding: "8px", textAlign: "center" }}>
                                        <span style={{
                                            padding: "3px 8px",
                                            borderRadius: "4px",
                                            color: "#fff",
                                            backgroundColor: item.estado === "EXITO" ? "#198754" : "#dc3545"
                                        }}>
                                            {item.estado}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de Vista Previa de la Planilla */}
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
                            backgroundColor: "#fff",
                            borderRadius: "10px",
                            width: "90%",
                            maxWidth: "1150px",
                            maxHeight: "85vh",
                            display: "flex",
                            flexDirection: "column",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                            overflow: "hidden"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Cabecera del modal */}
                        <div style={{
                            padding: "16px 20px",
                            borderBottom: "1px solid #dee2e6",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: "18px", color: "#212529" }}>
                                    Vista Previa: {archivoActual?.name}
                                </h3>
                                <span style={{ fontSize: "12px", color: "#6c757d" }}>
                                    {tipoDetectado === "SOLICITUDES" ? "Planilla de Solicitudes" : "Planilla de Audiencias Pendientes"} — Mostrando {datosParseados.length} registros
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setMostrarModalVistaPrevia(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: "20px",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    color: "#6c757d"
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Cuerpo del modal con tabla scrolleable */}
                        <div style={{ padding: "16px 20px", overflowY: "auto", flex: 1 }}>
                            {tipoDetectado === "SOLICITUDES" ? (
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                                    <thead>
                                        <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                                            <th style={{ padding: "8px", textAlign: "left" }}>Folio</th>
                                            <th style={{ padding: "8px", textAlign: "left" }}>Ingreso</th>
                                            <th style={{ padding: "8px", textAlign: "left" }}>Respuesta</th>
                                            <th style={{ padding: "8px", textAlign: "left" }}>Sujeto Pasivo</th>
                                            <th style={{ padding: "8px", textAlign: "left" }}>Cargo</th>
                                            <th style={{ padding: "8px", textAlign: "left" }}>Sujeto Activo</th>
                                            <th style={{ padding: "8px", textAlign: "left" }}>RUT</th>
                                            <th style={{ padding: "8px", textAlign: "left" }}>Materia</th>
                                            <th style={{ padding: "8px", textAlign: "center" }}>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {datosParseados.map((item, idx) => (
                                            <tr key={`${item.Folio}-${idx}`} style={{ borderBottom: "1px solid #f1f3f5" }}>
                                                <td style={{ padding: "8px", fontWeight: 600 }}>{item.Folio}</td>
                                                <td style={{ padding: "8px" }}>{item.FechaIngreso || "-"}</td>
                                                <td style={{ padding: "8px" }}>{item.FechaRespuesta || "-"}</td>
                                                <td style={{ padding: "8px" }}>{item.NombreSujetoPasivo}</td>
                                                <td style={{ padding: "8px" }}>{item.Cargo}</td>
                                                <td style={{ padding: "8px" }}>{item.NombreSujetoActivo}</td>
                                                <td style={{ padding: "8px" }}>{item.RutSujetoActivo}</td>
                                                <td
                                                    style={{
                                                        padding: "8px",
                                                        maxWidth: "200px",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        cursor: "help"
                                                    }}
                                                    title={item.Materia || ""}
                                                >
                                                    {item.Materia || "-"}
                                                </td>
                                                <td style={{ padding: "8px", textAlign: "center", textTransform: "capitalize" }}>
                                                    {item.Estado}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                                    <thead>
                                        <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                                            <th style={{ padding: "8px", textAlign: "left" }}>Folio</th>
                                            <th style={{ padding: "8px", textAlign: "left" }}>Sujeto Pasivo</th>
                                            <th style={{ padding: "8px", textAlign: "left" }}>Cargo</th>
                                            <th style={{ padding: "8px", textAlign: "left" }}>Sujeto Activo</th>
                                            <th style={{ padding: "8px", textAlign: "left" }}>RUT</th>
                                            <th style={{ padding: "8px", textAlign: "left" }}>Materia</th>
                                            <th style={{ padding: "8px", textAlign: "left" }}>Lugar</th>
                                            <th style={{ padding: "8px", textAlign: "center" }}>Inicio</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {datosParseados.map((item, idx) => (
                                            <tr key={`${item.Folio}-${idx}`} style={{ borderBottom: "1px solid #f1f3f5" }}>
                                                <td style={{ padding: "8px", fontWeight: 600 }}>{item.Folio}</td>
                                                <td style={{ padding: "8px" }}>{item.Sujeto_pasivo || item.SujetoPasivo}</td>
                                                <td style={{ padding: "8px" }}>{item.Cargo}</td>
                                                <td style={{ padding: "8px" }}>{item.Sujeto_activo || item.SujetoActivo}</td>
                                                <td style={{ padding: "8px" }}>{item.Rut || item.RutSujetoActivo}</td>
                                                <td
                                                    style={{
                                                        padding: "8px",
                                                        maxWidth: "220px",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        cursor: "help"
                                                    }}
                                                    title={item.Materia || ""}
                                                >
                                                    {item.Materia || "-"}
                                                </td>
                                                <td style={{ padding: "8px" }}>{item.Lugar}</td>
                                                <td style={{ padding: "8px", textAlign: "center" }}>
                                                    {item.Fecha_inicio ? new Date(item.Fecha_inicio).toLocaleDateString() : "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Pie del modal */}
                        <div style={{
                            padding: "12px 20px",
                            borderTop: "1px solid #dee2e6",
                            display: "flex",
                            justifyContent: "flex-end"
                        }}>
                            <button
                                type="button"
                                onClick={() => setMostrarModalVistaPrevia(false)}
                                style={{
                                    padding: "6px 16px",
                                    backgroundColor: "#6c757d",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "6px",
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