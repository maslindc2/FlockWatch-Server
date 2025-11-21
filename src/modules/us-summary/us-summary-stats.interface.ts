interface AllTimeTotals {
    total_states_affected: number; // Number of states with infections
    total_birds_affected: number; // Total birds affected
    total_flocks_affected: number; // Total flocks affected
    total_backyard_flocks_affected: number; // Backyard flocks affected
    total_commercial_flocks_affected: number; // Commercial flocks affected
}

interface PeriodSummary {
    period_name: string;
    total_birds_affected: number; // Total birds affected for that period
    total_flocks_affected: number; // Total flocks affected for that period
    total_backyard_flocks_affected: number; // Backyard flocks affected for that period
    total_commercial_flocks_affected: number; // Commercial flocks affected for that period
}

interface USSummaryStats {
    key: string;
    all_time_totals: AllTimeTotals;
    period_summaries: PeriodSummary[];
}

export { AllTimeTotals, PeriodSummary, USSummaryStats };
