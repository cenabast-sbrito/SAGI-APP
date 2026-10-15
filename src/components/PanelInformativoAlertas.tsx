    import { useState } from "react";

interface ReglaAlerta {
    color: string;
    nombreColor: string;
    descripcion: string;
    resumenCorto: string;
}

const REGLAS_ALERTAS: ReglaAlerta[] = [
    {
        color: "#2e7d32",
        nombreColor: "Verde",
        resumenCorto: "1d (Vigente)",
        descripcion: "Solicitudes con 1 día en espera de respuesta (vigente)"
    },
    {
        color: "#fbc02d",
        nombreColor: "Amarillo",
        resumenCorto: "2d (Vigente)",
        descripcion: "Solicitudes con 2 días en espera de respuesta (vigente)"
    },
    {
        color: "#d32f2f",
        nombreColor: "Rojo",
        resumenCorto: "3d (Último día)",
        descripcion: "Solicitudes con 3 días en espera de respuesta (último día para pronunciarse)"
    },
    {
        color: "#1976d2",
        nombreColor: "Azul",
        resumenCorto: "≥4d (Vencido)",
        descripcion: "Solicitudes con 4 o más días en espera de respuesta (vencido)"
    },
    {
        color: "#f57c00",
        nombreColor: "Naranjo",
        resumenCorto: "Pendiente publ.",
        descripcion: "Registro obligatorio de audiencia realizada (pendiente de publicación)"
    },
    {
        color: "#7b1fa2",
        nombreColor: "Violeta",
        resumenCorto: "Incumplimiento",
        descripcion: "Incumplimiento en registro de audiencia (plazo vencido)"
    },
    {
        color: "#5c0000",
        nombreColor: "Rojo Oscuro",
        resumenCorto: ">8d hábiles",
        descripcion: "Verificación de registro en plataforma (más de 8 días hábiles)"
    }
];

export default function PanelInformativoAlertas() {
    const [expandido, setExpandido] = useState(false);

    return (
        <div
            style={{
                backgroundColor: "#ffffff",
                borderRadius: "10px",
                border: "1px solid #e9ecef",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                padding: expandido ? "18px 24px" : "14px 20px",
                marginBottom: "24px",
                transition: "all 0.2s ease"
            }}
        >
            {/* Cabecera interactiva para colapsar/expandir */}
            <div
                onClick={() => setExpandido(!expandido)}
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
                            Alertas Audiencias
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
                            {expandido ? "Click para contraer" : "Click para expandir"}
                        </span>
                    </div>
                    {expandido && (
                        <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#6c757d" }}>
                            Criterios de clasificación y estado de solicitudes por días de espera
                        </p>
                    )}
                </div>

                <button
                    type="button"
                    aria-label={expandido ? "Contraer panel" : "Expandir panel"}
                    style={{
                        background: "none",
                        border: "1px solid #ced4da",
                        borderRadius: "6px",
                        padding: "4px 10px",
                        fontSize: "12px",
                        cursor: "pointer",
                        color: "#495057",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                    }}
                >
                    <span>{expandido ? "▲ Ocultar" : "▼ Ver detalle"}</span>
                </button>
            </div>

            {/* Vista Contraída: Barra de colores con resumen horizontal */}
            {!expandido && (
                <div style={{ marginTop: "12px" }}>
                    {/* Línea degradada/segmentada de colores */}
                    <div
                        style={{
                            display: "flex",
                            height: "6px",
                            borderRadius: "4px",
                            overflow: "hidden",
                            marginBottom: "10px"
                        }}
                    >
                        {REGLAS_ALERTAS.map((item) => (
                            <div
                                key={item.nombreColor}
                                title={`${item.nombreColor}: ${item.descripcion}`}
                                style={{
                                    flex: 1,
                                    backgroundColor: item.color
                                }}
                            />
                        ))}
                    </div>

                    {/* Resumen de píldoras por color */}
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px 14px",
                            alignItems: "center"
                        }}
                    >
                        {REGLAS_ALERTAS.map((item) => (
                            <div
                                key={item.nombreColor}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    fontSize: "12px",
                                    color: "#495057"
                                }}
                            >
                                <span
                                    style={{
                                        width: "10px",
                                        height: "10px",
                                        borderRadius: "50%",
                                        backgroundColor: item.color,
                                        display: "inline-block"
                                    }}
                                />
                                <strong style={{ color: item.color }}>{item.nombreColor}:</strong>
                                <span>{item.resumenCorto}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Vista Expandida: Grilla detallada con descripción completa */}
            {expandido && (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                        gap: "12px 24px",
                        marginTop: "16px",
                        paddingTop: "14px",
                        borderTop: "1px solid #f1f3f5"
                    }}
                >
                    {REGLAS_ALERTAS.map((item) => (
                        <div
                            key={item.nombreColor}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                fontSize: "11px", lineHeight: 1.1 ,
                                color: "#333"
                            }}
                        >
                            <span
                                aria-label={item.nombreColor}
                                style={{
                                    width: "14px",
                                    height: "14px",
                                    borderRadius: "50%",
                                    backgroundColor: item.color,
                                    flexShrink: 0,
                                    boxShadow: "0 0 0 2px rgba(0,0,0,0.06)"
                                }}
                            />
                            <span>
                                <strong style={{ color: item.color, marginRight: "4px" }}>
                                    {item.nombreColor}:
                                </strong>
                                {item.descripcion}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}