export interface Alerta {
    Folio: string;
    FechaIngreso: string | null;
    FechaRespuesta: string | null;
    FechaAgendada: string | null;
    Estado: string;
    NombreSujetoPasivo: string | number;
    NombreSujetoPasivo: string;
    Correo: string | null;
    TipoAlerta: string;
    PendientePublicacion: boolean;
    DiasEnEsperaHabiles: number;
    DiasEnEspera: number;
    EstadoPlazoRespuesta: string;
    NivelAlerta: number;
    ContenidoEmail: string;
}