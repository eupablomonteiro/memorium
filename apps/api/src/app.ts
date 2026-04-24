import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { ErrorHandler } from "./shared/middleware/errorHandler.js";
import { setupDocs } from "./shared/docs/scalar.js";

import configRoutes from "./modules/config/config.routes.js";
import systemRoutes from "./modules/system/system.routes.js";
import uploadRoutes from "./modules/upload/upload.routes.js";

const corsOptions = {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://cdn.jsdelivr.net", "http://*", "https://*"],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net", "data:"],
    },
  },
  crossOriginEmbedderPolicy: false,
};

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
    this.app.use(helmet(helmetConfig));
    this.app.use(cors(corsOptions));
    this.app.use(morgan("dev"));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes(): void {
    this.app.use("/api", configRoutes);
    this.app.use("/api", systemRoutes);
    this.app.use("/api", uploadRoutes);
  }

  private setupDocs(): void {
    setupDocs(this.app);
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