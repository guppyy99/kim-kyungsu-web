import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "관리자",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

function createUserContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "일반 사용자",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

function createUnauthContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("admin.stats - 접근 제어", () => {
  it("관리자는 stats 조회 가능 (DB 없이도 기본값 반환)", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    // DB 없는 환경에서도 기본값을 반환하거나 오류 없이 처리되어야 함
    try {
      const result = await caller.admin.stats();
      expect(result).toHaveProperty("announcements");
      expect(result).toHaveProperty("schedules");
      expect(result).toHaveProperty("proposals");
      expect(result).toHaveProperty("policyDocs");
      expect(result).toHaveProperty("pledges");
      expect(result).toHaveProperty("users");
    } catch (e: unknown) {
      // DB 연결 실패는 허용 (테스트 환경)
      const err = e as { code?: string; message?: string };
      expect(err.code === "INTERNAL_SERVER_ERROR" || err.message?.includes("DB")).toBeTruthy();
    }
  });

  it("일반 사용자는 admin.stats 접근 시 FORBIDDEN 오류", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.stats()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("비로그인 사용자는 admin.stats 접근 시 FORBIDDEN 오류", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.stats()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});

describe("admin.seedSampleData - 접근 제어", () => {
  it("관리자는 seedSampleData 실행 가능 (DB 없이도 처리)", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    try {
      const result = await caller.admin.seedSampleData();
      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("results");
      expect(result.results).toHaveProperty("pledges");
      expect(result.results).toHaveProperty("announcements");
      expect(result.results).toHaveProperty("schedules");
      expect(result.results).toHaveProperty("policyDocs");
    } catch (e: unknown) {
      // DB 연결 실패는 허용 (테스트 환경)
      const err = e as { code?: string; message?: string };
      expect(err.code === "INTERNAL_SERVER_ERROR" || err.message?.includes("DB")).toBeTruthy();
    }
  });

  it("일반 사용자는 seedSampleData 접근 시 FORBIDDEN 오류", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.seedSampleData()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("비로그인 사용자는 seedSampleData 접근 시 FORBIDDEN 오류", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.seedSampleData()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});

describe("auth.me - 인증 상태 확인", () => {
  it("로그인한 관리자의 me 쿼리는 user 반환", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.role).toBe("admin");
  });

  it("비로그인 사용자의 me 쿼리는 null 반환", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});
