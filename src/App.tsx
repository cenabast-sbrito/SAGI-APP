import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Alertas from "./pages/Alertas";
import CargaGeneral from "./pages/CargaGeneral";
import FuncionariosCorreo from "./pages/FuncionariosCorreo";
import Sidebar from "./components/Sidebar";
import type { Tab } from "./components/Sidebar";

export default function App() {
    const [token, setToken] = useState<string | null>(null);
    const [tabActual, setTabActual] = useState<Tab>("dashboard");

    useEffect(() => {
        const tokenGuardado = sessionStorage.getItem("token");
        if (tokenGuardado) {
            setToken(tokenGuardado);
        }
    }, []);

    const handleLoginSuccess = (nuevoToken: string) => {
        setToken(nuevoToken);
    };

    const handleCerrarSesion = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("usuario");
        setToken(null);
    };

    // Si no hay token autenticado, muestra la pantalla de Login
    if (!token) {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f4f6f9", fontFamily: "Segoe UI, sans-serif" }}>
            {/* Menú lateral moderno */}
            <Sidebar
                tabActual={tabActual}
                onSelectTab={setTabActual}
                onCerrarSesion={handleCerrarSesion}
            />

            {/* Contenedor del contenido principal */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowY: "auto" }}>
                {/* Barra superior institucional compacta */}
                <header
                    style={{
                        backgroundColor: "#ffffff",
                        padding: "14px 28px",
                        borderBottom: "1px solid #eef0f3",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "18px", fontWeight: 700, color: "#1b2a4a" }}>SAGI</span>
                        <span style={{ fontSize: "13px", color: "#6b7280" }}>| Sistema de Alertas de Gestión Institucional</span>
                    </div>
                </header>

                <main style={{ flex: 1 }}>
                    {tabActual === "dashboard" && <Dashboard />}
                    {tabActual === "alertas" && <Alertas />}
                    {tabActual === "funcionarios" && <FuncionariosCorreo />}
                    {tabActual === "carga-general" && <CargaGeneral />}
                </main>
            </div>
        </div>
    );
}

