import { AppError } from "./errors.js";

export const rateLimit = ({ windowMs = 60_000, max = 120 } = {}) => {
  const hits = new Map();
  return (req, res, next) => {
    const key = req.ip || "unknown"; const now = Date.now(); const item = hits.get(key);
    if (!item || now - item.start >= windowMs) hits.set(key, { start: now, count: 1 });
    else { item.count += 1; if (item.count > max) return next(new AppError(429, "Too many requests", "RATE_LIMITED")); }
    next();
  };
};

export function pagination(req, res, next) {
  const page = Math.max(1, Math.min(100000, Number.parseInt(req.query.page, 10) || 1));
  const limit = Math.max(1, Math.min(100, Number.parseInt(req.query.limit, 10) || 20));
  req.pagination = { page, limit, from: (page - 1) * limit, to: page * limit - 1 };
  next();
}

export function body(required = []) {
  return (req, res, next) => {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) return next(new AppError(400, "JSON object body required", "INVALID_BODY"));
    const missing = required.filter((key) => req.body[key] === undefined || req.body[key] === null || req.body[key] === "");
    if (missing.length) return next(new AppError(400, `Missing required fields: ${missing.join(", ")}`, "VALIDATION_ERROR", { missing }));
    next();
  };
}

export function asId(value) {
  if (!/^[0-9a-fA-F-]{8,}$/.test(String(value))) throw new AppError(400, "Invalid resource id", "INVALID_ID");
  return value;
}
