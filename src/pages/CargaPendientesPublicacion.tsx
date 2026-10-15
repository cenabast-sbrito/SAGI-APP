import { useState } from "react";
import { cargarAudienciasPendientesApi } from "../api/cargas.api";
import { parsearExcelPendientes } from "../utils/excelParser";
import type { AudienciaPendienteItem, ResultadoCarga } from "../models/carga";
/////import * as XLSX from 'xlsx';

const DATOS_SIMULADOS_PENDIENTES: AudienciaPendienteItem[] = [
    {
        Folio: "AO003AW2164771",
        Estado: "Realizada",
        Forma: "1",
        Materia: "Revisión técnica de medicamentos",
        Especificacion_materia_tratada: "Detalle de plazos de entrega",
        Lugar: "Oficinas Centrales Cenabast",
        Comuna: "Santiago",
        Sujeto_pasivo: "Claudia Paz Aranela Suazo",
        Cargo: "Jefe Departamento",
        Sujeto_activo: "Laboratorio Chile S.A.",
        Rut: "15.432.123-K",
        Genero: "Femenino",
        Fecha_inicio: "2026-10-01T10:00:00.000Z",
        Fecha_termino: "2026-10-01T11:00:00.000Z"
    },
    {
        Folio: "AO003AW2320779",
        Estado: "Realizada",
        Forma: "1",
        Materia: "Convenio suministro de insumos",
        Especificacion_materia_tratada: "Cronograma de despacho 2027",
        Lugar: "Videoconferencia Teams",
        Comuna: "Santiago",
        Sujeto_pasivo: "Roberto Morales Silva",
        Cargo: "Director de Operaciones",
        Sujeto_activo: "Pharma Logística Chile",
        Rut: "76.543.210-9",
        Genero: "Masculino",
        Fecha_inicio: "2026-10-05T15:30:00.000Z",
        Fecha_termino: "2026-10-05T16:30:00.000Z"
    }
];

export default function CargaPendientesPublicacion() {
    const [usuarioCarga, setUsuarioCarga] = useState("LOC_SBRITO");
    const [datos, setDatos] = useState<AudienciaPendienteItem[]>([]);
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
                // Compatible con .xlsx, .xls, .csv, .txt
                const registros = await parsearExcelPendientes(file);
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
        setNombreArchivo("simulacion_pendientes.xlsx");
        setDatos(DATOS_SIMULADOS_PENDIENTES);
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
            const res = await cargarAudienciasPendientesApi(usuarioCarga, datos);
            setResultado(res);
        } catch (err: any) {
            let mensajeDetalle =
                err.response?.data?.error ||
                err.response?.data?.message ||
                err.response?.data?.mensaje ||
                err.message ||
                "Error en el servidor al guardar audiencias pendientes.";

            if (err.response?.status === 401) {
                mensajeDetalle = "Sesión expirada o no autenticada. Por favor, inicie sesión nuevamente.";
            } else if (err.response?.status === 403) {
                mensajeDetalle = "Permisos insuficientes: Su usuario no tiene rol para ejecutar cargas masivas.";
            }

            console.error("❌ Error en POST /cargas/audiencias/pendientes-publicacion:", err.response?.data || err);
            setError(typeof mensajeDetalle === "string" ? mensajeDetalle : JSON.stringify(mensajeDetalle));
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={{ padding: "24px", maxWidth: "1280px", margin: "0 auto", textAlign: "left" }}>
            <h2 style={{ margin: "0 0 6px 0", color: "#212529" }}>
                Carga de Audiencias Pendientes de Publicación
            </h2>
            <p style={{ margin: "0 0 20px 0", color: "#6c757d", fontSize: "14px" }}>
                Importación y guardado con cabecera y detalle para SAGI_$TEMPaudiencias_pendientes_publicacion
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
                            backgroundColor: cargando || datos.length === 0 ? "#6c757d" : "#f57c00",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: cargando || datos.length === 0 ? "not-allowed" : "pointer",
                            fontWeight: 600
                        }}
                    >
                        {cargando ? "Guardando Audiencias..." : `Guardar en Servidor (${datos.length})`}
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
                    {error}
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
                        {resultado.mensaje || "Audiencias pendientes de publicación guardadas exitosamente."}
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
                                <th style={{ padding: "10px", textAlign: "left" }}>Sujeto Pasivo</th>
                                <th style={{ padding: "10px", textAlign: "left" }}>Cargo</th>
                                <th style={{ padding: "10px", textAlign: "left" }}>Sujeto Activo</th>
                                <th style={{ padding: "10px", textAlign: "left" }}>RUT</th>
                                <th style={{ padding: "10px", textAlign: "left" }}>Materia</th>
                                <th style={{ padding: "10px", textAlign: "left" }}>Lugar</th>
                                <th style={{ padding: "10px", textAlign: "center" }}>Fecha Inicio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {datos.map((item, idx) => (
                                <tr key={`${item.Folio}-${idx}`} style={{ borderBottom: "1px solid #f1f3f5" }}>
                                    <td style={{ padding: "10px", fontWeight: "bold" }}>{item.Folio}</td>
                                    <td style={{ padding: "10px" }}>{item.Sujeto_pasivo}</td>
                                    <td style={{ padding: "10px" }}>{item.Cargo}</td>
                                    <td style={{ padding: "10px" }}>{item.Sujeto_activo}</td>
                                    <td style={{ padding: "10px" }}>{item.Rut}</td>
                                    <td style={{ padding: "10px" }}>{item.Materia}</td>
                                    <td style={{ padding: "10px" }}>{item.Lugar}</td>
                                    <td style={{ padding: "10px", textAlign: "center" }}>
                                        {item.Fecha_inicio ? new Date(item.Fecha_inicio).toLocaleDateString() : "-"}
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