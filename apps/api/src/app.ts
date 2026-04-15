import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { ErrorHandler } from "./shared/middleware/errorHandler.js";
import { setupSwagger } from "./shared/docs/swagger.js";

export class App {
  private app: Express;

  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupDocs();
    this.setupErrorHandling();
  }

  private setupMiddlewares(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(morgan("dev"));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes(): void {
    // em branco por enquanto - fase 2
  }

  private setupDocs(): void {
    setupSwagger(this.app);
  }

  private setupErrorHandling(): void {
    this.app.use(ErrorHandler.handle);
  }

  listen(port: number, callback?: () => void): void {
    this.app.listen(port, callback);
  }

  getExpressApp(): Express {
    return this.app;
  }
}
