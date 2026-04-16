import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { appConfigSchema } from "@memorium/config";

extendZodWithOpenApi(z);

export const ConfigResponseSchema = z
  .object({
    storagePath: z.string(),
    port: z.number(),
  })
  .openapi("ConfigResponse");

export const DiskInfoSchema = z
  .object({
    name: z.string().openapi({ example: "C:" }),
    path: z.string().openapi({ example: "C:\\" }),
    size: z.number().openapi({ example: 500000000000 }),
    used: z.number().openapi({ example: 250000000000 }),
    available: z.number().openapi({ example: 250000000000 }),
    usagePercent: z.number().openapi({ example: 50 }),
  })
  .openapi("DiskInfo");

export const openApiDocument = {
  openapi: "3.0.0",
  info: {
    title: "Memorium API",
    version: "1.0.0",
    description: "API para upload e organização automática de fotos e vídeos.",
  },
  servers: [
    {
      url: "http://localhost:3001",
      description: "Servidor de desenvolvimento",
    },
  ],
  paths: {} as Record<string, unknown>,
  components: {
    schemas: {
      AppConfig: appConfigSchema as z.ZodType<unknown>,
      ConfigResponse: ConfigResponseSchema,
      DiskInfo: DiskInfoSchema,
    },
  },
};
