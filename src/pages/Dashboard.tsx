import { useEffect, useState } from "react";
import { obtenerDashboard } from "../api/dashboard.api";
import type { Dashboard as DashboardModel } from "../models/dashboard";

export default function Dashboard() {

    const [dashboard, setDashboard] =
        useState<DashboardModel | null>(null);

    useEffect(() => {

        obtenerDashboard()
            .then(setDashboard)
            .catch(console.error);

    }, []);

    if (!dashboard) {

        return (
            <h2>Cargando...</h2>
        );

    }

    return (

        <div>

            <h1>SAGI</h1>

            <h2>Dashboard</h2>

            <div>

                <p>
                    Funcionarios:
                    {dashboard.Funcionarios}
                </p>

                <p>
                    Solicitudes:
                    {dashboard.Solicitudes}
                </p>

                <p>
                    Audiencias:
                    {dashboard.Audiencias}
                </p>

                <p>
                    Pendientes Publicación:
                    {dashboard.PendientesPublicacion}
                </p>

                <p>
                    Alertas Activas:
                    {dashboard.AlertasActivas}
                </p>

            </div>

        </div>

    );

}