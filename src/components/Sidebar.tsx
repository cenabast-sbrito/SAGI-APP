import { useState, useEffect } from "react";

export type Tab = "dashboard" | "carga-general" | "alertas" | "funcionarios";

interface Props {
    tabActual: Tab;
    onSelectTab: (tab: Tab) => void;
    onCerrarSesion: () => void;
}

function obtenerDatosUsuario(): { nombre: string; rol: string; iniciales: string } {
    const usuarioStorage = sessionStorage.getItem("usuario");
    const token = sessionStorage.getItem("token");

    let nombre = usuarioStorage || "Usuario SAGI";
    let rol = "OPERADOR LOBBY";

    if (token) {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            nombre = payload.nombre || payload.usuario || payload.user || payload.username || nombre;
            if (payload.roles && Array.isArray(payload.roles)) {
                rol = payload.roles[0] || rol;
            } else if (payload.rol) {
                rol = payload.rol;
            }
        } catch {
            // fallback a valores por defecto
        }
    }

    const iniciales = nombre
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(p => p[0].toUpperCase())
        .join("") || "US";

    return { nombre, rol, iniciales };
}

export default function Sidebar({ tabActual, onSelectTab, onCerrarSesion }: Props) {
    const [colapsado, setColapsado] = useState(false);
    const [hoverItem, setHoverItem] = useState<string | null>(null);
    const [usuario, setUsuario] = useState({ nombre: "Usuario SAGI", rol: "OPERADOR", iniciales: "US" });

    useEffect(() => {
        setUsuario(obtenerDatosUsuario());
    }, []);

    const menuItems = [
        {
            id: "dashboard" as Tab,
            titulo: "Dashboard",
            icono: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            )
        },
        {
            id: "alertas" as Tab,
            titulo: "Alertas y Notificaciones",
            icono: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
            )
        },
        {
            id: "funcionarios" as Tab,
            titulo: "Gestión de Funcionarios",
            icono: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            )
        },
        {
            id: "carga-general" as Tab,
            titulo: "Carga de Planillas",
            icono: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
            )
        }
    ];

    return (
        <aside
            style={{
                width: colapsado ? "76px" : "260px",
                minWidth: colapsado ? "76px" : "260px",
                height: "100vh",
                backgroundColor: "#ffffff",
                borderRight: "1px solid #eef0f3",
                boxShadow: "2px 0 12px rgba(0, 0, 0, 0.03)",
                display: "flex",
                flexDirection: "column",
                position: "sticky",
                top: 0,
                left: 0,
                transition: "width 0.25s ease, min-width 0.25s ease",
                zIndex: 100,
                userSelect: "none"
            }}
        >
            <button
                type="button"
                onClick={() => setColapsado(!colapsado)}
                title={colapsado ? "Expandir menú" : "Colapsar menú"}
                style={{
                    position: "absolute",
                    top: "28px",
                    right: "-13px",
                    width: "26px",
                    height: "26px",
                    borderRadius: "50%",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#6b7280",
                    zIndex: 101,
                    transition: "transform 0.2s ease, background-color 0.2s"
                }}
            >
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ transform: colapsado ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}
                >
                    <polyline points="15 18 9 12 15 6" />
                </svg>
            </button>

            <div
                style={{
                    padding: colapsado ? "20px 12px" : "20px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    borderBottom: "1px solid #f3f4f6"
                }}
            >
                <div
                    style={{
                        width: "42px",
                        height: "42px",
                        minWidth: "42px",
                        borderRadius: "50%",
                        backgroundColor: "#ffd8de",
                        color: "#c2185b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "14px",
                        boxShadow: "0 2px 6px rgba(194, 24, 91, 0.15)"
                    }}
                >
                    {usuario.iniciales}
                </div>

                {!colapsado && (
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <div
                            style={{
                                fontSize: "10px",
                                fontWeight: 700,
                                color: "#9ca3af",
                                letterSpacing: "0.6px",
                                textTransform: "uppercase"
                            }}
                        >
                            {usuario.rol}
                        </div>
                        <div
                            style={{
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "#1f2937",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                            }}
                            title={usuario.nombre}
                        >
                            {usuario.nombre}
                        </div>
                    </div>
                )}
            </div>

            <div style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                    <div
                        style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#9ca3af",
                            letterSpacing: "0.8px",
                            padding: colapsado ? "0 0 10px 0" : "0 10px 10px 10px",
                            textAlign: colapsado ? "center" : "left",
                            textTransform: "uppercase"
                        }}
                    >
                        {colapsado ? "•" : "MAIN"}
                    </div>

                    <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {menuItems.map((item) => {
                            const activo = tabActual === item.id;
                            const isHover = hoverItem === item.id;

                            return (
                                <div
                                    key={item.id}
                                    style={{ position: "relative" }}
                                    onMouseEnter={() => setHoverItem(item.id)}
                                    onMouseLeave={() => setHoverItem(null)}
                                >
                                    <button
                                        type="button"
                                        onClick={() => onSelectTab(item.id)}
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: colapsado ? "center" : "flex-start",
                                            gap: "12px",
                                            padding: colapsado ? "12px 0" : "10px 14px",
                                            borderRadius: "10px",
                                            border: "none",
                                            cursor: "pointer",
                                            backgroundColor: activo ? "#f3f4f6" : isHover ? "#f9fafb" : "transparent",
                                            color: activo ? "#111827" : "#4b5563",
                                            fontWeight: activo ? 600 : 500,
                                            fontSize: "13.5px",
                                            transition: "all 0.15s ease",
                                            outline: "none"
                                        }}
                                    >
                                        <span style={{ color: activo ? "#111827" : "#6b7280", display: "flex", alignItems: "center" }}>
                                            {item.icono}
                                        </span>
                                        {!colapsado && <span>{item.titulo}</span>}
                                    </button>

                                    {colapsado && isHover && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                left: "calc(100% + 12px)",
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                backgroundColor: "#111827",
                                                color: "#ffffff",
                                                padding: "6px 12px",
                                                borderRadius: "6px",
                                                fontSize: "12px",
                                                fontWeight: 500,
                                                whiteSpace: "nowrap",
                                                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                                zIndex: 1000,
                                                pointerEvents: "none"
                                            }}
                                        >
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    left: "-4px",
                                                    top: "50%",
                                                    transform: "translateY(-50%)",
                                                    width: 0,
                                                    height: 0,
                                                    borderTop: "4px solid transparent",
                                                    borderBottom: "4px solid transparent",
                                                    borderRight: "4px solid #111827"
                                                }}
                                            />
                                            {item.titulo}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>
                </div>
            </div>

            <div style={{ padding: "16px 12px", borderTop: "1px solid #f3f4f6" }}>
                <div
                    style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#9ca3af",
                        letterSpacing: "0.8px",
                        padding: colapsado ? "0 0 10px 0" : "0 10px 10px 10px",
                        textAlign: colapsado ? "center" : "left",
                        textTransform: "uppercase"
                    }}
                >
                    {colapsado ? "•" : "SETTINGS"}
                </div>

                <div
                    style={{ position: "relative" }}
                    onMouseEnter={() => setHoverItem("cerrar-sesion")}
                    onMouseLeave={() => setHoverItem(null)}
                >
                    <button
                        type="button"
                        onClick={onCerrarSesion}
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: colapsado ? "center" : "flex-start",
                            gap: "12px",
                            padding: colapsado ? "12px 0" : "10px 14px",
                            borderRadius: "10px",
                            border: "none",
                            cursor: "pointer",
                            backgroundColor: hoverItem === "cerrar-sesion" ? "#fee2e2" : "transparent",
                            color: "#dc2626",
                            fontWeight: 500,
                            fontSize: "13.5px",
                            transition: "all 0.15s ease",
                            outline: "none"
                        }}
                    >
                        <span style={{ display: "flex", alignItems: "center" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </span>
                        {!colapsado && <span>Cerrar Sesión</span>}
                    </button>
                </div>
            </div>
        </aside>
    );
}