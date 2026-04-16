import type { Express } from "express";
import { apiReference } from "@scalar/express-api-reference";
import { openApiDocument } from "./openapi.js";

export function setupDocs(app: Express): void {
  app.get("/docs/openapi.json", (_req, res) => {
    res.json(openApiDocument);
  });

  app.use(
    "/docs",
    apiReference({
      url: "/docs/openapi.json",
    }),
  );
}