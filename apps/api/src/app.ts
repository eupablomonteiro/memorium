import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createServer, type Server } from "http";
import type { Socket } from "net";

import { ErrorHandler } from "./shared/middleware/errorHandler.js";
import { setupDocs } from "./shared/docs/scalar.js";
import { wsManager } from "./shared/websocket/wsManager.js";

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
      connectSrc: [
        "'self'",
        "https://cdn.jsdelivr.net",
        "http://*",
        "https://*",
      ],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net", "data:"],
    },
  },
  crossOriginEmbedderPolicy: false,
};

export class App {
  private app: Express;
  private server: Server | null = null;

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
    this.app.use("/api/upload", uploadRoutes);
  }

  private setupDocs(): void {
    setupDocs(this.app);
  }

  private setupErrorHandling(): void {
    this.app.use(ErrorHandler.handle);
  }

  listen(port: number, callback?: () => void): void {
    this.server = createServer(this.app);

    // Inicializa WebSocket
    wsManager.initialize(this.server);

    // Trata upgrade para WebSocket
    this.server.on("upgrade", (request, socket, head) => {
      const url = new URL(request.url || "", `http://${request.headers.host}`);
      if (url.pathname === "/ws") {
        wsManager.handleUpgrade(request, socket as Socket, head as Buffer);
      } else {
        socket.destroy();
      }
    });

    this.server.listen(port, callback);
    console.log(`WebSocket disponível em ws://localhost:${port}/ws`);
  }

  getExpressApp(): Express {
    return this.app;
  }
}
