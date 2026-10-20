import { useState } from "react";
import type { Alerta } from "../models/alerta";

interface Props {
    alertas: Alerta[];
    cargando: boolean;
    onAccionEnviar?: (alerta: Alerta) => void;
}

const COLOR_MAP: Record<string, string> = {
    "Verde": "#2e7d32",
    "Amarillo": "#fbc02d",
    "Rojo": "#d32f2f",
    "Azul": "#1976d2",
    "Naranjo": "#f57c00",
    "Violeta": "#7b1fa2",
    "Rojo Oscuro": "#5c0000"
};

export default function TablaAlertas({ alertas, cargando, onAccionEnviar }: Props) {
    const [alertaSeleccionadaEmail, setAlertaSeleccionadaEmail] = useState<Alerta | null>(null);

    const formatearFecha = (fechaStr: string | null) => {
        if (!fechaStr) return "-";
        const date = new Date(fechaStr);
        return isNaN(date.getTime()) ? fechaStr : date.toLocaleDateString("es-CL");
    };

    if (cargando) {
        return <p style={{ padding: "16px", fontStyle: "italic" }}>Cargando alertas...</p>;
    }

    if (!alertas || alertas.length === 0) {
        return (
            <p style={{ padding: "16px", color: "#666" }}>
                No se encontraron alertas con los criterios seleccionados.
            </p>
        );
    }

    return (
        <div style={{ overflowX: "auto", marginTop: "16px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", backgroundColor: "#ffffff" }}>
                <thead>
                    <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6", color: "#495057" }}>
                        <th style={{ padding: "12px 10px", textAlign: "center" }}>Alerta</th>
                        <th style={{ padding: "12px 10px", textAlign: "left" }}>Folio</th>
                        <th style={{ padding: "12px 10px", textAlign: "center" }}>Fecha Ingreso</th>
                        <th style={{ padding: "12px 10px", textAlign: "left" }}>Sujeto Pasivo</th>
                        <th style={{ padding: "12px 10px", textAlign: "left" }}>Correo</th>
                        <th style={{ padding: "12px 10px", textAlign: "left" }}>Estado</th>
                        <th style={{ padding: "12px 10px", textAlign: "center" }}>Días Hábiles</th>
                        <th style={{ padding: "12px 10px", textAlign: "center" }}>Días Espera</th>
                        <th style={{ padding: "12px 10px", textAlign: "center" }}>Pend. Publ.</th>
                        <th style={{ padding: "12px 10px", textAlign: "center", color: "#8a5800" }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {alertas.map((item, idx) => {
                        const colorNombre = item.EstadoPlazoRespuesta || "Gris";
                        const hexColor = COLOR_MAP[colorNombre] || "#757575";
                        const sinCorreo = !item.Correo || item.Correo.trim() === "";

                        return (
                            <tr
                                key={`${item.Folio}-${idx}`}
                                style={{
                                    borderBottom: "1px solid #e9ecef",
                                    backgroundColor: sinCorreo ? "#fff8f0" : "transparent"
                                }}
                            >
                                {/* Círculo de color unificado con tooltip */}
                                <td style={{ padding: "10px", textAlign: "center" }}>
                                    <span
                                        title={`Nivel: ${colorNombre} | ${item.TipoAlerta}`}
                                        style={{
                                            width: "16px",
                                            height: "16px",
                                            borderRadius: "50%",
                                            backgroundColor: hexColor,
                                            display: "inline-block",
                                            boxShadow: "0 0 0 2px rgba(0,0,0,0.12)",
                                            verticalAlign: "middle"
                                        }}
                                    />
                                </td>

                                <td style={{ padding: "10px", fontWeight: "bold" }}>
                                    {item.Folio}
                                </td>

                                <td style={{ padding: "10px", textAlign: "center", color: "#495057" }}>
                                    {formatearFecha(item.FechaIngreso)}
                                </td>

                                <td style={{ padding: "10px" }}>
                                    {item.NombreSujetoPasivo}
                                </td>

                                {/* Columna Correo con indicador si no está definido */}
                                <td style={{ padding: "10px" }}>
                                    {sinCorreo ? (
                                        <span
                                            title="Sujeto pasivo sin correo institucional registrado"
                                            style={{
                                                padding: "2px 8px",
                                                borderRadius: "10px",
                                                backgroundColor: "#ffebee",
                                                color: "#c62828",
                                                fontWeight: 600,
                                                fontSize: "11px",
                                                display: "inline-block"
                                            }}
                                        >
                                            Sin correo
                                        </span>
                                    ) : (
                                        <span style={{ color: "#333", fontSize: "12px" }}>
                                            {item.Correo}
                                        </span>
                                    )}
                                </td>

                                <td style={{ padding: "10px", textTransform: "capitalize" }}>
                                    <span style={{
                                        padding: "3px 8px",
                                        borderRadius: "10px",
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        backgroundColor: item.Estado === "aceptada" ? "#e8f5e9" : "#fff3e0",
                                        color: item.Estado === "aceptada" ? "#2e7d32" : "#e65100"
                                    }}>
                                        {item.Estado}
                                    </span>
                                </td>

                                <td style={{ padding: "10px", textAlign: "center", fontWeight: "bold" }}>
                                    {item.DiasEnEsperaHabiles}
                                </td>

                                <td style={{ padding: "10px", textAlign: "center", color: "#6c757d" }}>
                                    {item.DiasEnEspera}
                                </td>

                                <td style={{ padding: "10px", textAlign: "center" }}>
                                    {item.PendientePublicacion ? (
                                        <span style={{ color: "#d32f2f", fontWeight: "bold" }}>Sí</span>
                                    ) : (
                                        <span style={{ color: "#6c757d" }}>No</span>
                                    )}
                                </td>

                                {/* Botones circulares de acciones */}
                                <td style={{ padding: "10px", textAlign: "center" }}>
                                    <div style={{ display: "inline-flex", gap: "6px", alignItems: "center", justifyContent: "center" }}>
                                        {/* Botón 1: Ver Detalle del Correo */}
                                        <button
                                            type="button"
                                            title="Ver detalle del correo a enviar"
                                            onClick={() => setAlertaSeleccionadaEmail(item)}
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                                borderRadius: "50%",
                                                backgroundColor: "#1976d2",
                                                color: "#ffffff",
                                                border: "none",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                boxShadow: "0 2px 4px rgba(25,118,210,0.3)"
                                            }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                            </svg>
                                        </button>

                                        {/* Botón 2: Acción posterior */}
                                        <button
                                            type="button"
                                            title={sinCorreo ? "No es posible enviar correo sin destinatario" : "Enviar acción"}
                                            disabled={sinCorreo}
                                            onClick={() => onAccionEnviar?.(item)}
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                                borderRadius: "50%",
                                                backgroundColor: sinCorreo ? "#adb5bd" : "#2e7d32",
                                                color: "#ffffff",
                                                border: "none",
                                                cursor: sinCorreo ? "not-allowed" : "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                boxShadow: sinCorreo ? "none" : "0 2px 4px rgba(46,125,50,0.3)"
                                            }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="22" y1="2" x2="11" y2="13" />
                                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Modal para ver detalle del correo */}
            {alertaSeleccionadaEmail && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "10px",
                            width: "520px",
                            maxWidth: "90%",
                            padding: "24px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                            <h3 style={{ margin: 0, color: "#1976d2", fontSize: "18px" }}>
                                ✉️ Vista Previa del Correo
                            </h3>
                            <button
                                onClick={() => setAlertaSeleccionadaEmail(null)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: "18px",
                                    cursor: "pointer",
                                    color: "#6c757d"
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ backgroundColor: "#f8f9fa", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", fontSize: "13px" }}>
                            <p style={{ margin: "0 0 6px 0" }}><strong>Destinatario:</strong> {alertaSeleccionadaEmail.NombreSujetoPasivo} ({alertaSeleccionadaEmail.Correo || "Sin correo registrado"})</p>
                            <p style={{ margin: "0 0 6px 0" }}><strong>Folio:</strong> {alertaSeleccionadaEmail.Folio}</p>
                            <p style={{ margin: "0 0 6px 0" }}><strong>Estado Alerta:</strong> {alertaSeleccionadaEmail.EstadoPlazoRespuesta} ({alertaSeleccionadaEmail.DiasEnEsperaHabiles} días hábiles)</p>
                            <p style={{ margin: 0 }}><strong>Fecha Ingreso:</strong> {formatearFecha(alertaSeleccionadaEmail.FechaIngreso)}</p>
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "#495057", marginBottom: "6px" }}>
                                Contenido del Mensaje:
                            </label>
                            <div
                                style={{
                                    padding: "12px",
                                    backgroundColor: "#fff",
                                    border: "1px solid #ced4da",
                                    borderRadius: "1px",
                                    fontSize: "13px",
                                    lineHeight: 1.5,
                                    color: "#212529",
                                }}
                                dangerouslySetInnerHTML={{
                                    __html:
                                        alertaSeleccionadaEmail.ContenidoEmail ||
                                        `Estimado/a ${alertaSeleccionadaEmail.NombreSujetoPasivo}. Folio: ${alertaSeleccionadaEmail.Folio}`
                                }}
                            />
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button
                                type="button"
                                onClick={() => setAlertaSeleccionadaEmail(null)}
                                style={{
                                    padding: "8px 18px",
                                    backgroundColor: "#6c757d",
                                    color: "#ffffff",
                                    border: "none",
                                    borderRadius: "1px",
                                    cursor: "pointer",
                                    fontWeight: 500
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