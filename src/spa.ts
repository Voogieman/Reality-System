import { existsSync } from "node:fs";
import { join } from "node:path";
import type { NestExpressApplication } from "@nestjs/platform-express";
import type { NextFunction, Request, Response } from "express";

function resolveFrontendDist(): string | null {
  const candidates = [
    join(__dirname, "..", "frontend", "dist"),
    join(process.cwd(), "frontend", "dist"),
  ];
  return (
    candidates.find((dir) => existsSync(join(dir, "index.html"))) ?? null
  );
}

export function mountFrontendSpa(app: NestExpressApplication): void {
  const dist = resolveFrontendDist();
  if (!dist) return;

  app.useStaticAssets(dist);

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      return next();
    }

    const path = req.path;
    if (path.startsWith("/reality") || path.startsWith("/api")) {
      return next();
    }
    if (/\.[a-zA-Z0-9]+$/.test(path)) {
      return next();
    }

    res.sendFile(join(dist, "index.html"));
  });
}
