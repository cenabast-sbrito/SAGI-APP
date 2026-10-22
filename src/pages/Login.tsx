import { useState, type FormEvent } from "react";
import { loginLdap } from "../api/auth.api";

interface LoginProps {
    onLoginSuccess: (token: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
    const [usuario, setUsuario] = useState("");
    const [clave, setClave] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setCargando(true);

        try {
            const data = await loginLdap({ usuario, clave });
            sessionStorage.setItem("token", data.token);
            onLoginSuccess(data.token);
        } catch (err: any) {
            const mensaje =
                err.response?.data?.message ||
                "Credenciales LDAP no válidas o error de conexión.";
            setError(mensaje);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "80vh"
        }}>
            <form
                onSubmit={handleSubmit}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    width: "320px",
                    padding: "24px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                }}
            >
                <h2 style={{ textAlign: "center", margin: 0 }}>Inicio de Sesión</h2>
                <span style={{ textAlign: "center", fontSize: "14px", color: "#666" }}>
                    Validación Directorio Activo / LDAP
                </span>

                {error && (
                    <div style={{
                        padding: "8px 12px",
                        backgroundColor: "#ffebee",
                        color: "#c62828",
                        borderRadius: "4px",
                        fontSize: "14px"
                    }}>
                        {error}
                    </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label htmlFor="usuario" style={{ fontSize: "14px", fontWeight: "bold" }}>
                        Usuario
                    </label>
                    <input
                        id="usuario"
                        type="text"
                        autoComplete="username"
                        required
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                        placeholder="Ej. jperez"
                        style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label htmlFor="clave" style={{ fontSize: "14px", fontWeight: "bold" }}>
                        Contraseña
                    </label>
                    <input
                        id="clave"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={clave}
                        onChange={(e) => setClave(e.target.value)}
                        placeholder="••••••••"
                        style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={cargando}
                    style={{
                        padding: "10px",
                        backgroundColor: cargando ? "#aaa" : "#0066cc",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: cargando ? "not-allowed" : "pointer",
                        fontWeight: "bold"
                    }}
                >
                    {cargando ? "Validando en LDAP..." : "Ingresar"}
                </button>
            </form>
        </div>
    );
}

export const apiConfig = {
    baseURL: "https://apiweb-dev.cenabast.cl/sagi-api/api/sagi/v1",
    servers: [
        {
            url: "https://apiweb-dev.cenabast.cl/sagi-api/api/sagi/v1",
            description: "Servidor API SAGI Dev"
        }
    ]
};