export function requestLogger(req, res, next) {
  const started = Date.now();
  res.on("finish", () => console.log(JSON.stringify({ event: "http_request", method: req.method, path: req.originalUrl, status: res.statusCode, durationMs: Date.now() - started, requestId: req.id })));
  next();
}
