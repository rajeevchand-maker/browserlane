import "dotenv/config";
import { resolve } from "path";

export interface BrowserlaneConfig {
  port: number;
  headless: boolean;
  jwtSecret: string;
  jwtIssuer: string;
  jwtAudience: string;
  artifactDir: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function loadConfig(): BrowserlaneConfig {
  return {
    port: Number.parseInt(process.env.PORT ?? "3100", 10),
    headless: process.env.HEADLESS !== "false",
    jwtSecret: requireEnv("BROWSERLANE_JWT_SECRET"),
    jwtIssuer: process.env.BROWSERLANE_JWT_ISSUER ?? "browserlane-local",
    jwtAudience: process.env.BROWSERLANE_JWT_AUDIENCE ?? "browserlane",
    artifactDir: resolve(process.cwd(), process.env.BROWSERLANE_ARTIFACT_DIR ?? "./artifacts/runs"),
  };
}
