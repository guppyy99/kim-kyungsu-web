/**
 * 개발 환경 전용 간편 인증
 * /api/dev/login 으로 GET 요청하면 즉시 관리자 세션 생성
 * NODE_ENV=development 일 때만 활성화
 */
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import * as db from "../db";

export function registerDevAuthRoutes(app: Express) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  console.log("[DevAuth] 개발 모드 간편 인증 활성화: GET /api/dev/login");

  app.get("/api/dev/login", async (req: Request, res: Response) => {
    try {
      const openId = "dev:admin";
      const name = "개발자";

      // DB에 개발자 유저 upsert
      await db.upsertUser({
        openId,
        name,
        loginMethod: "dev",
        role: "admin",
        lastSignedIn: new Date(),
      });

      // JWT 세션 토큰 생성
      const sessionToken = await sdk.createSessionToken(openId, {
        name,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({
        success: true,
        message: "개발 모드 관리자 로그인 완료",
        user: { openId, name, role: "admin" },
      });
    } catch (error) {
      console.error("[DevAuth] 로그인 실패:", error);
      res.status(500).json({ error: "개발 모드 로그인 실패" });
    }
  });
}
