export interface ResumenAlerta {
    idSujetoPasivo: number;
    nombreSujetoPasivo: string;
    correo: string | null;
    cantidadAlertas: number;
    solicitudesPendientes: number;
    audienciasPendientesPublicacion: number;
    nivelAlertaMaximo: number;
    foliosPendientes: string;
}