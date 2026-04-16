import { Router } from "express";
import { ConfigController } from "./config.controller.js";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { appConfigSchema } from "@memorium/config";
import { openApiDocument } from "../../shared/docs/openapi.js";

extendZodWithOpenApi(z);

const router = Router();
const controller = new ConfigController();

openApiDocument.paths["/api/config"] = {
  get: {
    summary: "Retorna a configuração atual do Memorium",
    tags: ["Config"],
    responses: {
      200: {
        description: "Configuração atual",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ConfigResponse",
            },
          },
        },
      },
    },
  },

  post: {
    summary: "Salva uma nova configuração",
    tags: ["Config"],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/AppConfig",
          },
        },
      },
    },
    responses: {
      200: {
        description: "Configuração salva com sucesso",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ConfigResponse",
            },
          },
        },
      },
    },
  },
};

router.get("/config", controller.getConfig);
router.post("/config", controller.setConfig);

export default router;
