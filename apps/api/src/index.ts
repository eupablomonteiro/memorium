import { App } from "./app.js";
import { ConfigService } from "./modules/config/config.service.js";

async function bootstrap(): Promise<void> {
  const configService = ConfigService.getInstance();
  const config = configService.load();

  const app = new App();
  const port = config.port;

  app.listen(port, () => {
    console.log("---");
    console.log("Memorium API");
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log(`Docs em http://localhost:${port}/docs`);
    console.log(`OpenAPI em http://localhost:${port}/docs/openapi.json`);
    console.log(`Storage: ${config.storagePath}`);
    console.log("---");
  });
}

bootstrap().catch((error) => {
  console.error("Falha ao iniciar o servidor.", error);
  process.exit(1);
});
