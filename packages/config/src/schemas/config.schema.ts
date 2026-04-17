import { z } from "zod";
export const appConfigSchema = z
  .object({
    storagePath: z
      .string()
      .trim()
      .min(1, "O caminho de armazenamento é obrigatório"),
    port: z
      .number()
      .int()
      .min(1024, "A porta deve ser maior que 1023")
      .max(65535, "A porta deve ser menor que 65536")
      .default(3001),
  })
  .strict();

export type AppConfig = z.infer<typeof appConfigSchema>;
