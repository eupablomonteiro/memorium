import { Router } from "express";
import { SystemController } from "./system.controller.js";
import { openApiDocument } from "../../shared/docs/openapi.js";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

const router = Router();
const controller = new SystemController();

openApiDocument.paths["/api/system/disks"] = {
  get: {
    summary: "Lista os discos disponíveis no sistema",
    tags: ["System"],
    responses: {
      200: {
        description: "Lista de discos",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                $ref: "#/components/schemas/DiskInfo",
              },
            },
          },
        },
      },
    },
  },
};

router.get("/system/disks", controller.getDisks);

export default router;
