import { useEffect, useState, useCallback } from "react";
import { obtenerDashboard } from "../api/dashboard.api";
import type { DashboardData, RangoDashboard } from "../models/dashboard";

const COLOR_MAP: Record<string, { bg: string; text: string; hex: string }> = {
    "Verde": { bg: "#e8f5e9", text: "#2e7d32", hex: "#28a745" },
    "Amarillo": { bg: "#fff9c4", text: "#f57f17", hex: "#ffc107" },
    "Rojo": { bg: "#ffebee", text: "#c62828", hex: "#dc3545" },
    "Azul": { bg: "#e3f2fd", text: "#1565c0", hex: "#0d6efd" },
    "Naranjo": { bg: "#fff3e0", text: "#e65100", hex: "#fd7e14" },
    "Violeta": { bg: "#f3e5f5", text: "#6a1b9a", hex: "#6f42c1" },
    "Rojo Oscuro": { bg: "#fce4ec", text: "#880e4f", hex: "#842029" }
};

const formatNum = (val: number | null | undefined): string => {
    return (val ?? 0).toLocaleString();
};

export default function Dashboard() {
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filtros de fecha
    const [rango, setRango] = useState<RangoDashboard>("TODO");
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");

    const cargarMetricas = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            const data = await obtenerDashboard({
                rango,
                fechaDesde: rango === "PERSONALIZADO" ? fechaDesde : undefined,
                fechaHasta: rango === "PERSONALIZADO" ? fechaHasta : undefined
            });
            setDashboard(data);
        } catch (err: any) {
            console.error("❌ Error cargando dashboard:", err);
            setError(err.response?.data?.message || err.message || "Error al conectar con el servidor.");
        } finally {
            setCargando(false);
        }
    }, [rango, fechaDesde, fechaHasta]);

    useEffect(() => {
        if (rango !== "PERSONALIZADO" || (fechaDesde && fechaHasta)) {
            cargarMetricas();
        }
    }, [cargarMetricas]);

    const kpis = {
        TotalAlertas: dashboard?.kpis?.TotalAlertas ?? 0,
        SolicitudesPendientes: dashboard?.kpis?.SolicitudesPendientes ?? 0,
        AudienciasPendientesPublicacion: dashboard?.kpis?.AudienciasPendientesPublicacion ?? 0,
        AlertasCriticas: dashboard?.kpis?.AlertasCriticas ?? 0
    };

    const cumplimiento = {
        TotalAlertas: dashboard?.cumplimiento?.TotalAlertas ?? 0,
        TotalIncumplidas: dashboard?.cumplimiento?.TotalIncumplidas ?? 0,
        PorcentajeIncumplimiento: dashboard?.cumplimiento?.PorcentajeIncumplimiento ?? 0
    };

    return (
        <div style={{ padding: "28px 32px", maxWidth: "1400px", margin: "0 auto", color: "#1f2937" }}>
            {/* Header del Dashboard y Controles de Filtro */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                flexWrap: "wrap",
                gap: "16px",
                marginBottom: "24px"
            }}>
                <div>
                    <h2 style={{ margin: "0 0 6px 0", fontSize: "24px", fontWeight: 700, color: "#111827" }}>
                        Dashboard de Monitoreo Ley de Lobby
                    </h2>
                    <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
                        Indicadores de gestión, cumplimiento de plazos legales y control de alertas institucionales
                    </p>
                </div>

                {/* Filtro por Rangos */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    backgroundColor: "#ffffff",
                    padding: "6px 12px",
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>Período:</span>
                    <select
                        value={rango}
                        onChange={(e) => setRango(e.target.value as RangoDashboard)}
                        style={{
                            padding: "6px 12px",
                            borderRadius: "1px",
                            border: "1px solid #d1d5db",
                            fontSize: "13px",
                            backgroundColor: "#f9fafb",
                            color: "#374151",
                            cursor: "pointer",
                            outline: "none"
                        }}
                    >
                        <option value="TODO">Histórico Completo</option>
                        <option value="SEMANA">Últimos 7 Días</option>
                        <option value="MES">Últimos 30 Días</option>
                        <option value="PERSONALIZADO">Personalizado</option>
                    </select>

                    {rango === "PERSONALIZADO" && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <input
                                type="date"
                                value={fechaDesde}
                                onChange={(e) => setFechaDesde(e.target.value)}
                                style={{ padding: "4px 8px", borderRadius: "1px", border: "1px solid #d1d5db", fontSize: "12px" }}
                            />
                            <span style={{ fontSize: "12px", color: "#9ca3af" }}>a</span>
                            <input
                                type="date"
                                value={fechaHasta}
                                onChange={(e) => setFechaHasta(e.target.value)}
                                style={{ padding: "4px 8px", borderRadius: "1px", border: "1px solid #d1d5db", fontSize: "12px" }}
                            />
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={cargarMetricas}
                        title="Actualizar datos"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "6px 10px",
                            backgroundColor: "#f3f4f6",
                            border: "1px solid #d1d5db",
                            borderRadius: "1px",
                            cursor: "pointer",
                            color: "#4b5563"
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 4 23 10 17 10" />
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                        </svg>
                    </button>
                </div>
            </div>

            {error && (
                <div style={{
                    padding: "14px 18px",
                    backgroundColor: "#fef2f2",
                    color: "#b91c1c",
                    borderRadius: "8px",
                    border: "1px solid #fecaca",
                    marginBottom: "24px",
                    fontSize: "14px"
                }}>
                    ⚠️ {error}
                </div>
            )}

            {/* 1. SECCIÓN: Tarjetas KPIs */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "18px",
                marginBottom: "24px"
            }}>
                {/* KPI 1: Total Alertas */}
                <div style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    padding: "20px 22px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <div>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Total Alertas Activas
                        </div>
                        <div style={{ fontSize: "28px", fontWeight: 700, color: "#111827", margin: "6px 0 2px 0" }}>
                            {cargando ? "..." : formatNum(kpis.TotalAlertas)}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>En seguimiento SAGI</div>
                    </div>
                    <div style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        backgroundColor: "#e0f2fe",
                        color: "#0369a1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                    </div>
                </div>

                {/* KPI 2: Solicitudes Pendientes */}
                <div style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    padding: "20px 22px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <div>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Solicitudes Pendientes
                        </div>
                        <div style={{ fontSize: "28px", fontWeight: 700, color: "#d97706", margin: "6px 0 2px 0" }}>
                            {cargando ? "..." : formatNum(kpis.SolicitudesPendientes)}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>Plazo máx. 3 días hábiles</div>
                    </div>
                    <div style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        backgroundColor: "#fef3c7",
                        color: "#d97706",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </div>
                </div>

                {/* KPI 3: Pendientes Publicación */}
                <div style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    padding: "20px 22px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <div>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Pendientes Publicación
                        </div>
                        <div style={{ fontSize: "28px", fontWeight: 700, color: "#7c3aed", margin: "6px 0 2px 0" }}>
                            {cargando ? "..." : formatNum(kpis.AudienciasPendientesPublicacion)}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>Audiencias realizadas</div>
                    </div>
                    <div style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        backgroundColor: "#f3e8ff",
                        color: "#7c3aed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="4" width="20" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                    </div>
                </div>

                {/* KPI 4: Alertas Críticas & Incumplimiento */}
                <div style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    padding: "20px 22px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <div>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Alertas Críticas (Rojo/Oscuro)
                        </div>
                        <div style={{ fontSize: "28px", fontWeight: 700, color: "#dc2626", margin: "6px 0 2px 0" }}>
                            {cargando ? "..." : formatNum(kpis.AlertasCriticas)}
                        </div>
                        <div style={{ fontSize: "12px", color: "#dc2626", fontWeight: 600 }}>
                            {cumplimiento.PorcentajeIncumplimiento}% de incumplimiento
                        </div>
                    </div>
                    <div style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        backgroundColor: "#fee2e2",
                        color: "#dc2626",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* 2. SECCIÓN: Paneles Gráficos y Distribución */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                gap: "20px",
                marginBottom: "24px"
            }}>
                {/* Tarjeta: Distribución por Nivel de Plazo (Color) */}
                <div style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    padding: "22px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
                }}>
                    <h3 style={{ margin: "0 0 14px 0", fontSize: "16px", fontWeight: 600, color: "#111827" }}>
                        Distribución por Nivel de Plazo
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {dashboard?.alertasPorColor?.map((item) => {
                            const conf = COLOR_MAP[item.EstadoPlazoRespuesta] || { bg: "#f3f4f6", text: "#374151", hex: "#6b7280" };
                            const total = kpis.TotalAlertas || 1;
                            const porcentaje = Math.round(((item.Cantidad ?? 0) / total) * 100);

                            return (
                                <div key={item.EstadoPlazoRespuesta}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                                        <span style={{ fontWeight: 600, color: conf.text, display: "flex", alignItems: "center", gap: "6px" }}>
                                            <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: conf.hex }} />
                                            {item.EstadoPlazoRespuesta}
                                        </span>
                                        <span style={{ color: "#6b7280", fontWeight: 500 }}>
                                            {formatNum(item.Cantidad)} ({porcentaje}%)
                                        </span>
                                    </div>
                                    <div style={{ height: "8px", width: "100%", backgroundColor: "#f3f4f6", borderRadius: "4px", overflow: "hidden" }}>
                                        <div style={{ height: "100%", width: `${porcentaje}%`, backgroundColor: conf.hex, borderRadius: "4px" }} />
                                    </div>
                                </div>
                            );
                        })}
                        {(!dashboard?.alertasPorColor || dashboard.alertasPorColor.length === 0) && (
                            <p style={{ color: "#9ca3af", fontSize: "13px", margin: 0 }}>Sin datos para el período.</p>
                        )}
                    </div>
                </div>

                {/* Tarjeta: Alertas por Tipo y Estado */}
                <div style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    padding: "22px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                }}>
                    <div>
                        <h3 style={{ margin: "0 0 14px 0", fontSize: "16px", fontWeight: 600, color: "#111827" }}>
                            Tipos de Alerta & Estados
                        </h3>

                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px" }}>
                            {dashboard?.alertasPorTipo?.map((tipo) => (
                                <div
                                    key={tipo.TipoAlerta}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "10px 14px",
                                        backgroundColor: "#f9fafb",
                                        borderRadius: "8px",
                                        border: "1px solid #f3f4f6"
                                    }}
                                >
                                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                                        {tipo.TipoAlerta === "SOLICITUD_PENDIENTE" ? "Solicitudes Pendientes" : "Audiencias Pendientes Publicación"}
                                    </span>
                                    <span style={{
                                        fontSize: "14px",
                                        fontWeight: 700,
                                        backgroundColor: "#e5e7eb",
                                        padding: "2px 10px",
                                        borderRadius: "12px",
                                        color: "#1f2937"
                                    }}>
                                        {formatNum(tipo.Cantidad)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Resumen de Estados */}
                    <div>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", marginBottom: "8px", textTransform: "uppercase" }}>
                            Distribución por Estado del Trámite
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            {dashboard?.alertasPorEstado?.map((est) => (
                                <span
                                    key={est.Estado}
                                    style={{
                                        fontSize: "12px",
                                        padding: "4px 10px",
                                        backgroundColor: "#f3f4f6",
                                        borderRadius: "1px",
                                        color: "#4b5563"
                                    }}
                                >
                                    {est.Estado}: <strong>{formatNum(est.Cantidad)}</strong>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tarjeta: Funcionarios con Mayor Cantidad de Alertas */}
                <div style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    padding: "22px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
                }}>
                    <h3 style={{ margin: "0 0 14px 0", fontSize: "16px", fontWeight: 600, color: "#111827" }}>
                        Top Funcionarios con Alertas
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "240px", overflowY: "auto" }}>
                        {dashboard?.alertasPorFuncionario?.slice(0, 5).map((f, idx) => (
                            <div
                                key={`${f.NombreSujetoPasivo}-${idx}`}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "8px 12px",
                                    borderBottom: "1px solid #f3f4f6",
                                    fontSize: "13px"
                                }}
                            >
                                <span style={{ fontWeight: 500, color: "#1f2937", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "220px" }} title={f.NombreSujetoPasivo}>
                                    {idx + 1}. {f.NombreSujetoPasivo}
                                </span>
                                <span style={{
                                    padding: "2px 8px",
                                    borderRadius: "10px",
                                    backgroundColor: (f.TotalAlertas ?? 0) > 5 ? "#fee2e2" : "#fef3c7",
                                    color: (f.TotalAlertas ?? 0) > 5 ? "#991b1b" : "#92400e",
                                    fontWeight: 700,
                                    fontSize: "12px"
                                }}>
                                    {formatNum(f.TotalAlertas)} alertas
                                </span>
                            </div>
                        ))}
                        {(!dashboard?.alertasPorFuncionario || dashboard.alertasPorFuncionario.length === 0) && (
                            <p style={{ color: "#9ca3af", fontSize: "13px", margin: 0 }}>Sin registros en el período.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. SECCIÓN: Tabla Top Alertas de Mayor Urgencia */}
            <div style={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                overflow: "hidden"
            }}>
                <div style={{
                    padding: "16px 22px",
                    borderBottom: "1px solid #e5e7eb",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#111827" }}>
                        Alertas Prioritarias de Mayor Plazo Transcurrido
                    </h3>
                    <span style={{ fontSize: "13px", color: "#6b7280" }}>
                        Top {dashboard?.topAlertas?.length || 0} casos críticos
                    </span>
                </div>

                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", color: "#4b5563" }}>
                                <th style={{ padding: "12px 18px", textAlign: "left" }}>Nivel</th>
                                <th style={{ padding: "12px 18px", textAlign: "left" }}>Folio</th>
                                <th style={{ padding: "12px 18px", textAlign: "left" }}>Sujeto Pasivo (Funcionario)</th>
                                <th style={{ padding: "12px 18px", textAlign: "left" }}>Tipo Alerta</th>
                                <th style={{ padding: "12px 18px", textAlign: "left" }}>Estado</th>
                                <th style={{ padding: "12px 18px", textAlign: "center" }}>Días Hábiles</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dashboard?.topAlertas?.map((alerta, idx) => {
                                const conf = COLOR_MAP[alerta.EstadoPlazoRespuesta] || { bg: "#f3f4f6", text: "#374151", hex: "#6b7280" };

                                return (
                                    <tr key={`${alerta.Folio}-${idx}`} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                        <td style={{ padding: "12px 18px" }}>
                                            <span style={{
                                                padding: "3px 10px",
                                                borderRadius: "12px",
                                                fontSize: "11px",
                                                fontWeight: 600,
                                                backgroundColor: conf.bg,
                                                color: conf.text,
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "5px"
                                            }}>
                                                <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: conf.hex }} />
                                                {alerta.EstadoPlazoRespuesta}
                                            </span>
                                        </td>
                                        <td style={{ padding: "12px 18px", fontWeight: 700, color: "#111827" }}>
                                            {alerta.Folio}
                                        </td>
                                        <td style={{ padding: "12px 18px", color: "#1f2937", fontWeight: 500 }}>
                                            {alerta.NombreSujetoPasivo}
                                        </td>
                                        <td style={{ padding: "12px 18px", color: "#4b5563" }}>
                                            {alerta.TipoAlerta === "SOLICITUD_PENDIENTE" ? "Solicitud Pendiente" : "Audiencia Pendiente"}
                                        </td>
                                        <td style={{ padding: "12px 18px", textTransform: "capitalize", color: "#4b5563" }}>
                                            {alerta.Estado}
                                        </td>
                                        <td style={{ padding: "12px 18px", textAlign: "center", fontWeight: 700, color: "#dc2626" }}>
                                            {alerta.DiasEnEsperaHabiles} días
                                        </td>
                                    </tr>
                                );
                            })}
                            {(!dashboard?.topAlertas || dashboard.topAlertas.length === 0) && (
                                <tr>
                                    <td colSpan={6} style={{ padding: "24px", textAlign: "center", color: "#9ca3af" }}>
                                        No hay alertas críticas en el período seleccionado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}