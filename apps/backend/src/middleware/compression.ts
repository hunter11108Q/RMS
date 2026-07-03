import compression from 'compression';

export const compressionMiddleware = compression({
  level: 6, // balanced level
  threshold: 1024, // only compress responses above 1KB
});

export default compressionMiddleware;
