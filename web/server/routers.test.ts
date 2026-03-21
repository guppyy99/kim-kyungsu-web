import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// DB 및 스토리지 모킹
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    select: () => ({
      from: () => ({
        orderBy: () => Promise.resolve([]),
        where: () => ({
          limit: () => Promise.resolve([]),
        }),
      }),
    }),
    insert: () => ({
      values: () => Promise.resolve(),
    }),
    delete: () => ({
      where: () => Promise.resolve(),
    }),
    update: () => ({
      set: () => ({
        where: () => Promise.resolve(),
      }),
    }),
  }),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({
    key: "kimkyungsu/test/mock-file.pdf",
    url: "https://cdn.example.com/mock-file.pdf",
  }),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

function createAdminCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "관리자",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createPublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("auth", () => {
  it("me returns null for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("me returns user for authenticated user", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.name).toBe("관리자");
  });
});

describe("announcements", () => {
  it("list returns empty array when DB has no data", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.announcements.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("create succeeds for admin", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.announcements.create({
      type: "공지",
      title: "테스트 공지사항",
      content: "테스트 내용",
      isNew: true,
    });
    expect(result.success).toBe(true);
  });
});

describe("schedules", () => {
  it("list returns empty array", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.schedules.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("create schedule succeeds for admin", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.schedules.create({
      scheduleDate: "2026.06.04",
      time: "10:00",
      label: "행사",
      title: "창원 시민 간담회",
      isCurrent: false,
    });
    expect(result.success).toBe(true);
  });
});

describe("proposals", () => {
  it("list returns empty array", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.proposals.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("submit proposal without attachment succeeds", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.proposals.submit({
      name: "홍길동",
      region: "창원시",
      category: "교통",
      title: "창원 버스 노선 개선 제안",
      content: "창원 시내버스 노선을 개선해 주세요.",
    });
    expect(result.success).toBe(true);
  });

  it("submit proposal with attachment uploads to S3", async () => {
    const { storagePut } = await import("./storage");
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.proposals.submit({
      name: "김도민",
      region: "진주시",
      category: "환경",
      title: "남강 수질 개선 제안",
      content: "남강 수질 개선이 필요합니다.",
      attachmentBase64: Buffer.from("test file content").toString("base64"),
      attachmentFileName: "proposal.pdf",
      attachmentMimeType: "application/pdf",
    });
    expect(result.success).toBe(true);
    expect(storagePut).toHaveBeenCalled();
  });
});

describe("files", () => {
  it("upload file to S3 and returns url", async () => {
    const { storagePut } = await import("./storage");
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.files.upload({
      fileName: "policy-report.pdf",
      mimeType: "application/pdf",
      fileSize: 1024,
      base64Data: Buffer.from("pdf content").toString("base64"),
      category: "policy",
    });
    expect(result.url).toBeTruthy();
    expect(result.fileName).toBe("policy-report.pdf");
    expect(storagePut).toHaveBeenCalled();
  });

  it("list files returns array", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.files.list({});
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("policyDocs", () => {
  it("list returns empty array", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.policyDocs.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("create policy doc with file upload", async () => {
    const { storagePut } = await import("./storage");
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.policyDocs.create({
      title: "경남 우주항공산업 육성 계획",
      category: "심층리포트",
      description: "경남 우주항공산업 육성을 위한 종합 계획서",
      fileBase64: Buffer.from("report content").toString("base64"),
      fileName: "aerospace-plan.pdf",
      fileMimeType: "application/pdf",
    });
    expect(result.success).toBe(true);
    expect(storagePut).toHaveBeenCalled();
  });
});
