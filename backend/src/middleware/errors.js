export class AppError extends Error {
  constructor(status, message, code = "APP_ERROR", details = undefined) {
    super(message); this.status = status; this.code = code; this.details = details;
  }
}

export function notFound(req, res) {
  res.status(404).json({ error: { code: "NOT_FOUND", message: `Route ${req.method} ${req.originalUrl} not found` } });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const status = Number(err.status) || 500;
  const payload = { error: { code: err.code || (status === 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR"), message: status >= 500 ? "An unexpected error occurred" : err.message } };
  if (err.details && status < 500) payload.error.details = err.details;
  if (process.env.NODE_ENV !== "production") payload.error.debug = err.message;
  if (status >= 500) console.error(JSON.stringify({ event: "request_error", method: req.method, path: req.originalUrl, message: err.message, stack: err.stack }));
  res.status(status).json(payload);
}
