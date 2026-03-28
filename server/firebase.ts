import { onRequest } from "firebase-functions/v2/https";
import { createApp } from "./app";
import type { Express } from "express";

let appInstance: Express | null = null;

async function getApp(): Promise<Express> {
  if (!appInstance) {
    appInstance = await createApp();
  }
  return appInstance;
}

export const api = onRequest(
  {
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 60,
    cors: true,
  },
  async (req, res) => {
    const app = await getApp();
    app(req as any, res as any);
  }
);
