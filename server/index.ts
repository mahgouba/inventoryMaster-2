import { createServer } from "http";
import { createApp, log } from "./app";
import { setupVite, serveStatic } from "./vite";

(async () => {
  const app = await createApp();
  const server = createServer(app);

  if (process.env.NODE_ENV !== "production") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = process.env.PORT || 5000;
  server.listen({ port, host: "0.0.0.0" }, () => {
    log(`serving on port ${port}`);
  });
})();
