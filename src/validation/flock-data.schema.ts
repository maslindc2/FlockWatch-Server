import { z } from "zod";

/**
 * Validates a value is a finite, non-NaN number.
 * Rejects Infinity, -Infinity, and NaN which JSON.parse can't produce
 * but which could arrive via crafted inputs.
 */
const finiteNumber = z.number();

const FlockCasesByStateSchema = z.object({
    state_abbreviation: z
        .string()
        .min(2)
        .max(2)
        .regex(/^[A-Z]{2}$/, "Must be a two-letter uppercase abbreviation"),
    state: z.string().min(1).max(100),
    backyard_flocks: finiteNumber.nonnegative(),
    commercial_flocks: finiteNumber.nonnegative(),
    birds_affected: finiteNumber.nonnegative(),
    total_flocks: finiteNumber.nonnegative(),
    latitude: finiteNumber.min(-90).max(90),
    longitude: finiteNumber.min(-180).max(180),
    last_reported_detection: z.coerce.date(),
});

const Last30DaysSchema = z.object({
    period_name: z.string().min(1).max(100),
    total_birds_affected: finiteNumber.nonnegative(),
    total_flocks_affected: finiteNumber.nonnegative(),
    total_backyard_flocks_affected: finiteNumber.nonnegative(),
    total_commercial_flocks_affected: finiteNumber.nonnegative(),
});

const SiteDetailsSchema = z.object({
    special_id: z.string().min(1).max(200),
    county: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    production_type: z.string().min(1).max(100),
    confirmed_diagnosis_date: z.coerce.date(),
    status: z.enum(["active", "released", "na"]),
    control_area_released_date: z.coerce.date().optional(),
    birds_affected: finiteNumber.nonnegative(),
});

const HistoricalSummarySchema = z.object({
    total_birds_affected_all_time: finiteNumber.nonnegative(),
    total_sites_all_time: finiteNumber.nonnegative(),
    total_active_sites: finiteNumber.nonnegative(),
    total_released_sites: finiteNumber.nonnegative(),
    total_na_sites: finiteNumber.nonnegative(),
    total_birds_active: finiteNumber.nonnegative(),
});

const StatusTransitionSummarySchema = z.object({
    sites_confirmed_last_30_days: finiteNumber.nonnegative(),
    sites_released_last_30_days: finiteNumber.nonnegative(),
    birds_affected_last_30_days: finiteNumber.nonnegative(),
});

/**
 * Top-level schema for the POST /data-update request body.
 *
 * - .strict() rejects any keys not declared in the schema, preventing
 *   prototype-pollution style payloads and unknown field injection.
 * - Arrays are capped at 200 entries each to limit processing cost.
 *   Raise the caps if your scraper legitimately sends more.
 */
export const FlockDataSchema = z
    .object({
        flock_cases_by_state: z.array(FlockCasesByStateSchema).max(50),
        period_summaries: z.array(Last30DaysSchema).max(1),
        site_details: z.array(SiteDetailsSchema).max(3_000),
        historical_summary: HistoricalSummarySchema,
        status_summary: StatusTransitionSummarySchema,
    })
    .strict();

export type FlockDataInput = z.infer<typeof FlockDataSchema>;
