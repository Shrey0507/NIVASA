import { supabaseAdmin } from "../config/supabase.js";
import { AppError } from "../middleware/errors.js";

export function dbRequired() { if (!supabaseAdmin) throw new AppError(503, "Database is not configured", "DATABASE_UNAVAILABLE"); return supabaseAdmin; }
export function throwDb(error) { if (error) { const e = new AppError(500, "Database operation failed", "DATABASE_ERROR"); e.cause = error; throw e; } }
export function pageResult(data, count, pagination) { return { data: data || [], pagination: { page: pagination.page, limit: pagination.limit, total: count ?? data?.length ?? 0, totalPages: Math.ceil((count ?? data?.length ?? 0) / pagination.limit) } }; }
export const cleanPatch = (input, allowed) => Object.fromEntries(Object.entries(input).filter(([key, value]) => allowed.includes(key) && value !== undefined));
