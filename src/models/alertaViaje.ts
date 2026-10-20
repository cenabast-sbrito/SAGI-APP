export type TipoRangoViaje = "TODO" | "SEMANA" | "MES" | "PERSONALIZADO";

export interface FiltroAlertaViaje {
    nombreSujetoPasivo: string;
    destino?: string;
    origenDato?: "TODOS" | "LOBBY" | "GYDP" | "DISCORDANTE";
    rango: TipoRangoViaje;
    fechaDesde: string;
    fechaHasta: string;
}

export interface AlertaViaje {
    idViaje?: string | number;
    nombreSujetoPasivo: string;
    rut?: string;
    cargo?: string;
    correo?: string | null;
    destino: string;
    objetoViaje?: string;
    fechaInicio: string | null;
    fechaTermino: string | null;
    diasDiferencia?: number;
    estadoAlerta: "Coincidente" | "Pendiente Lobby" | "Pendiente GYDP" | "Discordante" | "Sin Declarar";
    colorAlerta: "Verde" | "Amarillo" | "Rojo" | "Naranjo" | "Azul";
    origen: "LOBBY" | "GYDP" | "CONSOLIDADO";
    observacion?: string;
}