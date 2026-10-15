import { ChangeEvent } from "react";

export type RangoTipo = "TODO" | "SEMANA" | "MES" | "PERSONALIZADO";

const coloresAlerta = [
    { valor: "", texto: "Todos", color: "transparent" },
    { valor: "Verde", texto: "Verde (1 día)", color: "#28a745" },
    { valor: "Amarillo", texto: "Amarillo (2 días)", color: "#ffc107" },
    { valor: "Rojo", texto: "Rojo (3 días)", color: "#dc3545" },
    { valor: "Azul", texto: "Azul (≥4 días)", color: "#0d6efd" },
    { valor: "Naranjo", texto: "Naranjo (5-6 días)", color: "#fd7e14" },
    { valor: "Violeta", texto: "Violeta (7 días)", color: "#6f42c1" },
    { valor: "Rojo Oscuro", texto: "Rojo Oscuro (≥8 días)", color: "#842029" }
];


export interface FiltroAlerta {
    estado: string;
    nombreSujetoPasivo: string;
    cargo: string;
    folio: string;
    color: string;
    tipoAlerta: string;
    rango: RangoTipo;
    fechaDesde: string;
    fechaHasta: string;
}

interface Props {
    filtros: FiltroAlerta;
    onChange: (
        campo: keyof FiltroAlerta,
        valor: string
    ) => void;
}

const contenedorCampoStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    flex: "1 1 140px",
    minWidth: "130px"
};

const labelStyle: React.CSSProperties = {
    fontSize: "12px",
    fontWeight: 600,
    color: "#495057",
    marginBottom: "4px",
    whiteSpace: "nowrap"
};

const inputStyle: React.CSSProperties = {
    width: "100%",
    height: "36px",
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid #ced4da",
    fontSize: "13px",
    boxSizing: "border-box",
    backgroundColor: "#ffffff",
    outline: "none"
};

export default function PanelFiltrosAlertas({
    filtros,
    onChange
}: Props) {

    const manejarCambio =
        (campo: keyof FiltroAlerta) =>
            (
                event: ChangeEvent<
                    HTMLInputElement |
                    HTMLSelectElement
                >
            ) => {
                onChange(
                    campo,
                    event.target.value
                );
            };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
            {/* Fila 1: Folio, Nombre Sujeto Pasivo (VARCHAR), Cargo, Estado */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-end",
                    gap: "12px",
                    width: "100%",
                    flexWrap: "wrap"
                }}
            >
                <div style={contenedorCampoStyle}>
                    <label style={labelStyle}>Folio</label>
                    <input
                        type="text"
                        placeholder="Ej. AO003AW..."
                        value={filtros.folio}
                        onChange={manejarCambio("folio")}
                        style={inputStyle}
                    />
                </div>

                <div style={contenedorCampoStyle}>
                    <label style={labelStyle}>Nombre Sujeto Pasivo</label>
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={filtros.nombreSujetoPasivo}
                        onChange={manejarCambio("nombreSujetoPasivo")}
                        style={inputStyle}
                    />
                </div>

                <div style={contenedorCampoStyle}>
                    <label style={labelStyle}>Cargo</label>
                    <input
                        type="text"
                        placeholder="Ej. Jefe..."
                        value={filtros.cargo}
                        onChange={manejarCambio("cargo")}
                        style={inputStyle}
                    />
                </div>

                <div style={contenedorCampoStyle}>
                    <label style={labelStyle}>Estado</label>
                    <select
                        value={filtros.estado}
                        onChange={manejarCambio("estado")}
                        style={inputStyle}
                    >
                        <option value="">Todos</option>
                        <option value="ingresada">Ingresada</option>
                        <option value="aceptada">Aceptada</option>
                        <option value="encomendada">Encomendada</option>
                        <option value="rechazada">Rechazada</option>
                        <option value="cancelada">Cancelada</option>
                        <option value="suspendida">Suspendida</option>
                    </select>
                </div>
            </div>

            {/* Fila 2: Color Alerta, Tipo Alerta, Rango, Fechas */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-end",
                    gap: "12px",
                    width: "100%",
                    flexWrap: "wrap"
                }}
            >
                {/*<div style={contenedorCampoStyle}>*/}
                {/*    <label style={labelStyle}>Color Alerta</label>*/}
                {/*    <select*/}
                {/*        value={filtros.color}*/}
                {/*        onChange={manejarCambio("color")}*/}
                {/*        style={inputStyle}*/}
                {/*    >*/}
                {/*        <option value="">Todos</option>*/}
                {/*        <option value="Verde">Verde (1 día)</option>*/}
                {/*        <option value="Amarillo">Amarillo (2 días)</option>*/}
                {/*        <option value="Rojo">Rojo (3 días)</option>*/}
                {/*        <option value="Azul">Azul (≥4 días)</option>*/}
                {/*        <option value="Naranjo">Naranjo (5-6 días)</option>*/}
                {/*        <option value="Violeta">Violeta (7 días)</option>*/}
                {/*        <option value="Rojo Oscuro">Rojo Oscuro (≥8 días)</option>*/}
                {/*    </select>*/}
                {/*</div>*/}



















                <div style={contenedorCampoStyle}>
                    <label style={labelStyle}>Color Alerta</label>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                            style={{
                                width: "14px",
                                height: "14px",
                                minWidth: "14px",
                                borderRadius: "50%",
                                backgroundColor:
                                    coloresAlerta.find(c => c.valor === filtros.color)?.color
                                    || "transparent",
                                border: filtros.color
                                    ? "1px solid #adb5bd"
                                    : "1px solid #ced4da"
                            }}
                        />

                        <select
                            value={filtros.color}
                            onChange={manejarCambio("color")}
                            style={{ ...inputStyle, flex: 1 }}
                        >
                            {coloresAlerta.map((opcion) => (
                                <option key={opcion.valor} value={opcion.valor}>
                                    {opcion.texto}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>






                <div style={contenedorCampoStyle}>
                    <label style={labelStyle}>Tipo Alerta</label>
                    <select
                        value={filtros.tipoAlerta}
                        onChange={manejarCambio("tipoAlerta")}
                        style={inputStyle}
                    >
                        <option value="">Todos</option>
                        <option value="SOLICITUD_PENDIENTE">Solicitud Pendiente</option>
                        <option value="AUDIENCIA_PENDIENTE_PUBLICACION">Audiencia Pendiente Publicación</option>
                    </select>
                </div>

                <div style={contenedorCampoStyle}>
                    <label style={labelStyle}>Rango de Fecha</label>
                    <select
                        value={filtros.rango}
                        onChange={manejarCambio("rango")}
                        style={inputStyle}
                    >
                        <option value="TODO">Todo</option>
                        <option value="SEMANA">Última semana</option>
                        <option value="MES">Último mes</option>
                        <option value="PERSONALIZADO">Personalizado</option>
                    </select>
                </div>

                {filtros.rango === "PERSONALIZADO" && (
                    <>
                        <div style={contenedorCampoStyle}>
                            <label style={labelStyle}>Fecha Desde</label>
                            <input
                                type="date"
                                value={filtros.fechaDesde}
                                onChange={manejarCambio("fechaDesde")}
                                style={inputStyle}
                            />
                        </div>

                        <div style={contenedorCampoStyle}>
                            <label style={labelStyle}>Fecha Hasta</label>
                            <input
                                type="date"
                                value={filtros.fechaHasta}
                                onChange={manejarCambio("fechaHasta")}
                                style={inputStyle}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}