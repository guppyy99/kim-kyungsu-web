import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import { getDb } from "./db";
import {
  uploadedFiles,
  announcements,
  schedules,
  citizenProposals,
  policyDocs,
  pledges,
  users,
  adminAccounts,
} from "../drizzle/schema";
import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { SignJWT } from "jose";
import { eq, desc, count } from "drizzle-orm";
import { z } from "zod";
import { nanoid } from "nanoid";
import { notifyOwner } from "./_core/notification";

// 비밀번호 해시 헬퍼 (SHA-256 + salt)
function hashPassword(password: string, salt: string): string {
  return createHash("sha256").update(password + salt + "kimkyungsu2026").digest("hex");
}
function encodePasswordHash(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${hashPassword(password, salt)}`;
}
function checkPasswordHash(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const computed = hashPassword(password, salt);
  try { return timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(hash, "hex")); }
  catch { return false; }
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    // 관리자 아이디/비밀번호 로그인
    adminLogin: publicProcedure
      .input(z.object({ username: z.string().min(1), password: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("DB 연결 실패");
        const [account] = await db.select().from(adminAccounts).where(eq(adminAccounts.username, input.username)).limit(1);
        if (!account || !checkPasswordHash(input.password, account.passwordHash)) {
          throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.");
        }
        const openId = `admin:${account.username}`;
        const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "");
        const token = await new SignJWT({ openId, appId: process.env.VITE_APP_ID ?? "", name: account.displayName ?? account.username })
          .setProtectedHeader({ alg: "HS256", typ: "JWT" })
          .setExpirationTime(Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365)
          .sign(secret);
        const existingUser = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
        if (existingUser.length === 0) {
          await db.insert(users).values({ openId, name: account.displayName ?? account.username, loginMethod: "admin", role: "admin", lastSignedIn: new Date() });
        } else {
          await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.openId, openId));
        }
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 1000 * 60 * 60 * 24 * 365 });
        return { success: true, username: account.username, displayName: account.displayName };
      }),

    // 관리자 계정 정보 수정 (아이디/비밀번호/표시이름)
    updateAdminAccount: adminProcedure
      .input(z.object({
        currentPassword: z.string().min(1),
        newUsername: z.string().min(3).max(64).optional(),
        newPassword: z.string().min(6).max(128).optional(),
        newDisplayName: z.string().max(100).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("DB 연결 실패");
        const currentOpenId = ctx.user?.openId ?? "";
        const currentUsername = currentOpenId.startsWith("admin:") ? currentOpenId.slice(6) : null;
        if (!currentUsername) throw new Error("관리자 계정이 아닙니다.");
        const [account] = await db.select().from(adminAccounts).where(eq(adminAccounts.username, currentUsername)).limit(1);
        if (!account) throw new Error("계정을 찾을 수 없습니다.");
        if (!checkPasswordHash(input.currentPassword, account.passwordHash)) throw new Error("현재 비밀번호가 올바르지 않습니다.");
        const updateData: Record<string, string> = {};
        if (input.newPassword) updateData.passwordHash = encodePasswordHash(input.newPassword);
        if (input.newDisplayName !== undefined) updateData.displayName = input.newDisplayName;
        if (input.newUsername) {
          const [dup] = await db.select().from(adminAccounts).where(eq(adminAccounts.username, input.newUsername)).limit(1);
          if (dup && dup.id !== account.id) throw new Error("이미 사용 중인 아이디입니다.");
          updateData.username = input.newUsername;
        }
        if (Object.keys(updateData).length > 0) {
          await db.update(adminAccounts).set(updateData).where(eq(adminAccounts.id, account.id));
          if (input.newDisplayName !== undefined) await db.update(users).set({ name: input.newDisplayName }).where(eq(users.openId, currentOpenId));
        }
        return { success: true };
      }),

    // 최초 관리자 계정 생성 (계정이 없을 때만)
    setupAdmin: publicProcedure
      .input(z.object({
        username: z.string().min(3).max(64),
        password: z.string().min(6).max(128),
        displayName: z.string().max(100).optional(),
        setupKey: z.string(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB 연결 실패");
        const [existing] = await db.select({ id: adminAccounts.id }).from(adminAccounts).limit(1);
        if (existing) throw new Error("관리자 계정이 이미 존재합니다. 로그인하여 정보를 수정하세요.");
        const validKey = process.env.ADMIN_SETUP_KEY ?? "kimkyungsu2026!";
        if (input.setupKey !== validKey) throw new Error("설정 키가 올바르지 않습니다.");
        await db.insert(adminAccounts).values({ username: input.username, passwordHash: encodePasswordHash(input.password), displayName: input.displayName ?? input.username });
        return { success: true };
      }),

    // 관리자 계정 존재 여부 확인 (public)
    hasAdmin: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return false;
      const [existing] = await db.select({ id: adminAccounts.id }).from(adminAccounts).limit(1);
      return !!existing;
    }),
  }),

  // ─── 파일 업로드 ───────────────────────────────────────────────────────────
  files: router({
    /**
     * Base64 인코딩된 파일을 받아 S3에 업로드하고 메타데이터를 DB에 저장
     */
    upload: protectedProcedure
      .input(
        z.object({
          fileName: z.string().min(1),
          mimeType: z.string().default("application/octet-stream"),
          fileSize: z.number().optional(),
          base64Data: z.string().min(1),
          category: z.enum(["policy", "press", "card", "pledge", "other"]).default("other"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("DB 연결 실패");

        // base64 → Buffer
        const buffer = Buffer.from(input.base64Data, "base64");
        const suffix = nanoid(8);
        const ext = input.fileName.split(".").pop() ?? "bin";
        const fileKey = `kimkyungsu/${input.category}/${nanoid(12)}-${suffix}.${ext}`;

        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        await db.insert(uploadedFiles).values({
          fileName: input.fileName,
          fileKey,
          fileUrl: url,
          mimeType: input.mimeType,
          fileSize: input.fileSize,
          category: input.category,
          uploadedBy: ctx.user.id,
        });

        return { url, fileKey, fileName: input.fileName };
      }),

    list: protectedProcedure
      .input(z.object({ category: z.enum(["policy", "press", "card", "pledge", "other"]).optional() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const rows = await db
          .select()
          .from(uploadedFiles)
          .orderBy(desc(uploadedFiles.createdAt));
        if (input.category) return rows.filter(r => r.category === input.category);
        return rows;
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB 연결 실패");
        await db.delete(uploadedFiles).where(eq(uploadedFiles.id, input.id));
        return { success: true };
      }),
  }),

  // ─── 공지사항 ──────────────────────────────────────────────────────────────
  announcements: router({
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(announcements).orderBy(desc(announcements.publishedAt));
    }),

    create: protectedProcedure
      .input(
        z.object({
          type: z.enum(["공지", "보도", "일정"]),
          title: z.string().min(1),
          content: z.string().optional(),
          isNew: z.boolean().default(true),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB 연결 실패");
        await db.insert(announcements).values({ ...input });
        return { success: true };
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const [item] = await db.select().from(announcements).where(eq(announcements.id, input.id)).limit(1);
        return item ?? null;
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB 연결 실패");
        await db.delete(announcements).where(eq(announcements.id, input.id));
        return { success: true };
      }),
  }),

  // ─── 일정 ─────────────────────────────────────────────────────────────────
  schedules: router({
    list: publicProcedure
      .input(z.object({ date: z.string().optional() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const rows = await db.select().from(schedules).orderBy(schedules.scheduleDate, schedules.time);
        if (input.date) return rows.filter(r => r.scheduleDate === input.date);
        return rows;
      }),

    create: protectedProcedure
      .input(
        z.object({
          scheduleDate: z.string(),
          time: z.string(),
          label: z.enum(["이동", "행사", "현장", "내부", "회의"]),
          title: z.string().min(1),
          isCurrent: z.boolean().default(false),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB 연결 실패");
        await db.insert(schedules).values({ ...input });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB 연결 실패");
        await db.delete(schedules).where(eq(schedules.id, input.id));
        return { success: true };
      }),
  }),

  // ─── 도민 제안 ─────────────────────────────────────────────────────────────
  proposals: router({
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(citizenProposals).orderBy(desc(citizenProposals.createdAt));
    }),

    submit: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          region: z.string().optional(),
          category: z.string().optional(),
          title: z.string().min(1),
          content: z.string().min(1),
          // 첨부파일 (선택)
          attachmentBase64: z.string().optional(),
          attachmentFileName: z.string().optional(),
          attachmentMimeType: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB 연결 실패");

        let attachmentUrl: string | undefined;
        let attachmentKey: string | undefined;

        // 첨부파일이 있으면 S3에 업로드
        if (input.attachmentBase64 && input.attachmentFileName) {
          const buffer = Buffer.from(input.attachmentBase64, "base64");
          const ext = input.attachmentFileName.split(".").pop() ?? "bin";
          const key = `kimkyungsu/proposals/${nanoid(12)}.${ext}`;
          const result = await storagePut(key, buffer, input.attachmentMimeType ?? "application/octet-stream");
          attachmentUrl = result.url;
          attachmentKey = result.key;
        }

        await db.insert(citizenProposals).values({
          name: input.name,
          region: input.region,
          category: input.category,
          title: input.title,
          content: input.content,
          attachmentUrl,
          attachmentKey,
          attachmentName: input.attachmentFileName,
        });

        // 오너에게 알림
        await notifyOwner({
          title: `새 도민 제안: ${input.title}`,
          content: `${input.name} (${input.region ?? "지역 미입력"}) - ${input.title}`,
        }).catch(() => {});

        return { success: true };
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["접수", "검토중", "반영", "보류"]),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB 연결 실패");
        await db
          .update(citizenProposals)
          .set({ status: input.status })
          .where(eq(citizenProposals.id, input.id));
        return { success: true };
      }),
  }),

  // ─── 정책 자료 ─────────────────────────────────────────────────────────────
  policyDocs: router({
    list: publicProcedure
      .input(z.object({ category: z.enum(["심층리포트", "보도자료", "카드뉴스"]).optional() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const rows = await db.select().from(policyDocs).orderBy(desc(policyDocs.publishedAt));
        if (input.category) return rows.filter(r => r.category === input.category);
        return rows;
      }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1),
          category: z.enum(["심층리포트", "보도자료", "카드뉴스"]),
          description: z.string().optional(),
          // 첨부파일 (선택)
          fileBase64: z.string().optional(),
          fileName: z.string().optional(),
          fileMimeType: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB 연결 실패");

        let fileUrl: string | undefined;
        let fileKey: string | undefined;

        if (input.fileBase64 && input.fileName) {
          const buffer = Buffer.from(input.fileBase64, "base64");
          const ext = input.fileName.split(".").pop() ?? "bin";
          const key = `kimkyungsu/policy/${nanoid(12)}.${ext}`;
          const result = await storagePut(key, buffer, input.fileMimeType ?? "application/octet-stream");
          fileUrl = result.url;
          fileKey = result.key;
        }

        await db.insert(policyDocs).values({
          title: input.title,
          category: input.category,
          description: input.description,
          fileUrl,
          fileKey,
          fileName: input.fileName,
        });

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB 연결 실패");
        await db.delete(policyDocs).where(eq(policyDocs.id, input.id));
        return { success: true };
      }),
  }),

  // ─── 공약 ──────────────────────────────────────────────────────────────────
  pledges: router({
    list: publicProcedure
      .input(z.object({
        region: z.string().optional(),
        category: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const rows = await db.select().from(pledges).orderBy(pledges.region, pledges.category);
        let result = rows;
        if (input.region) result = result.filter(r => r.region === input.region);
        if (input.category) result = result.filter(r => r.category === input.category);
        return result;
      }),

    create: adminProcedure
      .input(z.object({
        region: z.string().min(1),
        category: z.string().min(1),
        title: z.string().min(1),
        description: z.string().optional(),
        progress: z.number().min(0).max(100).default(0),
        status: z.enum(["공약", "추진중", "완료", "보류"]).default("공약"),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB 연결 실패");
        await db.insert(pledges).values({ ...input });
        return { success: true };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        region: z.string().optional(),
        category: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        progress: z.number().min(0).max(100).optional(),
        status: z.enum(["공약", "추진중", "완료", "보류"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB 연결 실패");
        const { id, ...data } = input;
        await db.update(pledges).set(data).where(eq(pledges.id, id));
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB 연결 실패");
        await db.delete(pledges).where(eq(pledges.id, input.id));
        return { success: true };
      }),
  }),

  // ─── 관리자 전용 ────────────────────────────────────────────────────────────
  admin: router({
    /**
     * 대시보드 통계: 각 테이블 건수 집계
     */
    stats: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { announcements: 0, schedules: 0, proposals: 0, policyDocs: 0, pledges: 0, users: 0 };

      const [annCount] = await db.select({ value: count() }).from(announcements);
      const [schCount] = await db.select({ value: count() }).from(schedules);
      const [proCount] = await db.select({ value: count() }).from(citizenProposals);
      const [polCount] = await db.select({ value: count() }).from(policyDocs);
      const [plgCount] = await db.select({ value: count() }).from(pledges);
      const [usrCount] = await db.select({ value: count() }).from(users);

      // 상태별 제안 건수
      const allProposals = await db.select({ status: citizenProposals.status }).from(citizenProposals);
      const proposalByStatus = allProposals.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        announcements: annCount?.value ?? 0,
        schedules: schCount?.value ?? 0,
        proposals: proCount?.value ?? 0,
        policyDocs: polCount?.value ?? 0,
        pledges: plgCount?.value ?? 0,
        users: usrCount?.value ?? 0,
        proposalByStatus,
      };
    }),

    /**
     * 최근 활동 피드 (공지·제안·자료 최신 5건씩)
     */
    recentActivity: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { recentAnnouncements: [], recentProposals: [], recentPolicyDocs: [] };

      const recentAnnouncements = await db
        .select()
        .from(announcements)
        .orderBy(desc(announcements.createdAt))
        .limit(5);

      const recentProposals = await db
        .select()
        .from(citizenProposals)
        .orderBy(desc(citizenProposals.createdAt))
        .limit(5);

      const recentPolicyDocs = await db
        .select()
        .from(policyDocs)
        .orderBy(desc(policyDocs.createdAt))
        .limit(5);

      return { recentAnnouncements, recentProposals, recentPolicyDocs };
    }),

    // 공지사항 수정 (관리자 전용)
    updateAnnouncement: adminProcedure
      .input(z.object({
        id: z.number(),
        type: z.enum(["공지", "보도", "일정"]).optional(),
        title: z.string().optional(),
        content: z.string().optional(),
        isNew: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB 연결 실패");
        const { id, ...data } = input;
        await db.update(announcements).set(data).where(eq(announcements.id, id));
        return { success: true };
      }),

    // 일정 수정 (관리자 전용)
    updateSchedule: adminProcedure
      .input(z.object({
        id: z.number(),
        scheduleDate: z.string().optional(),
        time: z.string().optional(),
        label: z.enum(["이동", "행사", "현장", "내부", "회의"]).optional(),
        title: z.string().optional(),
        isCurrent: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB 연결 실패");
        const { id, ...data } = input;
        await db.update(schedules).set(data).where(eq(schedules.id, id));
        return { success: true };
      }),

    // 정책자료 수정 (관리자 전용)
    updatePolicyDoc: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        category: z.enum(["심층리포트", "보도자료", "카드뉴스"]).optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB 연결 실패");
        const { id, ...data } = input;
        await db.update(policyDocs).set(data).where(eq(policyDocs.id, id));
        return { success: true };
      }),

    // ─── 샘플 데이터 시드 (관리자 전용) ────────────────────────────────────────
    seedSampleData: adminProcedure.mutation(async () => {
      const db = await getDb();
      if (!db) throw new Error("DB 연결 실패");

      // 현재 건수 확인
      const [existingPledges] = await db.select({ value: count() }).from(pledges);
      const [existingAnn] = await db.select({ value: count() }).from(announcements);
      const [existingSch] = await db.select({ value: count() }).from(schedules);
      const [existingPol] = await db.select({ value: count() }).from(policyDocs);
      const [existingProp] = await db.select({ value: count() }).from(citizenProposals);

      const results = { pledges: 0, announcements: 0, schedules: 0, policyDocs: 0, proposals: 0 };

      // ── 공약 샘플 데이터 (기존 없을 때만) ──────────────────────────────────
      if ((existingPledges?.value ?? 0) === 0) {
        const samplePledges = [
          { region: "창원", category: "경제·일자리", title: "창원 방산·우주항공 클러스터 조성", description: "한화에어로스페이스 연계 방산·우주항공 산업단지 조성으로 3,000개 일자리 창출", progress: 0, status: "공약" as const },
          { region: "진주", category: "우주항공·방산", title: "남해안 우주항공산업 벨트 구축", description: "고흥~여수~하동~사천~진주~창원 남해안권을 대한민국 우주항공산업 수도로 육성", progress: 0, status: "공약" as const },
          { region: "사천", category: "우주항공·방산", title: "우주항공청 연계 산업 생태계 강화", description: "KAI(한국항공우주산업) 중심 항공산업 매출 80% 경남 집중 강점을 지역 성장 엔진으로 전환", progress: 0, status: "공약" as const },
          { region: "통영", category: "교통·인프라", title: "서부경남 KTX(남부내륙철도) 조기 완공", description: "2031년 예정된 서부경남 KTX를 이재명 대통령 임기 내 조기 완공. 통영·거제 남해안 관광 대전환", progress: 5, status: "추진중" as const },
          { region: "거제", category: "경제·일자리", title: "거제 조선업 스마트 혁신 지원", description: "삼성중공업·대우조선해양 연계 스마트 조선 기술 도입으로 조선업 경쟁력 강화 및 일자리 안정화", progress: 0, status: "공약" as const },
          { region: "김해", category: "교통·인프라", title: "부울경 메가시티 광역교통망 구축", description: "부산·울산·경남 메가시티 연계 광역철도·BRT 구축으로 동부경남 교통 혁신", progress: 0, status: "공약" as const },
          { region: "양산", category: "복지·의료", title: "동부경남 의료 취약지 해소", description: "양산·밀양 공공의료원 확충 및 원격진료 시스템 구축으로 의료 접근성 강화", progress: 0, status: "공약" as const },
          { region: "진주", category: "교육·청년", title: "경남 청년 정착 지원 패키지", description: "청년 주거 지원, 취업·창업 생태계 조성, 인구 유출 방지를 위한 종합 청년 정책 백서", progress: 0, status: "공약" as const },
          { region: "통영", category: "환경·관광", title: "남해안 해양관광 특구 지정", description: "통영·거제·남해 해양 레저·관광 인프라 구축으로 연 500만 관광객 유치", progress: 0, status: "공약" as const },
          { region: "합천", category: "환경·관광", title: "경남 탄소중립 환경 정책", description: "2030 탄소중립 달성을 위한 재생에너지 확대, 탄소흡수원 보전, 친환경 교통 체계 구축", progress: 0, status: "공약" as const },
          { region: "함양", category: "농림·수산", title: "서부경남 친환경 농업 단지 조성", description: "스마트팜 기술 도입으로 농가 소득 30% 향상 목표, 청년 농업인 정착 지원", progress: 0, status: "공약" as const },
          { region: "창원", category: "문화·체육", title: "경남 문화예술 거점 도시 조성", description: "창원 국제음악제 확대, 경남 도립미술관 신설, 지역 문화예술인 지원 강화", progress: 0, status: "공약" as const },
          { region: "밀양", category: "복지·의료", title: "밀양 공공의료원 설립", description: "의료 취약지 밀양에 공공의료원 신설, 응급의료 체계 강화로 도민 의료 안전망 구축", progress: 0, status: "공약" as const },
          { region: "고성", category: "환경·관광", title: "고성 공룡세계엑스포 상설화", description: "고성 공룡 화석지 유네스코 세계유산 등재 추진, 공룡테마파크 상설 운영으로 관광 수입 증대", progress: 0, status: "공약" as const },
          { region: "남해", category: "농림·수산", title: "남해 마늘·유자 특화 산업 육성", description: "남해 특산물 브랜드화 및 온라인 판로 개척, 농가 소득 안정화 지원", progress: 0, status: "공약" as const },
          { region: "하동", category: "농림·수산", title: "하동 녹차·매실 6차산업 클러스터", description: "하동 녹차·매실 생산부터 가공·관광까지 6차산업 클러스터 조성으로 농가 소득 배증", progress: 0, status: "공약" as const },
          { region: "산청", category: "복지·의료", title: "산청 한방의료 관광 특구 지정", description: "산청 한방의료 인프라 강화, 한방 의료관광 특구 지정으로 지역 경제 활성화", progress: 0, status: "공약" as const },
          { region: "거창", category: "교육·청년", title: "거창 교육도시 브랜드 강화", description: "거창 교육 특구 지정, 우수 학교 유치 및 지원 강화로 교육 명품 도시 위상 제고", progress: 0, status: "공약" as const },
          { region: "창녕", category: "환경·관광", title: "창녕 우포늪 생태관광 활성화", description: "람사르 습지 우포늪 생태 탐방 인프라 확충, 연간 100만 관광객 유치 목표", progress: 0, status: "공약" as const },
          { region: "함안", category: "문화·체육", title: "함안 아라가야 역사문화 복원", description: "아라가야 왕궁지 발굴·복원 및 역사문화 테마파크 조성으로 역사 관광 거점 육성", progress: 0, status: "공약" as const },
          { region: "의령", category: "농림·수산", title: "의령 망개떡·한우 특산물 브랜드화", description: "의령 특산물 전국 브랜드화 및 직거래 플랫폼 구축으로 농가 소득 향상", progress: 0, status: "공약" as const },
        ];
        await db.insert(pledges).values(samplePledges);
        results.pledges = samplePledges.length;
      }

      // ── 공지사항 샘플 데이터 (기존 없을 때만) ──────────────────────────────
      if ((existingAnn?.value ?? 0) === 0) {
        // 이전 더미 데이터와 동일한 공지사항 내용 (날짜 고정: 2026.03.xx)
        const sampleAnn = [
          {
            type: "공지" as const,
            title: "3월 17일 예비후보 등록 및 통영 현장 방문 안내",
            content: "더불어민주당 경남도지사 예비후보로 공식 등록하였습니다. 1호 공약인 서부경남 KTX 조기 완공을 재천명하며, 통영 현장을 직접 방문하여 도민의 샘생을 듣습니다.",
            isNew: true,
            publishedAt: new Date("2026-03-17"),
          },
          {
            type: "공지" as const,
            title: "18개 시·군 공약 DB 최종 확정 발표",
            content: "경남 18개 시·군 지역별 공약을 최종 확정하여 발표합니다. 세부 공약은 디지털 상황실 공약DB 메뉴에서 확인하실 수 있습니다. 도민 여러분의 많은 관심 부탁드립니다.",
            isNew: true,
            publishedAt: new Date("2026-03-15"),
          },
          {
            type: "보도" as const,
            title: "김경수 후보, 경남 경제 대전환 5대 공약 발표",
            content: "방산·우주항공 산업 강화, 청년 정착 지원, 의료 취약지 해소, 교통 인프라 확충, 농업 소득 향상 5대 분야 핵심 공약을 발표했습니다.",
            isNew: false,
            publishedAt: new Date("2026-03-14"),
          },
          {
            type: "공지" as const,
            title: "도민 제안함 운영 시작 안내",
            content: "도민 여러분의 아이디어와 제안을 직접 정책에 반영하는 도민 제안함을 운영합니다. 구체적인 제안일수록 정책에 반영될 가능성이 높습니다. 많은 참여 바랍니다.",
            isNew: false,
            publishedAt: new Date("2026-03-12"),
          },
        ];
        await db.insert(announcements).values(sampleAnn);
        results.announcements = sampleAnn.length;
      }

      // ── 일정 샘플 데이터 (기존 없을 때만) ──────────────────────────────────
      if ((existingSch?.value ?? 0) === 0) {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, "0");
        const d = String(today.getDate()).padStart(2, "0");
        const todayStr = `${y}.${m}.${d}`;

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yd = String(yesterday.getDate()).padStart(2, "0");
        const ym = String(yesterday.getMonth() + 1).padStart(2, "0");
        const yesterdayStr = `${y}.${ym}.${yd}`;

        const sampleSchedules = [
          { scheduleDate: todayStr, time: "09:00", label: "행사" as const, title: "창원 캠프 출발·전략 회의", isCurrent: false },
          { scheduleDate: todayStr, time: "10:30", label: "현장" as const, title: "진주 시민 간담회", isCurrent: false },
          { scheduleDate: todayStr, time: "13:00", label: "현장" as const, title: "통영 현장 방문 (서부경남 KTX 예정지)", isCurrent: true },
          { scheduleDate: todayStr, time: "15:30", label: "현장" as const, title: "거제 조선소 방문", isCurrent: false },
          { scheduleDate: todayStr, time: "18:00", label: "내부" as const, title: "캠프 복귀 · 보고", isCurrent: false },
          { scheduleDate: yesterdayStr, time: "09:00", label: "행사" as const, title: "경남도선거관리위원회 예비후보 등록", isCurrent: false },
          { scheduleDate: yesterdayStr, time: "11:00", label: "현장" as const, title: "통영 서부경남 KTX 현장 방문", isCurrent: false },
          { scheduleDate: yesterdayStr, time: "14:00", label: "행사" as const, title: "경남 18개 시군 후보 원팀 선언", isCurrent: false },
        ];
        await db.insert(schedules).values(sampleSchedules);
        results.schedules = sampleSchedules.length;
      }

      // ── 정책 자료 샘플 데이터 (기존 없을 때만) ──────────────────────────────
      if ((existingPol?.value ?? 0) === 0) {
        const samplePolicyDocs = [
          { title: "경남 경제 대전환 5개년 계획", category: "심층리포트" as const, description: "경남의 경제 구조를 분석하고 향후 5개년간의 발전 방향을 제시합니다. 방산·우주항공 산업 강화, 제조업 혁신, 청년 창업 생태계 조성 등 3대 축을 중심으로 구체적인 실행 계획을 담았습니다." },
          { title: "경남 교육·청년 정책 백서", category: "심층리포트" as const, description: "경남 청년 인구 유출 원인을 진단하고 교육 인프라 강화, 청년 주거 지원, 취업·창업 생태계 조성을 통한 청년 정착 방안을 제시합니다." },
          { title: "경남 의료·복지 취약지 해소 방안", category: "심층리포트" as const, description: "경남 내 의료 취약 지역의 현황을 분석하고 공공의료원 확충, 원격진료 시스템 도입, 응급의료 체계 강화 등의 대안을 제시합니다." },
          { title: "예비후보 등록 및 1호 공약 발표", category: "보도자료" as const, description: "더불어민주당 경남도지사 예비후보 등록 및 민선 7기 1호 공약 서부경남 KTX 조기 완공 재천명." },
          { title: "남해안 우주항공산업 벨트 구축 발표", category: "보도자료" as const, description: "진주 현장 최고위원회의에서 남해안권 우주항공산업 벨트 구축 공약 발표." },
          { title: "경남 대전환 핵심 공약 카드뉴스", category: "카드뉴스" as const, description: "김경수 후보의 5대 핵심 공약을 쉽고 간결하게 정리한 카드뉴스입니다." },
          { title: "외화내빈 경남 경제 진단 카드뉴스", category: "카드뉴스" as const, description: "전국 3위 GRDP이지만 도민 소득은 꼴찌 수준인 경남 경제의 구조적 문제와 해법을 담은 카드뉴스." },
        ];
        await db.insert(policyDocs).values(samplePolicyDocs);
        results.policyDocs = samplePolicyDocs.length;
      }

      // ── 도민 제안 샘플 데이터 (기존 없을 때만) ──────────────────────────────
      if ((existingProp?.value ?? 0) === 0) {
        const sampleProposals = [
          {
            name: "창원시민 박지훈",
            email: "jihoon@example.com",
            category: "교통·인프라",
            title: "창원~진주 광역버스 노선 확대 요청",
            content: "창원에서 진주로 출퇴근하는 직장인이 많은데 광역버스 배차 간격이 너무 길어 불편합니다. 출퇴근 시간대 배차를 30분에서 15분으로 줄여주시면 좋겠습니다.",
            status: "검토중" as const,
            createdAt: new Date("2026-03-16"),
          },
          {
            name: "진주 청년 이수민",
            email: "sumin@example.com",
            category: "청년·일자리",
            title: "경남 청년 창업 지원센터 진주 유치 건의",
            content: "서울·부산에 집중된 창업 지원 인프라를 경남에도 유치해 주세요. 진주 혁신도시 내 청년 창업 지원센터를 설립하면 청년 인구 유출을 막을 수 있을 것 같습니다.",
            status: "반영" as const,
            createdAt: new Date("2026-03-14"),
          },
          {
            name: "통영 어민 김대성",
            email: "daesung@example.com",
            category: "농림·수산",
            title: "통영 굴 양식장 환경 개선 지원 요청",
            content: "기후변화로 인해 굴 폐사율이 매년 높아지고 있습니다. 수온 모니터링 시스템 설치와 친환경 양식 기술 보급 지원이 절실합니다. 어민 생계가 달린 문제입니다.",
            status: "접수" as const,
            createdAt: new Date("2026-03-15"),
          },
          {
            name: "거제 학부모 최은정",
            email: "eunjung@example.com",
            category: "교육·청년",
            title: "거제 도서지역 학교 통학버스 지원 확대",
            content: "거제 외곽 도서지역 아이들이 학교까지 이동하는 데 큰 어려움을 겪고 있습니다. 통학버스 노선을 늘리고 운행 횟수를 늘려주시면 교육 기회 불평등을 해소할 수 있습니다.",
            status: "검토중" as const,
            createdAt: new Date("2026-03-13"),
          },
          {
            name: "밀양 농민 이철수",
            email: "chulsoo@example.com",
            category: "농림·수산",
            title: "밀양 딸기 스마트팜 단지 조성 제안",
            content: "밀양은 딸기 재배 최적지임에도 시설이 노후화되어 경쟁력이 떨어지고 있습니다. 스마트팜 전환 지원금과 기술 교육을 제공해 주시면 농가 소득을 크게 높일 수 있을 것입니다.",
            status: "접수" as const,
            createdAt: new Date("2026-03-12"),
          },
          {
            name: "사천 주민 정민호",
            email: "minho@example.com",
            category: "경제·일자리",
            title: "사천 항공우주산업 협력 중소기업 지원 강화",
            content: "KAI 협력 중소기업들이 단가 후려치기와 기술 유출 문제로 어려움을 겪고 있습니다. 공정거래 감시와 중소기업 기술 보호 지원 체계를 강화해 주세요.",
            status: "보류" as const,
            createdAt: new Date("2026-03-11"),
          },
          {
            name: "남해 귀농인 한소영",
            email: "soyoung@example.com",
            category: "복지·의료",
            title: "남해 귀농·귀촌인 의료 접근성 개선 요청",
            content: "남해로 귀농했는데 가까운 병원이 없어 응급 상황에 매우 불안합니다. 순환 진료 버스나 원격진료 시스템을 도입해 주시면 농촌 정착 인구가 늘어날 것 같습니다.",
            status: "검토중" as const,
            createdAt: new Date("2026-03-10"),
          },
        ];
        await db.insert(citizenProposals).values(sampleProposals);
        results.proposals = sampleProposals.length;
      }

      return { success: true, results };
    }),
  }),
});

export type AppRouter = typeof appRouter;
