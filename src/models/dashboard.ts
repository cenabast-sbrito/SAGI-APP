export type RangoDashboard = "TODO" | "SEMANA" | "MES" | "PERSONALIZADO";

export interface DashboardFiltros {
    rango?: RangoDashboard;
    fechaDesde?: string;
    fechaHasta?: string;
}

export interface DashboardKPIs {
    TotalAlertas: number;
    SolicitudesPendientes: number;
    AudienciasPendientesPublicacion: number;
    AlertasCriticas: number;
}

export interface AlertaPorColor {
    EstadoPlazoRespuesta: string;
    Cantidad: number;
}

export interface AlertaPorTipo {
    TipoAlerta: string;
    Cantidad: number;
}

export interface AlertaPorFuncionario {
    IdSujetoPasivo: number | string;
    NombreSujetoPasivo: string;
    TotalAlertas: number;
}

export interface AlertaCriticaPorFuncionario {
    IdSujetoPasivo: number | string;
    NombreSujetoPasivo: string;
    TotalCriticas: number;
}

export interface AlertaPorEstado {
    Estado: string;
    Cantidad: number;
}

export interface TopAlertaItem {
    Folio: string;
    NombreSujetoPasivo: string;
    Estado: string;
    TipoAlerta: string;
    DiasEnEsperaHabiles: number;
    EstadoPlazoRespuesta: string;
    NivelAlerta: number;
}

export interface CumplimientoDashboard {
    TotalAlertas: number;
    TotalIncumplidas: number;
    PorcentajeIncumplimiento: number;
}

export interface DashboardData {
    kpis: DashboardKPIs;
    alertasPorColor: AlertaPorColor[];
    alertasPorTipo: AlertaPorTipo[];
    alertasPorFuncionario: AlertaPorFuncionario[];
    alertasCriticasPorFuncionario: AlertaCriticaPorFuncionario[];
    alertasPorEstado: AlertaPorEstado[];
    topAlertas: TopAlertaItem[];
    cumplimiento: CumplimientoDashboard;
}