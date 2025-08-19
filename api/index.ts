import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { initializeDatabase } from "../server/db-init";
import type { VercelRequest, VercelResponse } from '@vercel/node';

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Initialize database and routes
(async () => {
  await initializeDatabase();
  await registerRoutes(app);
})();

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

export default app;