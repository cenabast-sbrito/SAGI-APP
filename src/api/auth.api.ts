import api from "./axios";

export interface LoginCredentials {
    usuario: string;
    clave: string;
}

export interface AuthResponse {
    token: string;
    mensaje?: string;
    [key: string]: any;
}

export async function loginLdap(credenciales: LoginCredentials): Promise<AuthResponse> {
    // Mapeo de usuario/clave a user/pass según Swagger
    const response = await api.post<AuthResponse>("/ldap/login", {
        "user": credenciales.usuario,
        "pass": credenciales.clave
    });
    return response.data;
}