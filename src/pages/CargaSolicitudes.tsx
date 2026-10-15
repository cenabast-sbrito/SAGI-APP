import { useState } from "react";
import { cargarSolicitudesApi } from "../api/cargas.api";
import { parsearExcelSolicitudes } from "../utils/excelParser";
import type { SolicitudCargaItem, ResultadoCarga } from "../models/carga";

const DATOS_SIMULADOS_SOLICITUDES: SolicitudCargaItem[] = [
    {
        Folio: "AO003AW1490249",
        FechaIngreso: "2024-01-02",
        FechaRespuesta: "2024-01-04",
        FechaAgendada: "2024-01-12",
        IdSujetoPasivo: 488643,
        NombreSujetoPasivo: "Néstor Cue Soto",
        Cargo: "Jefe (S2) Departamento de Administración",
        RutSujetoActivo: "16936251-3",
        NombreSujetoActivo: "Thomas Urbina",
        Representado: "Laboratorios Saval",
        Materia: "CUENTAS POR COBRAR, ORDEN DE LO ADEUDADO",
        EspecificacionMateria: "Diseño, implementación y evaluación de políticas",
        Estado: "aceptada"
    },
    {
        Folio: "AO003AW1490252",
        FechaIngreso: "2024-01-02",
        FechaRespuesta: "2024-01-02",
        FechaAgendada: null,
        IdSujetoPasivo: 488643,
        NombreSujetoPasivo: "Néstor Cue Soto",
        Cargo: "Jefe (S2) Departamento de Administración",
        RutSujetoActivo: "16936251-3",
        NombreSujetoActivo: "Thomas Urbina",
        Representado: "Laboratorios Saval",
        Materia: "CUENTAS POR COBRAR, COMO PODER MEJORAR LA GESTION",
        EspecificacionMateria: "Diseño, implementación y evaluación de políticas",
        Estado: "rechazada"
    },
    {
        Folio: "AO003AW1490954",
        FechaIngreso: "2024-01-03",
        FechaRespuesta: "2024-01-03",
        FechaAgendada: null,
        IdSujetoPasivo: 367736,
        NombreSujetoPasivo: "Victor Barberis Castex",
        Cargo: "Jefe Departamento Administración",
        RutSujetoActivo: "24994723-7",
        NombreSujetoActivo: "Esteban Duffour",
        Representado: "junior garcia",
        Materia: "no pago de documentos vencidos con mas de 60 dias",
        EspecificacionMateria: "Elaboración o dictación de actos administrativos",
        Estado: "rechazada"
    }
];

export default function CargaSolicitudes() {
    const [usuarioCarga, setUsuarioCarga] = useState("LOC_SBRITO");
    const [datos, setDatos] = useState<SolicitudCargaItem[]>([]);
    const [cargando, setCargando] = useState(false);
    const [resultado, setResultado] = useState<ResultadoCarga | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [nombreArchivo, setNombreArchivo] = useState<string | null>(null);

    const handleArchivoExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setNombreArchivo(file.name);
        setCargando(true);
        setError(null);
        setResultado(null);

        try {
            if (file.name.endsWith(".json")) {
                const texto = await file.text();
                const parsed = JSON.parse(texto);
                const items = Array.isArray(parsed) ? parsed : parsed.detalles;
                setDatos(Array.isArray(items) ? items : []);
            } else {
                const registros = await parsearExcelSolicitudes(file);
                if (registros.length === 0) {
                    setError("La planilla no contiene registros válidos.");
                } else {
                    setDatos(registros);
                }
            }
        } catch (err: any) {
            setError(err.message || "Error al procesar el archivo Excel/CSV.");
            setDatos([]);
        } finally {
            setCargando(false);
        }
    };

    const handleCargarSimulacion = () => {
        setNombreArchivo("simulacion_cenabast.xlsx");
        setDatos(DATOS_SIMULADOS_SOLICITUDES);
        setResultado(null);
        setError(null);
    };

    const handleEjecutarCarga = async () => {
        if (datos.length === 0) {
            setError("No hay registros para procesar.");
            return;
        }

        setCargando(true);
        setError(null);
        setResultado(null);

        try {
            const res = await cargarSolicitudesApi(usuarioCarga, datos);
            setResultado(res);
        } catch (err: any) {
            let mensajeDetalle =
                err.response?.data?.error ||
                err.response?.data?.message ||
                err.response?.data?.mensaje ||
                err.message ||
                "Error en el servidor.";

            if (err.response?.status === 401) {
                mensajeDetalle = "Sesión expirada o no autenticada. Por favor, inicie sesión nuevamente.";
            } else if (err.response?.status === 403) {
                mensajeDetalle = "Permisos insuficientes: Su usuario no tiene rol para ejecutar cargas masivas.";
            }

            console.error("❌ Error en POST /cargas/solicitudes:", err.response?.data || err);
            setError(typeof mensajeDetalle === "string" ? mensajeDetalle : JSON.stringify(mensajeDetalle));
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={{ padding: "24px", maxWidth: "1280px", margin: "0 auto", textAlign: "left" }}>
            <h2 style={{ margin: "0 0 6px 0", color: "#212529" }}>Carga de Solicitudes (Lobby)</h2>
            <p style={{ margin: "0 0 20px 0", color: "#6c757d", fontSize: "14px" }}>
                Importación y homologación de planilla Excel / CSV de solicitudes para tablas SAGI_TMP_Solicitudes
            </p>

            <div
                style={{
                    backgroundColor: "#fff",
                    borderRadius: "10px",
                    border: "1px solid #e9ecef",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    padding: "20px 24px",
                    marginBottom: "24px"
                }}
            >
                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "flex-end" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#495057", marginBottom: "4px" }}>
                            USUARIO DE CARGA
                        </label>
                        <input
                            type="text"
                            value={usuarioCarga}
                            onChange={(e) => setUsuarioCarga(e.target.value)}
                            style={{
                                height: "36px",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                border: "1px solid #ced4da",
                                fontSize: "14px",
                                width: "180px"
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#495057", marginBottom: "4px" }}>
                            PLANILLA EXCEL / CSV (.xlsx, .xls, .csv)
                        </label>
                        <input
                            type="file"
                            accept=".xlsx, .xls, .csv, .txt, .json"
                            onChange={handleArchivoExcel}
                            style={{ fontSize: "13px" }}
                        />
                    </div>

                    <button
                        onClick={handleCargarSimulacion}
                        type="button"
                        style={{
                            height: "36px",
                            padding: "0 16px",
                            backgroundColor: "#f8f9fa",
                            color: "#495057",
                            border: "1px solid #ced4da",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: 500
                        }}
                    >
                        Cargar Datos de Prueba
                    </button>

                    <button
                        onClick={handleEjecutarCarga}
                        disabled={cargando || datos.length === 0}
                        type="button"
                        style={{
                            height: "36px",
                            padding: "0 20px",
                            backgroundColor: cargando || datos.length === 0 ? "#6c757d" : "#0d6efd",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: cargando || datos.length === 0 ? "not-allowed" : "pointer",
                            fontWeight: 600
                        }}
                    >
                        {cargando ? "Ejecutando Carga..." : `Procesar e Insertar (${datos.length})`}
                    </button>
                </div>

                {nombreArchivo && (
                    <div style={{ marginTop: "12px", fontSize: "13px", color: "#495057" }}>
                        Archivo: <strong>{nombreArchivo}</strong> ({datos.length} filas leídas)
                    </div>
                )}
            </div>

            {error && (
                <div style={{
                    padding: "12px 16px",
                    backgroundColor: "#ffebee",
                    color: "#c62828",
                    borderRadius: "6px",
                    border: "1px solid #ffcdd2",
                    marginBottom: "20px"
                }}>
                    <strong>Error del servidor:</strong> {error}
                </div>
            )}

            {resultado && (
                <div style={{
                    padding: "16px 20px",
                    backgroundColor: "#e8f5e9",
                    color: "#2e7d32",
                    borderRadius: "8px",
                    border: "1px solid #c8e6c9",
                    marginBottom: "24px"
                }}>
                    <h4 style={{ margin: "0 0 8px 0" }}>Resultado de la Carga</h4>
                    <p style={{ margin: "0 0 4px 0", fontSize: "14px" }}>
                        {resultado.mensaje || "Carga de solicitudes procesada exitosamente."}
                    </p>
                    {resultado.totalRegistros !== undefined && (
                        <p style={{ margin: "0", fontSize: "13px" }}>
                            Registros procesados: <strong>{resultado.totalRegistros}</strong>
                        </p>
                    )}
                </div>
            )}

            <h3 style={{ margin: "0 0 12px 0", fontSize: "18px", color: "#212529" }}>
                Registros Interpretados de la Planilla ({datos.length})
            </h3>

            {datos.length === 0 ? (
                <p style={{ color: "#6c757d", fontStyle: "italic" }}>
                    Selecciona un archivo Excel (.xlsx, .xls) o CSV exportado para visualizar las filas.
                </p>
            ) : (
                <div style={{ overflowX: "auto", border: "1px solid #e9ecef", borderRadius: "8px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", backgroundColor: "#fff" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                                <th style={{ padding: "10px", textAlign: "left" }}>Folio</th>
                                <th style={{ padding: "10px", textAlign: "left" }}>Ingreso</th>
                                <th style={{ padding: "10px", textAlign: "left" }}>Respuesta</th>
                                <th style={{ padding: "10px", textAlign: "left" }}>Agendada</th>
                                <th style={{ padding: "10px", textAlign: "left" }}>Sujeto Pasivo</th>
                                <th style={{ padding: "10px", textAlign: "left" }}>Cargo</th>
                                <th style={{ padding: "10px", textAlign: "left" }}>Sujeto Activo</th>
                                <th style={{ padding: "10px", textAlign: "left" }}>RUT</th>
                                <th style={{ padding: "10px", textAlign: "center" }}>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {datos.map((item, idx) => (
                                <tr key={`${item.Folio}-${idx}`} style={{ borderBottom: "1px solid #f1f3f5" }}>
                                    <td style={{ padding: "10px", fontWeight: "bold" }}>{item.Folio}</td>
                                    <td style={{ padding: "10px" }}>{item.FechaIngreso || "-"}</td>
                                    <td style={{ padding: "10px" }}>{item.FechaRespuesta || "-"}</td>
                                    <td style={{ padding: "10px" }}>{item.FechaAgendada || "-"}</td>
                                    <td style={{ padding: "10px" }}>{item.NombreSujetoPasivo}</td>
                                    <td style={{ padding: "10px" }}>{item.Cargo}</td>
                                    <td style={{ padding: "10px" }}>{item.NombreSujetoActivo}</td>
                                    <td style={{ padding: "10px" }}>{item.RutSujetoActivo}</td>
                                    <td style={{ padding: "10px", textAlign: "center", textTransform: "capitalize" }}>
                                        <span style={{
                                            padding: "3px 8px",
                                            borderRadius: "10px",
                                            backgroundColor: item.Estado === "aceptada" ? "#e8f5e9" : "#ffebee",
                                            color: item.Estado === "aceptada" ? "#2e7d32" : "#c62828",
                                            fontWeight: 600,
                                            fontSize: "11px"
                                        }}>
                                            {item.Estado}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}