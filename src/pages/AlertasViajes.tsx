import { useState, useEffect, useMemo } from "react";
import { obtenerAlertasViajes } from "../api/alertasViajes.api";
import type { AlertaViaje, FiltroAlertaViaje, TipoRangoViaje } from "../models/alertaViaje";

const FILTROS_INICIALES: FiltroAlertaViaje = {
    nombreSujetoPasivo: "",
    destino: "",
    origenDato: "TODOS",
    rango: "TODO",
    fechaDesde: "",
    fechaHasta: ""
};

const COLOR_MAP: Record<string, { bg: string; text: string; hex: string }> = {
    "Verde": { bg: "#e8f5e9", text: "#2e7d32", hex: "#28a745" },
    "Amarillo": { bg: "#fff9c4", text: "#f57f17", hex: "#ffc107" },
    "Rojo": { bg: "#ffebee", text: "#c62828", hex: "#dc3545" },
    "Naranjo": { bg: "#fff3e0", text: "#e65100", hex: "#fd7e14" },
    "Azul": { bg: "#e3f2fd", text: "#1565c0", hex: "#0d6efd" }
};

export default function AlertasViajes() {
    const [filtros, setFiltros] = useState<FiltroAlertaViaje>(FILTROS_INICIALES);
    const [alertas, setAlertas] = useState<AlertaViaje[]>([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagina, setPagina] = useState(1);
    const [porPagina] = useState(10);
    const [panelInformativoExpandido, setPanelInformativoExpandido] = useState(false);
    const [detalleViaje, setDetalleViaje] = useState<AlertaViaje | null>(null);

    const ejecutarBusqueda = async (filtrosABuscar: FiltroAlertaViaje) => {
        setCargando(true);
        setError(null);
        setPagina(1);

        try {
            const data = await obtenerAlertasViajes(filtrosABuscar);
            setAlertas(Array.isArray(data) ? data : []);
        } catch (err: any) {
            if (err.response?.status === 403 || err.response?.status === 401) {
                setError("Sesión expirada o permisos insuficientes (403/401).");
            } else {
                setError(err.response?.data?.mensaje || err.message || "Error al consultar alertas de viajes.");
            }
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        ejecutarBusqueda(FILTROS_INICIALES);
    }, []);

    const formatearFecha = (str: string | null | undefined) => {
        if (!str) return "-";
        const d = new Date(str);
        return isNaN(d.getTime()) ? String(str) : d.toLocaleDateString("es-CL");
    };

    const totalPaginas = Math.ceil(alertas.length / porPagina) || 1;

    const alertasPaginadas = useMemo(() => {
        const inicio = (pagina - 1) * porPagina;
        return alertas.slice(inicio, inicio + porPagina);
    }, [alertas, pagina, porPagina]);

    return (
        <div style={{ padding: "24px", maxWidth: "1280px", margin: "0 auto", textAlign: "left" }}>
            {/* Panel Informativo */}
            <div
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "10px",
                    border: "1px solid #e9ecef",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    padding: panelInformativoExpandido ? "18px 24px" : "14px 20px",
                    marginBottom: "20px"
                }}
            >
                <div
                    onClick={() => setPanelInformativoExpandido(!panelInformativoExpandido)}
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        userSelect: "none"
                    }}
                >
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <h2 style={{ margin: 0, fontSize: "18px", color: "#212529" }}>
                                ✈️ Alertas de Viajes Institucionales
                            </h2>
                            <span
                                style={{
                                    fontSize: "12px",
                                    backgroundColor: "#e9ecef",
                                    color: "#495057",
                                    padding: "2px 8px",
                                    borderRadius: "12px",
                                    fontWeight: 500
                                }}
                            >
                                {panelInformativoExpandido ? "Contraer" : "Ver criterios"}
                            </span>
                        </div>
                        <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#6c757d" }}>
                            Monitoreo de conciliación entre registros de Ley de Lobby y Gestión y Desarrollo de Personas (GYDP)
                        </p>
                    </div>

                    <button
                        type="button"
                        style={{
                            background: "none",
                            border: "1px solid #ced4da",
                            borderRadius: "1px",
                            padding: "4px 10px",
                            fontSize: "12px",
                            cursor: "pointer",
                            color: "#495057"
                        }}
                    >
                        {panelInformativoExpandido ? "▲ Ocultar" : "▼ Detalle"}
                    </button>
                </div>

                {panelInformativoExpandido && (
                    <div
                        style={{
                            marginTop: "16px",
                            paddingTop: "14px",
                            borderTop: "1px solid #f1f3f5",
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                            gap: "12px"
                        }}
                    >
                        <div style={{ fontSize: "12px", color: "#333", display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#28a745" }} />
                            <span><strong>Verde (Coincidente):</strong> Viaje publicado en Lobby y respaldado en GYDP.</span>
                        </div>
                        <div style={{ fontSize: "12px", color: "#333", display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ffc107" }} />
                            <span><strong>Amarillo (Pendiente Lobby):</strong> Viaje en GYDP no declarado aún en Lobby.</span>
                        </div>
                        <div style={{ fontSize: "12px", color: "#333", display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#dc3545" }} />
                            <span><strong>Rojo (Discordante / Vencido):</strong> Discrepancia en fechas o plazo de registro vencido.</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Tarjeta de Filtros */}
            <div
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "10px",
                    border: "1px solid #e9ecef",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    padding: "20px 24px",
                    marginBottom: "20px"
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ margin: 0, fontSize: "18px", color: "#212529" }}>Filtros de Búsqueda</h3>
                    <span style={{ fontSize: "13px", color: "#6c757d" }}>Filtre por Sujeto Pasivo, Destino o Rango Temporal</span>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "flex-end" }}>
                    <div style={{ flex: "1 1 240px" }}>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#495057", marginBottom: "4px" }}>
                            Nombre Sujeto Pasivo
                        </label>
                        <input
                            type="text"
                            placeholder="Ej. Hugo Abarca..."
                            value={filtros.nombreSujetoPasivo}
                            onChange={(e) => setFiltros((prev) => ({ ...prev, nombreSujetoPasivo: e.target.value }))}
                            style={{
                                width: "100%",
                                height: "32px",
                                padding: "6px 10px",
                                borderRadius: "1px",
                                border: "1px solid #ced4da",
                                fontSize: "13px",
                                boxSizing: "border-box"
                            }}
                        />
                    </div>

                    <div style={{ flex: "1 1 180px" }}>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#495057", marginBottom: "4px" }}>
                            Destino / Ciudad
                        </label>
                        <input
                            type="text"
                            placeholder="Ej. Santiago, Concepción..."
                            value={filtros.destino}
                            onChange={(e) => setFiltros((prev) => ({ ...prev, destino: e.target.value }))}
                            style={{
                                width: "100%",
                                height: "32px",
                                padding: "6px 10px",
                                borderRadius: "1px",
                                border: "1px solid #ced4da",
                                fontSize: "13px",
                                boxSizing: "border-box"
                            }}
                        />
                    </div>

                    <div style={{ flex: "1 1 180px" }}>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#495057", marginBottom: "4px" }}>
                            Rango de Fecha
                        </label>
                        <select
                            value={filtros.rango}
                            onChange={(e) => setFiltros((prev) => ({ ...prev, rango: e.target.value as TipoRangoViaje }))}
                            style={{
                                width: "100%",
                                height: "32px",
                                padding: "6px 10px",
                                borderRadius: "1px",
                                border: "1px solid #ced4da",
                                fontSize: "13px",
                                backgroundColor: "#ffffff"
                            }}
                        >
                            <option value="TODO">Histórico Completo</option>
                            <option value="SEMANA">Última Semana (7 días)</option>
                            <option value="MES">Últimos 30 Días</option>
                            <option value="PERSONALIZADO">Rango Específico...</option>
                        </select>
                    </div>

                    {filtros.rango === "PERSONALIZADO" && (
                        <>
                            <div style={{ flex: "1 1 140px" }}>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#495057", marginBottom: "4px" }}>
                                    Desde
                                </label>
                                <input
                                    type="date"
                                    value={filtros.fechaDesde}
                                    onChange={(e) => setFiltros((prev) => ({ ...prev, fechaDesde: e.target.value }))}
                                    style={{
                                        width: "100%",
                                        height: "32px",
                                        padding: "4px 8px",
                                        borderRadius: "1px",
                                        border: "1px solid #ced4da",
                                        fontSize: "12px",
                                        boxSizing: "border-box"
                                    }}
                                />
                            </div>

                            <div style={{ flex: "1 1 140px" }}>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#495057", marginBottom: "4px" }}>
                                    Hasta
                                </label>
                                <input
                                    type="date"
                                    value={filtros.fechaHasta}
                                    onChange={(e) => setFiltros((prev) => ({ ...prev, fechaHasta: e.target.value }))}
                                    style={{
                                        width: "100%",
                                        height: "32px",
                                        padding: "4px 8px",
                                        borderRadius: "1px",
                                        border: "1px solid #ced4da",
                                        fontSize: "12px",
                                        boxSizing: "border-box"
                                    }}
                                />
                            </div>
                        </>
                    )}

                    <div style={{ display: "flex", gap: "10px", marginLeft: "auto" }}>
                        <button
                            type="button"
                            onClick={() => {
                                setFiltros(FILTROS_INICIALES);
                                ejecutarBusqueda(FILTROS_INICIALES);
                            }}
                            disabled={cargando}
                            style={{
                                height: "32px",
                                padding: "0 16px",
                                backgroundColor: "#f8f9fa",
                                color: "#495057",
                                border: "1px solid #ced4da",
                                borderRadius: "1px",
                                cursor: "pointer",
                                fontSize: "13px"
                            }}
                        >
                            Limpiar
                        </button>

                        <button
                            type="button"
                            onClick={() => ejecutarBusqueda(filtros)}
                            disabled={cargando}
                            style={{
                                height: "32px",
                                padding: "0 20px",
                                backgroundColor: cargando ? "#6c757d" : "#0d6efd",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "1px",
                                cursor: cargando ? "not-allowed" : "pointer",
                                fontSize: "13px",
                                fontWeight: 600
                            }}
                        >
                            {cargando ? "Buscando..." : "Aplicar Filtros"}
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div
                    style={{
                        padding: "12px 16px",
                        backgroundColor: "#ffebee",
                        color: "#c62828",
                        borderRadius: "1px",
                        border: "1px solid #ffcdd2",
                        marginBottom: "16px",
                        fontSize: "13px"
                    }}
                >
                    {error}
                </div>
            )}

            {/* Encabezado de Resultados */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ margin: 0, fontSize: "18px", color: "#212529" }}>
                    Resultados de Viajes ({alertas.length})
                </h3>
                {cargando && <span style={{ color: "#0d6efd", fontSize: "13px" }}>Consultando registros...</span>}
            </div>

            {/* Tabla de Alertas */}
            {alertas.length === 0 && !cargando ? (
                <p style={{ padding: "20px", color: "#6c757d", fontStyle: "italic", background: "#fff", borderRadius: "8px", border: "1px solid #e9ecef" }}>
                    No se encontraron alertas de viajes con los criterios seleccionados.
                </p>
            ) : (
                <div style={{ overflowX: "auto", border: "1px solid #e9ecef", borderRadius: "8px", backgroundColor: "#ffffff" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6", color: "#495057" }}>
                                <th style={{ padding: "12px 10px", textAlign: "center" }}>Alerta</th>
                                <th style={{ padding: "12px 10px", textAlign: "left" }}>Funcionario / Sujeto Pasivo</th>
                                <th style={{ padding: "12px 10px", textAlign: "left" }}>RUT</th>
                                <th style={{ padding: "12px 10px", textAlign: "left" }}>Destino</th>
                                <th style={{ padding: "12px 10px", textAlign: "center" }}>Fecha Inicio</th>
                                <th style={{ padding: "12px 10px", textAlign: "center" }}>Fecha Término</th>
                                <th style={{ padding: "12px 10px", textAlign: "center" }}>Estado</th>
                                <th style={{ padding: "12px 10px", textAlign: "center" }}>Origen</th>
                                <th style={{ padding: "12px 10px", textAlign: "center" }}>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alertasPaginadas.map((item, idx) => {
                                const conf = COLOR_MAP[item.colorAlerta] || { bg: "#f8f9fa", text: "#495057", hex: "#6c757d" };

                                return (
                                    <tr key={item.idViaje || idx} style={{ borderBottom: "1px solid #f1f3f5" }}>
                                        <td style={{ padding: "10px", textAlign: "center" }}>
                                            <span
                                                title={`Alerta: ${item.colorAlerta} - ${item.estadoAlerta}`}
                                                style={{
                                                    width: "14px",
                                                    height: "14px",
                                                    borderRadius: "50%",
                                                    backgroundColor: conf.hex,
                                                    display: "inline-block",
                                                    boxShadow: "0 0 0 2px rgba(0,0,0,0.1)"
                                                }}
                                            />
                                        </td>
                                        <td style={{ padding: "10px", fontWeight: 600, color: "#212529" }}>
                                            {item.nombreSujetoPasivo}
                                        </td>
                                        <td style={{ padding: "10px", color: "#495057" }}>{item.rut || "-"}</td>
                                        <td style={{ padding: "10px", fontWeight: 500 }}>{item.destino}</td>
                                        <td style={{ padding: "10px", textAlign: "center", color: "#495057" }}>
                                            {formatearFecha(item.fechaInicio)}
                                        </td>
                                        <td style={{ padding: "10px", textAlign: "center", color: "#495057" }}>
                                            {formatearFecha(item.fechaTermino)}
                                        </td>
                                        <td style={{ padding: "10px", textAlign: "center" }}>
                                            <span
                                                style={{
                                                    padding: "3px 8px",
                                                    borderRadius: "10px",
                                                    fontSize: "11px",
                                                    fontWeight: 600,
                                                    backgroundColor: conf.bg,
                                                    color: conf.text
                                                }}
                                            >
                                                {item.estadoAlerta || "Pendiente"}
                                            </span>
                                        </td>
                                        <td style={{ padding: "10px", textAlign: "center", fontSize: "11px", color: "#6c757d" }}>
                                            {item.origen || "GYDP"}
                                        </td>
                                        <td style={{ padding: "10px", textAlign: "center" }}>
                                            <button
                                                type="button"
                                                onClick={() => setDetalleViaje(item)}
                                                style={{
                                                    padding: "4px 10px",
                                                    backgroundColor: "#e7f1ff",
                                                    color: "#0d6efd",
                                                    border: "none",
                                                    borderRadius: "1px",
                                                    cursor: "pointer",
                                                    fontSize: "12px",
                                                    fontWeight: 600
                                                }}
                                            >
                                                Ver
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Paginación */}
            {totalPaginas > 1 && (
                <div style={{ marginTop: "18px", display: "flex", justifyContent: "center", alignItems: "center", gap: "12px" }}>
                    <button
                        disabled={pagina <= 1}
                        onClick={() => setPagina((p) => Math.max(p - 1, 1))}
                        style={{
                            padding: "6px 14px",
                            backgroundColor: pagina <= 1 ? "#e9ecef" : "#0d6efd",
                            color: pagina <= 1 ? "#adb5bd" : "#ffffff",
                            border: "none",
                            borderRadius: "1px",
                            cursor: pagina <= 1 ? "not-allowed" : "pointer"
                        }}
                    >
                        Anterior
                    </button>
                    <span style={{ fontSize: "13px", color: "#495057" }}>
                        Página {pagina} de {totalPaginas}
                    </span>
                    <button
                        disabled={pagina >= totalPaginas}
                        onClick={() => setPagina((p) => Math.min(p + 1, totalPaginas))}
                        style={{
                            padding: "6px 14px",
                            backgroundColor: pagina >= totalPaginas ? "#e9ecef" : "#0d6efd",
                            color: pagina >= totalPaginas ? "#adb5bd" : "#ffffff",
                            border: "none",
                            borderRadius: "1px",
                            cursor: pagina >= totalPaginas ? "not-allowed" : "pointer"
                        }}
                    >
                        Siguiente
                    </button>
                </div>
            )}

            {/* Modal de Detalle */}
            {detalleViaje && (
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
                    onClick={() => setDetalleViaje(null)}
                >
                    <div
                        style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "8px",
                            width: "500px",
                            maxWidth: "90%",
                            padding: "24px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ margin: "0 0 16px 0", color: "#0d6efd", fontSize: "18px" }}>
                            Detalle del Viaje
                        </h3>
                        <div style={{ backgroundColor: "#f8f9fa", padding: "14px", borderRadius: "6px", fontSize: "13px", lineHeight: 1.6 }}>
                            <p style={{ margin: 0 }}><strong>Funcionario:</strong> {detalleViaje.nombreSujetoPasivo}</p>
                            <p style={{ margin: 0 }}><strong>RUT:</strong> {detalleViaje.rut || "No informado"}</p>
                            <p style={{ margin: 0 }}><strong>Destino:</strong> {detalleViaje.destino}</p>
                            <p style={{ margin: 0 }}><strong>Fecha Inicio:</strong> {formatearFecha(detalleViaje.fechaInicio)}</p>
                            <p style={{ margin: 0 }}><strong>Fecha Término:</strong> {formatearFecha(detalleViaje.fechaTermino)}</p>
                            <p style={{ margin: 0 }}><strong>Origen del Registro:</strong> {detalleViaje.origen}</p>
                            {detalleViaje.objetoViaje && <p style={{ margin: 0 }}><strong>Objeto:</strong> {detalleViaje.objetoViaje}</p>}
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                            <button
                                type="button"
                                onClick={() => setDetalleViaje(null)}
                                style={{
                                    padding: "6px 16px",
                                    backgroundColor: "#6c757d",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "1px",
                                    cursor: "pointer"
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