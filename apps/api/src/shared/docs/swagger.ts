import type { Express } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Memorium API",
      version: "1.0.0",
      description:
        "API para upload e organização automática de fotos e vídeos.",
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Servidor de desenvolvimento",
      },
    ],
  },
  apis: ["./src/modules/**/*.ts"],
};

export function setupSwagger(app: Express): void {
  const specs = swaggerJsdoc(swaggerOptions);
  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      customSiteTitle: "Memorium API Docs",
      customCss: ".swagger-ui .topbar { display: none }",
    }),
  );
}
