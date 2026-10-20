import api from "./axios";

export interface Funcionario {
    idSujetoPasivo?: number | string;
    nombreSujetoPasivo: string;
    cargo?: string;
    correo: string | null;
    activo?: boolean;
}

export interface ActualizarCorreoPayload {
    nombreSujetoPasivo: string;
    correo: string;
}

// Obtener lista de funcionarios
export async function obtenerFuncionariosApi(): Promise<Funcionario[]> {
    try {
        const response = await api.get<any>("/funcionarios");
        const lista = Array.isArray(response.data)
            ? response.data
            : response.data?.data || response.data?.funcionarios || [];

        return lista.map((item: any) => ({
            idSujetoPasivo: item.IdSujetoPasivo || item.idSujetoPasivo || "",
            nombreSujetoPasivo: String(item.NombreSujetoPasivo || item.nombreSujetoPasivo || "").trim(),
            cargo: item.Cargo || item.cargo || "",
            correo: item.Correo || item.correo || null,
            activo: item.Activo !== undefined ? item.Activo : true
        }));
    } catch (error: any) {
        console.warn("⚠️ GET /funcionarios falló. Probando fallback GET /alertas/resumen...", error);

        try {
            const resResumen = await api.get<any>("/alertas/resumen");
            const lista = Array.isArray(resResumen.data)
                ? resResumen.data
                : resResumen.data?.data || [];

            return lista.map((item: any) => ({
                idSujetoPasivo: item.IdSujetoPasivo || item.idSujetoPasivo || "",
                nombreSujetoPasivo: String(item.NombreSujetoPasivo || item.nombreSujetoPasivo || "").trim(),
                cargo: item.Cargo || item.cargo || "",
                correo: item.Correo || item.correo || null,
                activo: true
            }));
        } catch {
            return [];
        }
    }
}

// PATCH /funcionarios/correo para actualizar el correo
export async function actualizarCorreoFuncionarioApi(payload: ActualizarCorreoPayload): Promise<any> {
    const response = await api.patch("/funcionarios/correo", {
        nombreSujetoPasivo: payload.nombreSujetoPasivo.trim(),
        correo: payload.correo.trim()
    });
    return response.data;
}