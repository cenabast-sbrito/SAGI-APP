import { useState, useEffect, useMemo } from "react";
import PanelInformativoAlertas from "../components/PanelInformativoAlertas";
import PanelFiltrosAlertas, { type FiltroAlerta } from "../components/PanelFiltrosAlertas";
import TablaAlertas from "../components/TablaAlertas";
import { obtenerAlertas } from "../api/alertas.api";
import type { Alerta } from "../models/alerta";

const FILTROS_INICIALES: FiltroAlerta = {
    estado: "",
    nombreSujetoPasivo: "",
    cargo: "",
    folio: "",
    color: "",
    tipoAlerta: "",
    rango: "TODO",
    fechaDesde: "",
    fechaHasta: ""
};

export default function Alertas() {
    const [filtros, setFiltros] = useState<FiltroAlerta>(FILTROS_INICIALES);
    const [alertas, setAlertas] = useState<Alerta[]>([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagina, setPagina] = useState(1);
    const [porPagina] = useState(8);

    const ejecutarBusqueda = async (filtrosABuscar: FiltroAlerta) => {
        setCargando(true);
        setError(null);
        setPagina(1);

        try {
            const data = await obtenerAlertas(filtrosABuscar);
            setAlertas(Array.isArray(data) ? data : []);
        } catch (err: any) {
            if (err.response?.status === 403 || err.response?.status === 401) {
                setError("Sesión expirada o permisos insuficientes (403/401). Vuelve a iniciar sesión.");
            } else {
                setError(err.response?.data?.mensaje || "Error al obtener las alertas del servidor.");
            }
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        ejecutarBusqueda(FILTROS_INICIALES);
    }, []);

    const manejarFiltro = (campo: keyof FiltroAlerta, valor: string) => {
        setFiltros(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    const handleAplicarFiltros = () => {
        ejecutarBusqueda(filtros);
    };

    const handleLimpiarFiltros = () => {
        setFiltros(FILTROS_INICIALES);
        ejecutarBusqueda(FILTROS_INICIALES);
    };

    const totalPaginas = Math.ceil(alertas.length / porPagina) || 1;

    const paginarAlertas = useMemo(() => {
        const inicio = (pagina - 1) * porPagina;
        const fin = inicio + porPagina;
        return alertas.slice(inicio, fin);
    }, [alertas, pagina, porPagina]);

    return (
        <div style={{ padding: "24px", textAlign: "left", maxWidth: "1280px", margin: "0 auto" }}>
            <PanelInformativoAlertas />

            {/* Tarjeta de Filtros de Búsqueda */}
            <div
                style={{
                    marginTop: "24px",
                    backgroundColor: "#ffffff",
                    borderRadius: "10px",
                    border: "1px solid #e9ecef",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    padding: "20px 24px"
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ margin: 0, fontSize: "18px", color: "#212529" }}>Filtros de Búsqueda</h3>
                    <span style={{ fontSize: "13px", color: "#6c757d" }}>Configure los criterios y presione Aplicar</span>
                </div>

                <PanelFiltrosAlertas
                    filtros={filtros}
                    onChange={manejarFiltro}
                />

                <div
                    style={{
                        marginTop: "20px",
                        paddingTop: "16px",
                        borderTop: "1px solid #f1f3f5",
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "12px"
                    }}
                >
                    <button
                        onClick={handleLimpiarFiltros}
                        disabled={cargando}
                        style={{
                            padding: "9px 18px",
                            backgroundColor: "#f8f9fa",
                            color: "#495057",
                            border: "1px solid #ced4da",
                            borderRadius: "6px",
                            cursor: cargando ? "not-allowed" : "pointer",
                            fontSize: "14px",
                            fontWeight: 500,
                            transition: "all 0.2s"
                        }}
                    >
                        Limpiar Filtros
                    </button>

                    <button
                        onClick={handleAplicarFiltros}
                        disabled={cargando}
                        style={{
                            padding: "9px 24px",
                            backgroundColor: cargando ? "#6c757d" : "#0d6efd",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: cargando ? "not-allowed" : "pointer",
                            fontSize: "14px",
                            fontWeight: 600,
                            boxShadow: "0 2px 4px rgba(13,110,253,0.2)"
                        }}
                    >
                        {cargando ? "Buscando..." : "Aplicar Filtros"}
                    </button>
                </div>
            </div>

            {error && (
                <div style={{
                    marginTop: "16px",
                    padding: "12px 16px",
                    backgroundColor: "#ffebee",
                    color: "#c62828",
                    borderRadius: "6px",
                    border: "1px solid #ffcdd2",
                    fontSize: "14px"
                }}>
                    {error}
                </div>
            )}

            {/* Cabecera de Resultados */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "32px", marginBottom: "12px" }}>
                <h3 style={{ margin: 0, fontSize: "20px", color: "#212529" }}>
                    Resultados ({alertas.length})
                </h3>
                {cargando && <span style={{ color: "#0d6efd", fontSize: "14px", fontWeight: 500 }}>Actualizando resultados...</span>}
            </div>

            <TablaAlertas
                alertas={paginarAlertas}
                cargando={cargando}
            />

            {/* Paginación */}
            <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", alignItems: "center", gap: "12px" }}>
                <button
                    disabled={pagina <= 1}
                    onClick={() => setPagina(prev => Math.max(prev - 1, 1))}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: pagina <= 1 ? "#e9ecef" : "#0d6efd",
                        color: pagina <= 1 ? "#adb5bd" : "#ffffff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: pagina <= 1 ? "not-allowed" : "pointer",
                        fontWeight: 500
                    }}
                >
                    Anterior
                </button>

                <span style={{ fontSize: "14px", color: "#495057", fontWeight: 500 }}>
                    Página {pagina} de {totalPaginas}
                </span>

                <button
                    disabled={pagina >= totalPaginas}
                    onClick={() => setPagina(prev => Math.min(prev + 1, totalPaginas))}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: pagina >= totalPaginas ? "#e9ecef" : "#0d6efd",
                        color: pagina >= totalPaginas ? "#adb5bd" : "#ffffff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: pagina >= totalPaginas ? "not-allowed" : "pointer",
                        fontWeight: 500
                    }}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
}