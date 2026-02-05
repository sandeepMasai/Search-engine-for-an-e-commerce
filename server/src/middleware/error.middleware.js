export function errorHandler(err, req, res, _next) {
  // Basic centralized error handler
  console.error('[ERROR]', err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
}

export function notFoundHandler(req, res, _next) {
  res.status(404).json({ error: 'Not Found' });
}
