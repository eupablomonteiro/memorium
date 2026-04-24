import fs from "fs";
import path from "path";
import { cwd } from "process";

export interface AppConfig {
  storagePath: string;
  port: number;
}

const DEFAULT_CONFIG: AppConfig = {
  storagePath: "C:\\Memorium",
  port: 3001,
};

const CONFIG_FILE = path.resolve(cwd(), "memorium.config.json");

export class ConfigService {
  private static instance: ConfigService;
  private config: AppConfig;

  private constructor() {
    this.config = DEFAULT_CONFIG;
  }

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  load(): AppConfig {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        this.config = { ...DEFAULT_CONFIG, ...parsed };
      } else {
        this.save(DEFAULT_CONFIG);
      }
    } catch (error) {
      console.warn("Erro ao ler config, usando padrão: ", error);
      this.config = DEFAULT_CONFIG;
    }

    return this.config;
  }

  save(data: AppConfig): AppConfig {
    this.config = data;
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2), "utf-8");
    return data;
  }

  get(): AppConfig {
    return this.config;
  }
}
