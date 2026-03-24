/**
 * Vercel Serverless Function 진입점
 * Express 앱을 serverless function으로 래핑
 *
 * 이 파일은 esbuild로 완전 번들링되어 api/index.mjs로 출력됨
 */
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import { registerOAuthRoutes } from "./_core/oauth";

const app = express();

// Vercel 제한: 4.5MB body size
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ limit: "4mb", extended: true }));

// OAuth 콜백
registerOAuthRoutes(app);

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// 헬스 체크
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, timestamp: Date.now() });
});

export default app;
