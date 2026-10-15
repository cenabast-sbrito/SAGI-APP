import { useState, useEffect, useMemo } from "react";
import { obtenerFuncionariosApi, actualizarCorreoFuncionarioApi, type Funcionario } from "../api/funcionarios.api";

export default function FuncionariosCorreo() {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [cargando, setCargando] = useState(true);
    const [filtroNombre, setFiltroNombre] = useState("");
    const [filtroCargo, setFiltroCargo] = useState("");

    // Estado del modal de edición
    const [funcionarioSeleccionado, setFuncionarioSeleccionado] = useState<Funcionario | null>(null);
    const [nuevoCorreo, setNuevoCorreo] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [errorModal, setErrorModal] = useState<string | null>(null);
    const [mensajeExito, setMensajeExito] = useState<string | null>(null);

    const cargarDatos = async () => {
        setCargando(true);
        try {
            const data = await obtenerFuncionariosApi();
            setFuncionarios(data);
        } catch (err: any) {
            console.error("Error al cargar funcionarios:", err);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    // Filtrado en memoria por Nombre y Cargo
    const funcionariosFiltrados = useMemo(() => {
        return funcionarios.filter((item) => {
            const matchNombre =
                !filtroNombre.trim() ||
                item.nombreSujetoPasivo.toLowerCase().includes(filtroNombre.trim().toLowerCase());

            const matchCargo =
                !filtroCargo.trim() ||
                (item.cargo && item.cargo.toLowerCase().includes(filtroCargo.trim().toLowerCase()));

            return matchNombre && matchCargo;
        });
    }, [funcionarios, filtroNombre, filtroCargo]);

    const handleAbrirModal = (func: Funcionario) => {
        setFuncionarioSeleccionado(func);
        setNuevoCorreo(func.correo || "");
        setErrorModal(null);
    };

    const handleCerrarModal = () => {
        setFuncionarioSeleccionado(null);
        setNuevoCorreo("");
        setErrorModal(null);
    };

    const handleGuardarCorreo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!funcionarioSeleccionado) return;

        if (!nuevoCorreo.trim() || !nuevoCorreo.includes("@")) {
            setErrorModal("Por favor ingrese un correo electrónico válido.");
            return;
        }

        setGuardando(true);
        setErrorModal(null);

        try {
            await actualizarCorreoFuncionarioApi({
                nombreSujetoPasivo: funcionarioSeleccionado.nombreSujetoPasivo,
                correo: nuevoCorreo.trim()
            });

            // Actualizar estado local
            setFuncionarios((prev) =>
                prev.map((f) =>
                    f.nombreSujetoPasivo === funcionarioSeleccionado.nombreSujetoPasivo
                        ? { ...f, correo: nuevoCorreo.trim() }
                        : f
                )
            );

            setMensajeExito(`Correo de "${funcionarioSeleccionado.nombreSujetoPasivo}" actualizado exitosamente.`);
            setTimeout(() => setMensajeExito(null), 4000);
            handleCerrarModal();
        } catch (err: any) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.mensaje ||
                err.message ||
                "Error al actualizar el correo en el servidor.";
            setErrorModal(msg);
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div style={{ padding: "28px", maxWidth: "1280px", margin: "0 auto" }}>
            <div style={{ marginBottom: "20px" }}>
                <h2 style={{ margin: "0 0 6px 0", color: "#1f2937", fontSize: "22px" }}>
                    Gestión de Correos de Funcionarios
                </h2>
                <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
                    Administra los correos institucionales de los Sujetos Pasivos para el envío de alertas y notificaciones.
                </p>
            </div>

            {mensajeExito && (
                <div style={{
                    padding: "12px 16px",
                    backgroundColor: "#e8f5e9",
                    color: "#2e7d32",
                    borderRadius: "8px",
                    border: "1px solid #c8e6c9",
                    marginBottom: "20px",
                    fontSize: "14px",
                    fontWeight: 500
                }}>
                    ✓ {mensajeExito}
                </div>
            )}

            {/* Panel de Filtros */}
            <div style={{
                backgroundColor: "#ffffff",
                padding: "20px",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                marginBottom: "20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
                    <div style={{ flex: "1 1 260px" }}>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                            NOMBRE SUJETO PASIVO
                        </label>
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={filtroNombre}
                            onChange={(e) => setFiltroNombre(e.target.value)}
                            style={{
                                width: "100%",
                                height: "38px",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                border: "1px solid #d1d5db",
                                fontSize: "13px",
                                boxSizing: "border-box"
                            }}
                        />
                    </div>

                    <div style={{ flex: "1 1 200px" }}>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                            CARGO
                        </label>
                        <input
                            type="text"
                            placeholder="Buscar por cargo..."
                            value={filtroCargo}
                            onChange={(e) => setFiltroCargo(e.target.value)}
                            style={{
                                width: "100%",
                                height: "38px",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                border: "1px solid #d1d5db",
                                fontSize: "13px",
                                boxSizing: "border-box"
                            }}
                        />
                    </div>

                    {(filtroNombre || filtroCargo) && (
                        <button
                            type="button"
                            onClick={() => { setFiltroNombre(""); setFiltroCargo(""); }}
                            style={{
                                height: "38px",
                                padding: "0 16px",
                                backgroundColor: "#f3f4f6",
                                color: "#4b5563",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "13px"
                            }}
                        >
                            Limpiar Filtros
                        </button>
                    )}
                </div>
            </div>

            {/* Tabla de Funcionarios */}
            <div style={{
                backgroundColor: "#ffffff",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6" }}>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "#1f2937" }}>
                        Total de Funcionarios ({funcionariosFiltrados.length})
                    </span>
                </div>

                {cargando ? (
                    <div style={{ padding: "24px", textAlign: "center", color: "#6b7280" }}>
                        Cargando funcionarios...
                    </div>
                ) : funcionariosFiltrados.length === 0 ? (
                    <div style={{ padding: "24px", textAlign: "center", color: "#6b7280" }}>
                        No se encontraron funcionarios con los filtros aplicados.
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                            <thead>
                                <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", color: "#4b5563" }}>
                                    <th style={{ padding: "12px 16px", textAlign: "left" }}>Sujeto Pasivo (Funcionario)</th>
                                    <th style={{ padding: "12px 16px", textAlign: "left" }}>Cargo</th>
                                    <th style={{ padding: "12px 16px", textAlign: "left" }}>Correo Electrónico</th>
                                    <th style={{ padding: "12px 16px", textAlign: "center" }}>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {funcionariosFiltrados.map((item, idx) => {
                                    const sinCorreo = !item.correo || item.correo.trim() === "";

                                    return (
                                        <tr
                                            key={`${item.nombreSujetoPasivo}-${idx}`}
                                            style={{
                                                borderBottom: "1px solid #f3f4f6",
                                                backgroundColor: sinCorreo ? "#fff8f0" : "transparent"
                                            }}
                                        >
                                            <td style={{ padding: "12px 16px", fontWeight: 600, color: "#111827" }}>
                                                {item.nombreSujetoPasivo}
                                            </td>
                                            <td style={{ padding: "12px 16px", color: "#4b5563" }}>
                                                {item.cargo || "-"}
                                            </td>
                                            <td style={{ padding: "12px 16px" }}>
                                                {sinCorreo ? (
                                                    <span style={{
                                                        padding: "2px 8px",
                                                        borderRadius: "10px",
                                                        backgroundColor: "#fee2e2",
                                                        color: "#b91c1c",
                                                        fontSize: "11px",
                                                        fontWeight: 600
                                                    }}>
                                                        Sin correo
                                                    </span>
                                                ) : (
                                                    <span style={{ color: "#1f2937" }}>{item.correo}</span>
                                                )}
                                            </td>
                                            <td style={{ padding: "12px 16px", textAlign: "center" }}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAbrirModal(item)}
                                                    style={{
                                                        padding: "6px 14px",
                                                        backgroundColor: "#0d6efd",
                                                        color: "#ffffff",
                                                        border: "none",
                                                        borderRadius: "6px",
                                                        cursor: "pointer",
                                                        fontSize: "12px",
                                                        fontWeight: 500,
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "6px"
                                                    }}
                                                >
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M12 20h9" />
                                                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                                    </svg>
                                                    Editar Correo
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal para Editar Correo */}
            {funcionarioSeleccionado && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999
                    }}
                    onClick={handleCerrarModal}
                >
                    <div
                        style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "10px",
                            width: "480px",
                            maxWidth: "92%",
                            padding: "24px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                            <h3 style={{ margin: 0, fontSize: "18px", color: "#111827" }}>
                                Actualizar Correo Institucional
                            </h3>
                            <button
                                type="button"
                                onClick={handleCerrarModal}
                                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#6b7280" }}
                            >
                                ×
                            </button>
                        </div>

                        {errorModal && (
                            <div style={{
                                padding: "10px 14px",
                                backgroundColor: "#fef2f2",
                                color: "#b91c1c",
                                borderRadius: "6px",
                                fontSize: "13px",
                                marginBottom: "16px"
                            }}>
                                {errorModal}
                            </div>
                        )}

                        <form onSubmit={handleGuardarCorreo}>
                            <div style={{ marginBottom: "14px" }}>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#4b5563", marginBottom: "4px" }}>
                                    Funcionario (Sujeto Pasivo)
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    value={funcionarioSeleccionado.nombreSujetoPasivo}
                                    style={{
                                        width: "100%",
                                        height: "36px",
                                        padding: "6px 10px",
                                        borderRadius: "6px",
                                        border: "1px solid #e5e7eb",
                                        backgroundColor: "#f9fafb",
                                        color: "#6b7280",
                                        fontSize: "13px",
                                        boxSizing: "border-box"
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: "20px" }}>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                                    Nuevo Correo Electrónico *
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="ejemplo@institucion.cl"
                                    value={nuevoCorreo}
                                    onChange={(e) => setNuevoCorreo(e.target.value)}
                                    style={{
                                        width: "100%",
                                        height: "38px",
                                        padding: "6px 12px",
                                        borderRadius: "6px",
                                        border: "1px solid #d1d5db",
                                        fontSize: "13px",
                                        boxSizing: "border-box",
                                        outline: "none"
                                    }}
                                />
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                                <button
                                    type="button"
                                    onClick={handleCerrarModal}
                                    disabled={guardando}
                                    style={{
                                        padding: "8px 16px",
                                        backgroundColor: "#f3f4f6",
                                        color: "#4b5563",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "6px",
                                        cursor: guardando ? "not-allowed" : "pointer",
                                        fontSize: "13px",
                                        fontWeight: 500
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={guardando}
                                    style={{
                                        padding: "8px 20px",
                                        backgroundColor: guardando ? "#9ca3af" : "#0d6efd",
                                        color: "#ffffff",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: guardando ? "not-allowed" : "pointer",
                                        fontSize: "13px",
                                        fontWeight: 600
                                    }}
                                >
                                    {guardando ? "Guardando..." : "Grabar Correo"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}