import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import { getSupabase } from "./db";
import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { SignJWT } from "jose";
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

    adminLogin: publicProcedure
      .input(z.object({ username: z.string().min(1), password: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const sb = getSupabase();
        if (!sb) throw new Error("DB 연결 실패");
        const { data: account } = await sb.from("admin_accounts").select("*").eq("username", input.username).limit(1).single();
        if (!account || !checkPasswordHash(input.password, account.passwordHash)) {
          throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.");
        }
        const openId = `admin:${account.username}`;
        const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "");
        const token = await new SignJWT({ openId, appId: process.env.VITE_APP_ID ?? "", name: account.displayName ?? account.username })
          .setProtectedHeader({ alg: "HS256", typ: "JWT" })
          .setExpirationTime(Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365)
          .sign(secret);
        const { data: existingUser } = await sb.from("users").select("id").eq("openId", openId).limit(1).single();
        if (!existingUser) {
          await sb.from("users").insert({ openId, name: account.displayName ?? account.username, loginMethod: "admin", role: "admin", lastSignedIn: new Date().toISOString() });
        } else {
          await sb.from("users").update({ lastSignedIn: new Date().toISOString() }).eq("openId", openId);
        }
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 1000 * 60 * 60 * 24 * 365 });
        return { success: true, username: account.username, displayName: account.displayName };
      }),

    updateAdminAccount: adminProcedure
      .input(z.object({
        currentPassword: z.string().min(1),
        newUsername: z.string().min(3).max(64).optional(),
        newPassword: z.string().min(6).max(128).optional(),
        newDisplayName: z.string().max(100).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const sb = getSupabase();
        if (!sb) throw new Error("DB 연결 실패");
        const currentOpenId = ctx.user?.openId ?? "";
        const currentUsername = currentOpenId.startsWith("admin:") ? currentOpenId.slice(6) : null;
        if (!currentUsername) throw new Error("관리자 계정이 아닙니다.");
        const { data: account } = await sb.from("admin_accounts").select("*").eq("username", currentUsername).limit(1).single();
        if (!account) throw new Error("계정을 찾을 수 없습니다.");
        if (!checkPasswordHash(input.currentPassword, account.passwordHash)) throw new Error("현재 비밀번호가 올바르지 않습니다.");
        const updateData: Record<string, string> = {};
        if (input.newPassword) updateData.passwordHash = encodePasswordHash(input.newPassword);
        if (input.newDisplayName !== undefined) updateData.displayName = input.newDisplayName;
        if (input.newUsername) {
          const { data: dup } = await sb.from("admin_accounts").select("id").eq("username", input.newUsername).limit(1).single();
          if (dup && dup.id !== account.id) throw new Error("이미 사용 중인 아이디입니다.");
          updateData.username = input.newUsername;
        }
        if (Object.keys(updateData).length > 0) {
          await sb.from("admin_accounts").update(updateData).eq("id", account.id);
          if (input.newDisplayName !== undefined) await sb.from("users").update({ name: input.newDisplayName }).eq("openId", currentOpenId);
        }
        return { success: true };
      }),

    setupAdmin: publicProcedure
      .input(z.object({
        username: z.string().min(3).max(64),
        password: z.string().min(6).max(128),
        displayName: z.string().max(100).optional(),
        setupKey: z.string(),
      }))
      .mutation(async ({ input }) => {
        const sb = getSupabase();
        if (!sb) throw new Error("DB 연결 실패");
        const { data: existing } = await sb.from("admin_accounts").select("id").limit(1).single();
        if (existing) throw new Error("관리자 계정이 이미 존재합니다.");
        const validKey = process.env.ADMIN_SETUP_KEY ?? "kimkyungsu2026!";
        if (input.setupKey !== validKey) throw new Error("설정 키가 올바르지 않습니다.");
        await sb.from("admin_accounts").insert({ username: input.username, passwordHash: encodePasswordHash(input.password), displayName: input.displayName ?? input.username });
        return { success: true };
      }),

    hasAdmin: publicProcedure.query(async () => {
      const sb = getSupabase();
      if (!sb) return false;
      const { data } = await sb.from("admin_accounts").select("id").limit(1).single();
      return !!data;
    }),
  }),

  files: router({
    upload: protectedProcedure
      .input(z.object({
        fileName: z.string().min(1),
        mimeType: z.string().default("application/octet-stream"),
        fileSize: z.number().optional(),
        base64Data: z.string().min(1),
        category: z.enum(["policy", "press", "card", "pledge", "other"]).default("other"),
      }))
      .mutation(async ({ input, ctx }) => {
        const sb = getSupabase();
        if (!sb) throw new Error("DB 연결 실패");
        const buffer = Buffer.from(input.base64Data, "base64");
        const suffix = nanoid(8);
        const ext = input.fileName.split(".").pop() ?? "bin";
        const fileKey = `kimkyungsu/${input.category}/${nanoid(12)}-${suffix}.${ext}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        await sb.from("uploaded_files").insert({
          fileName: input.fileName, fileKey, fileUrl: url, mimeType: input.mimeType,
          fileSize: input.fileSize, category: input.category, uploadedBy: ctx.user.id,
        });
        return { url, fileKey, fileName: input.fileName };
      }),

    list: protectedProcedure
      .input(z.object({ category: z.enum(["policy", "press", "card", "pledge", "other"]).optional() }))
      .query(async ({ input }) => {
        const sb = getSupabase();
        if (!sb) return [];
        let q = sb.from("uploaded_files").select("*").order("createdAt", { ascending: false });
        if (input.category) q = q.eq("category", input.category);
        const { data } = await q;
        return data ?? [];
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const sb = getSupabase();
        if (!sb) throw new Error("DB 연결 실패");
        await sb.from("uploaded_files").delete().eq("id", input.id);
        return { success: true };
      }),
  }),

  announcements: router({
    list: publicProcedure.query(async () => {
      const sb = getSupabase();
      if (!sb) return [];
      const { data } = await sb.from("announcements").select("*").order("publishedAt", { ascending: false });
      return data ?? [];
    }),

    create: protectedProcedure
      .input(z.object({ type: z.enum(["공지", "보도", "일정"]), title: z.string().min(1), content: z.string().optional(), isNew: z.boolean().default(true) }))
      .mutation(async ({ input }) => {
        const sb = getSupabase();
        if (!sb) throw new Error("DB 연결 실패");
        await sb.from("announcements").insert(input);
        return { success: true };
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const sb = getSupabase();
        if (!sb) return null;
        const { data } = await sb.from("announcements").select("*").eq("id", input.id).limit(1).single();
        return data ?? null;
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const sb = getSupabase();
        if (!sb) throw new Error("DB 연결 실패");
        await sb.from("announcements").delete().eq("id", input.id);
        return { success: true };
      }),
  }),

  schedules: router({
    list: publicProcedure
      .input(z.object({ date: z.string().optional() }))
      .query(async ({ input }) => {
        const sb = getSupabase();
        if (!sb) return [];
        let q = sb.from("schedules").select("*").order("scheduleDate").order("time");
        if (input.date) q = q.eq("scheduleDate", input.date);
        const { data } = await q;
        return data ?? [];
      }),

    create: protectedProcedure
      .input(z.object({ scheduleDate: z.string(), time: z.string(), label: z.enum(["이동", "행사", "현장", "내부", "회의"]), title: z.string().min(1), isCurrent: z.boolean().default(false) }))
      .mutation(async ({ input }) => {
        const sb = getSupabase();
        if (!sb) throw new Error("DB 연결 실패");
        await sb.from("schedules").insert(input);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const sb = getSupabase();
        if (!sb) throw new Error("DB 연결 실패");
        await sb.from("schedules").delete().eq("id", input.id);
        return { success: true };
      }),
  }),

  proposals: router({
    list: publicProcedure.query(async () => {
      const sb = getSupabase();
      if (!sb) return [];
      const { data } = await sb.from("citizen_proposals").select("*").order("createdAt", { ascending: false });
      return data ?? [];
    }),

    submit: publicProcedure
      .input(z.object({
        name: z.string().min(1), region: z.string().optional(), category: z.string().optional(),
        title: z.string().min(1), content: z.string().min(1),
        attachmentBase64: z.string().optional(), attachmentFileName: z.string().optional(), attachmentMimeType: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const sb = getSupabase();
        if (!sb) throw new Error("DB 연결 실패");
        let attachmentUrl: string | undefined;
        let attachmentKey: string | undefined;
        if (input.attachmentBase64 && input.attachmentFileName) {
          const buffer = Buffer.from(input.attachmentBase64, "base64");
          const ext = input.attachmentFileName.split(".").pop() ?? "bin";
          const key = `kimkyungsu/proposals/${nanoid(12)}.${ext}`;
          const result = await storagePut(key, buffer, input.attachmentMimeType ?? "application/octet-stream");
          attachmentUrl = result.url;
          attachmentKey = result.key;
        }
        await sb.from("citizen_proposals").insert({
          name: input.name, region: input.region, category: input.category,
          title: input.title, content: input.content,
          attachmentUrl, attachmentKey, attachmentName: input.attachmentFileName,
        });
        await notifyOwner({ title: `새 도민 제안: ${input.title}`, content: `${input.name} (${input.region ?? "지역 미입력"}) - ${input.title}` }).catch(() => {});
        return { success: true };
      }),

    updateStatus: protectedProcedure
      .input(z.object({ id: z.number(), status: z.enum(["접수", "검토중", "반영", "보류"]) }))
      .mutation(async ({ input }) => {
        const sb = getSupabase();
        if (!sb) throw new Error("DB 연결 실패");
        await sb.from("citizen_proposals").update({ status: input.status }).eq("id", input.id);
        return { success: true };
      }),
  }),

  policyDocs: router({
    list: publicProcedure
      .input(z.object({ category: z.enum(["심층리포트", "보도자료", "카드뉴스"]).optional() }))
      .query(async ({ input }) => {
        const sb = getSupabase();
        if (!sb) return [];
        let q = sb.from("policy_docs").select("*").order("publishedAt", { ascending: false });
        if (input.category) q = q.eq("category", input.category);
        const { data } = await q;
        return data ?? [];
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1), category: z.enum(["심층리포트", "보도자료", "카드뉴스"]),
        description: z.string().optional(), fileBase64: z.string().optional(),
        fileName: z.string().optional(), fileMimeType: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const sb = getSupabase();
        if (!sb) throw new Error("DB 연결 실패");
        let fileUrl: string | undefined;
        let fileKey: string | undefined;
        if (input.fileBase64 && input.fileName) {
          const buffer = Buffer.from(input.fileBase64, "base64");
          const ext = input.fileName.split(".").pop() ?? "bin";
          const key = `kimkyungsu/policy/${nanoid(12)}.${ext}`;
          const result = await storagePut(key, buffer, input.fileMimeType ?? "application/octet-stream");
          fileUrl = result.url; fileKey = result.key;
        }
        await sb.from("policy_docs").insert({ title: input.title, category: input.category, description: input.description, fileUrl, fileKey, fileName: input.fileName });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const sb = getSupabase();
        if (!sb) throw new Error("DB 연결 실패");
        await sb.from("policy_docs").delete().eq("id", input.id);
        return { success: true };
      }),
  }),

  pledges: router({
    list: publicProcedure
      .input(z.object({ region: z.string().optional(), category: z.string().optional() }))
      .query(async ({ input }) => {
        const sb = getSupabase();
        if (!sb) return [];
        let q = sb.from("pledges").select("*").order("region").order("category");
        if (input.region) q = q.eq("region", input.region);
        if (input.category) q = q.eq("category", input.category);
        const { data } = await q;
        return data ?? [];
      }),

    create: adminProcedure
      .input(z.object({ region: z.string().min(1), category: z.string().min(1), title: z.string().min(1), description: z.string().optional(), progress: z.number().min(0).max(100).default(0), status: z.enum(["공약", "추진중", "완료", "보류"]).default("공약") }))
      .mutation(async ({ input }) => {
        const sb = getSupabase();
        if (!sb) throw new Error("DB 연결 실패");
        await sb.from("pledges").insert(input);
        return { success: true };
      }),

    update: adminProcedure
      .input(z.object({ id: z.number(), region: z.string().optional(), category: z.string().optional(), title: z.string().optional(), description: z.string().optional(), progress: z.number().min(0).max(100).optional(), status: z.enum(["공약", "추진중", "완료", "보류"]).optional() }))
      .mutation(async ({ input }) => {
        const sb = getSupabase();
        if (!sb) throw new Error("DB 연결 실패");
        const { id, ...data } = input;
        await sb.from("pledges").update(data).eq("id", id);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const sb = getSupabase();
        if (!sb) throw new Error("DB 연결 실패");
        await sb.from("pledges").delete().eq("id", input.id);
        return { success: true };
      }),
  }),

  admin: router({
    stats: adminProcedure.query(async () => {
      const sb = getSupabase();
      if (!sb) return { announcements: 0, schedules: 0, proposals: 0, policyDocs: 0, pledges: 0, users: 0 };
      const [ann, sch, pro, pol, plg, usr] = await Promise.all([
        sb.from("announcements").select("id", { count: "exact", head: true }),
        sb.from("schedules").select("id", { count: "exact", head: true }),
        sb.from("citizen_proposals").select("id", { count: "exact", head: true }),
        sb.from("policy_docs").select("id", { count: "exact", head: true }),
        sb.from("pledges").select("id", { count: "exact", head: true }),
        sb.from("users").select("id", { count: "exact", head: true }),
      ]);
      const { data: allProposals } = await sb.from("citizen_proposals").select("status");
      const proposalByStatus = (allProposals ?? []).reduce((acc, p) => {
        acc[p.status] = (acc[p.status] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      return {
        announcements: ann.count ?? 0, schedules: sch.count ?? 0, proposals: pro.count ?? 0,
        policyDocs: pol.count ?? 0, pledges: plg.count ?? 0, users: usr.count ?? 0, proposalByStatus,
      };
    }),

    recentActivity: adminProcedure.query(async () => {
      const sb = getSupabase();
      if (!sb) return { recentAnnouncements: [], recentProposals: [], recentPolicyDocs: [] };
      const [a, p, d] = await Promise.all([
        sb.from("announcements").select("*").order("createdAt", { ascending: false }).limit(5),
        sb.from("citizen_proposals").select("*").order("createdAt", { ascending: false }).limit(5),
        sb.from("policy_docs").select("*").order("createdAt", { ascending: false }).limit(5),
      ]);
      return { recentAnnouncements: a.data ?? [], recentProposals: p.data ?? [], recentPolicyDocs: d.data ?? [] };
    }),

    updateAnnouncement: adminProcedure
      .input(z.object({ id: z.number(), type: z.enum(["공지", "보도", "일정"]).optional(), title: z.string().optional(), content: z.string().optional(), isNew: z.boolean().optional() }))
      .mutation(async ({ input }) => {
        const sb = getSupabase();
        if (!sb) throw new Error("DB 연결 실패");
        const { id, ...data } = input;
        await sb.from("announcements").update(data).eq("id", id);
        return { success: true };
      }),

    updateSchedule: adminProcedure
      .input(z.object({ id: z.number(), scheduleDate: z.string().optional(), time: z.string().optional(), label: z.enum(["이동", "행사", "현장", "내부", "회의"]).optional(), title: z.string().optional(), isCurrent: z.boolean().optional() }))
      .mutation(async ({ input }) => {
        const sb = getSupabase();
        if (!sb) throw new Error("DB 연결 실패");
        const { id, ...data } = input;
        await sb.from("schedules").update(data).eq("id", id);
        return { success: true };
      }),

    updatePolicyDoc: adminProcedure
      .input(z.object({ id: z.number(), title: z.string().optional(), category: z.enum(["심층리포트", "보도자료", "카드뉴스"]).optional(), description: z.string().optional() }))
      .mutation(async ({ input }) => {
        const sb = getSupabase();
        if (!sb) throw new Error("DB 연결 실패");
        const { id, ...data } = input;
        await sb.from("policy_docs").update(data).eq("id", id);
        return { success: true };
      }),

    seedSampleData: adminProcedure.mutation(async () => {
      const sb = getSupabase();
      if (!sb) throw new Error("DB 연결 실패");

      const results = { pledges: 0, announcements: 0, schedules: 0, policyDocs: 0, proposals: 0 };

      // 공지사항 시드 (기존 데이터 없을 때만)
      const { count: annCount } = await sb.from("announcements").select("id", { count: "exact", head: true });
      if (!annCount || annCount === 0) {
        const announcements = [
          { type: "공지", title: "김경수 경남도지사 후보, 디지털 상황실 오픈", content: "도민과 함께 만드는 새로운 경남을 위한 디지털 소통 공간을 개설합니다.", isNew: true },
          { type: "보도", title: "경남 우주항공산업 클러스터 구축 계획 발표", content: "사천·진주를 중심으로 우주항공 산업 생태계를 조성하여 글로벌 경쟁력을 확보합니다.", isNew: true },
          { type: "공지", title: "도민 제안함 운영 안내", content: "경남도의 정책에 대한 도민 여러분의 의견을 기다립니다. 접수된 제안은 검토 후 정책에 반영됩니다.", isNew: false },
          { type: "일정", title: "창원 현장 방문 및 지역 간담회 일정", content: "3월 넷째 주 창원 지역 주요 현안 점검 및 주민 간담회를 진행합니다.", isNew: true },
        ];
        await sb.from("announcements").insert(announcements);
        results.announcements = announcements.length;
      }

      // 일정 시드
      const { count: schCount } = await sb.from("schedules").select("id", { count: "exact", head: true });
      if (!schCount || schCount === 0) {
        const schedules = [
          { scheduleDate: "2026.03.24", time: "09:00", label: "내부" as const, title: "일일 브리핑 및 전략 회의", isCurrent: false },
          { scheduleDate: "2026.03.24", time: "10:30", label: "현장" as const, title: "창원 스마트공장 방문", isCurrent: true },
          { scheduleDate: "2026.03.24", time: "13:00", label: "행사" as const, title: "경남 청년 일자리 포럼 참석", isCurrent: false },
          { scheduleDate: "2026.03.24", time: "15:00", label: "이동" as const, title: "진주 이동", isCurrent: false },
          { scheduleDate: "2026.03.24", time: "16:00", label: "현장" as const, title: "진주 혁신도시 현안 점검", isCurrent: false },
          { scheduleDate: "2026.03.25", time: "09:30", label: "회의" as const, title: "교육·청년 정책 TF 회의", isCurrent: false },
          { scheduleDate: "2026.03.25", time: "14:00", label: "행사" as const, title: "김해 도민 간담회", isCurrent: false },
          { scheduleDate: "2026.03.25", time: "17:00", label: "내부" as const, title: "주간 일정 점검 회의", isCurrent: false },
        ];
        await sb.from("schedules").insert(schedules);
        results.schedules = schedules.length;
      }

      // 도민 제안 시드
      const { count: proCount } = await sb.from("citizen_proposals").select("id", { count: "exact", head: true });
      if (!proCount || proCount === 0) {
        const proposals = [
          { name: "김도민", region: "창원", category: "교통·인프라", title: "창원 도시철도 연장 건의", content: "마산-진해 구간까지 도시철도를 연장해주세요.", status: "검토중" as const },
          { name: "박경남", region: "김해", category: "교육·청년", title: "청년 창업 지원금 확대 요청", content: "초기 창업 자금 지원을 현재 2천만원에서 5천만원으로 확대 요청합니다.", status: "반영" as const },
          { name: "이하나", region: "통영", category: "환경·관광", title: "한려해상 관광 인프라 개선", content: "통영 한려해상 국립공원 관광 편의시설 확충을 건의합니다.", status: "접수" as const },
          { name: "정민수", region: "진주", category: "경제·일자리", title: "항공MRO산업 인력양성 제안", content: "사천 항공국가산업단지와 연계한 MRO 전문인력 양성 프로그램을 제안합니다.", status: "검토중" as const },
          { name: "최서연", region: "양산", category: "복지·의료", title: "농어촌 의료 순환 서비스 요청", content: "의료 접근성이 낮은 농어촌 지역에 이동 진료 서비스를 확대해주세요.", status: "접수" as const },
          { name: "한우리", region: "거창", category: "농림·수산", title: "스마트팜 보급 확대 건의", content: "고령 농가를 위한 스마트팜 기술 보급 및 교육 지원을 부탁합니다.", status: "반영" as const },
          { name: "윤경남", region: "거제", category: "문화·체육", title: "거제 해양레저 스포츠 단지 조성", content: "조선업 구조조정 이후 해양레저 관광으로의 전환을 위한 인프라 조성을 건의합니다.", status: "접수" as const },
        ];
        await sb.from("citizen_proposals").insert(proposals);
        results.proposals = proposals.length;
      }

      // 정책 자료 시드
      const { count: polCount } = await sb.from("policy_docs").select("id", { count: "exact", head: true });
      if (!polCount || polCount === 0) {
        const policyDocs = [
          { title: "경남 우주항공산업 클러스터 구축 전략", category: "심층리포트" as const, description: "사천·진주 중심 우주항공 산업 생태계 조성 로드맵" },
          { title: "경남 청년 일자리 종합대책", category: "심층리포트" as const, description: "5년간 청년 5만명 고용 창출을 위한 종합 전략" },
          { title: "스마트 농업 혁신 방안", category: "보도자료" as const, description: "농업의 디지털 전환을 위한 경남형 스마트팜 보급 계획" },
          { title: "경남 관광 브랜드 전략", category: "카드뉴스" as const, description: "한려해상·지리산 중심 관광 콘텐츠 개발 방향" },
          { title: "도민 체감형 교통 혁신안", category: "보도자료" as const, description: "광역 BRT 및 수요응답형 교통 시스템 도입 계획" },
          { title: "경남 균형발전 로드맵", category: "심층리포트" as const, description: "18개 시군 특성별 균형발전 전략 및 재정 지원 방안" },
          { title: "김경수의 경남 비전 2030", category: "카드뉴스" as const, description: "7대 핵심 공약 한눈에 보기" },
        ];
        await sb.from("policy_docs").insert(policyDocs);
        results.policyDocs = policyDocs.length;
      }

      // 공약 시드 (이미 21건이 있으므로 건너뛰기)
      const { count: plgCount } = await sb.from("pledges").select("id", { count: "exact", head: true });
      if (!plgCount || plgCount === 0) {
        const pledges = [
          { region: "창원", category: "경제·일자리", title: "창원 스마트제조 혁신허브 구축", description: "창원 국가산업단지 스마트공장 전환 지원", progress: 0, status: "공약" as const },
          { region: "진주", category: "우주항공·방산", title: "항공MRO산업 클러스터 조성", description: "사천 공군기지 연계 민간 항공정비 산업 육성", progress: 0, status: "공약" as const },
          { region: "김해", category: "교통·인프라", title: "김해 경전철 노선 확장", description: "김해-부산 연결 경전철 노선 확충", progress: 0, status: "공약" as const },
          { region: "통영", category: "환경·관광", title: "한려해상 생태관광 벨트 조성", description: "해양 생태 자원을 활용한 프리미엄 관광 개발", progress: 0, status: "공약" as const },
          { region: "양산", category: "복지·의료", title: "경남 권역 공공의료원 설립", description: "양산 부산대병원 연계 공공의료 강화", progress: 0, status: "공약" as const },
          { region: "거제", category: "경제·일자리", title: "거제 해양플랜트 재도약 프로젝트", description: "조선해양 산업 고도화 및 신사업 전환 지원", progress: 0, status: "공약" as const },
          { region: "사천", category: "우주항공·방산", title: "우주센터 유치 및 항공우주 R&D 허브", description: "KAI 연계 우주발사체 시험장 및 연구단지 조성", progress: 0, status: "공약" as const },
          { region: "밀양", category: "농림·수산", title: "경남 스마트팜 혁신밸리 확대", description: "밀양 스마트팜 혁신밸리 2단계 확장", progress: 0, status: "공약" as const },
          { region: "거창", category: "교육·청년", title: "경남 청년 도전 지원센터 설립", description: "청년 창업·취업 원스톱 지원 허브", progress: 0, status: "공약" as const },
          { region: "함양", category: "환경·관광", title: "지리산권 웰니스 관광특구 지정", description: "지리산 생태자원 활용 힐링·웰니스 관광 개발", progress: 0, status: "공약" as const },
          { region: "남해", category: "농림·수산", title: "남해 수산물 프리미엄 브랜드화", description: "남해안 수산물 가공·유통 혁신 및 수출 지원", progress: 0, status: "공약" as const },
          { region: "하동", category: "문화·체육", title: "섬진강 문화관광 벨트 조성", description: "하동 녹차·섬진강 테마 문화관광 콘텐츠 개발", progress: 0, status: "공약" as const },
          { region: "산청", category: "복지·의료", title: "한방바이오 산업 클러스터 육성", description: "산청 한방약초 자원 활용 바이오 헬스케어 산업 육성", progress: 0, status: "공약" as const },
          { region: "합천", category: "문화·체육", title: "합천 영상테마파크 확장", description: "K-콘텐츠 촬영 인프라 확대 및 관광 연계", progress: 0, status: "공약" as const },
          { region: "의령", category: "농림·수산", title: "의령 친환경 농업특구 조성", description: "유기농·친환경 농산물 생산·유통 기반 구축", progress: 0, status: "공약" as const },
          { region: "함안", category: "교통·인프라", title: "경남 내륙 물류허브 구축", description: "함안 교통 요충지 활용 스마트 물류센터 조성", progress: 0, status: "공약" as const },
          { region: "창녕", category: "환경·관광", title: "우포늪 생태관광 세계화", description: "람사르 습지 우포늪 국제 생태관광지 조성", progress: 0, status: "공약" as const },
          { region: "고성", category: "환경·관광", title: "공룡세계엑스포 상설화", description: "고성 공룡 자원 활용 상설 테마파크 조성", progress: 0, status: "공약" as const },
          { region: "창원", category: "교육·청년", title: "경남 AI·SW 인재양성센터", description: "경남대·창원대 연계 AI 전문인력 양성 프로그램", progress: 0, status: "공약" as const },
          { region: "김해", category: "복지·의료", title: "김해 어린이 전문병원 설립", description: "경남 최초 공공 어린이 전문 의료기관 설립", progress: 0, status: "공약" as const },
          { region: "진주", category: "교육·청년", title: "진주 혁신도시 2단계 활성화", description: "공공기관 추가 이전 및 혁신도시 정주여건 개선", progress: 0, status: "공약" as const },
        ];
        await sb.from("pledges").insert(pledges);
        results.pledges = pledges.length;
      }

      return { success: true, results };
    }),
  }),
});

export type AppRouter = typeof appRouter;
