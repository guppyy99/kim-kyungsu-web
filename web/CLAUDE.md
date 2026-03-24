# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

"김경수 디지털 상황실" — 공약, 일정, 공지사항, 도민 제안, 정책 자료 등 공개 페이지와 관리자 대시보드를 갖춘 한국 정치 캠페인/거버넌스 웹 애플리케이션. React 19 + Express + tRPC + Supabase 스택.

## 빠른 시작 (로컬 개발)

```bash
cd web
cp .env.example .env          # SUPABASE_URL, SUPABASE_ANON_KEY, JWT_SECRET 입력
pnpm install
pnpm dev                       # http://localhost:3000
```

**개발 모드 관리자 로그인:** `http://localhost:3000/api/dev/login` 접속 → 즉시 관리자 세션 생성. `NODE_ENV=development`일 때만 활성화, 프로덕션에서는 자동 비활성화.

**일반 관리자 로그인:** `/admin/login` → 아이디/비밀번호.

## 명령어

모든 명령어는 `web/` 디렉토리에서 실행:

- **개발 서버:** `pnpm dev` — Express + Vite HMR (tsx watch)
- **빌드:** `pnpm build` — 클라이언트 → `dist/public`, 서버 → `dist/index.js`
- **프로덕션 실행:** `pnpm start` — `NODE_ENV=production node dist/index.js`
- **타입 체크:** `pnpm check` — `tsc --noEmit`
- **포맷팅:** `pnpm format` — Prettier
- **테스트:** `pnpm test` — Vitest (서버 전용, Node 환경)
- **단일 테스트:** `pnpm vitest run server/path/to/file.test.ts`

## 아키텍처

### 디렉토리 구조

```
web/
├── client/     → React 19 SPA (Vite, Tailwind v4, wouter)
├── server/     → Express API 서버 (tRPC, JWT 인증)
│   └── _core/  → 서버 핵심 (인증, 쿠키, OAuth, devAuth, Vite 설정)
├── shared/     → 클라이언트/서버 공유 타입 및 상수
├── drizzle/    → PostgreSQL 스키마 정의 (Drizzle ORM, 타입 생성용)
└── .env        → 환경 변수 (gitignore 대상)
```

### 경로 별칭

- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets/*` → `attached_assets/*`

### 클라이언트 (`client/src/`)

- **라우터:** wouter (react-router 아님). `App.tsx`에서 `PublicRouter`와 `AdminRouter` 두 개의 라우트 트리 정의.
- **API:** `lib/trpc.ts`의 tRPC React Query 클라이언트. 엔드포인트 `/api/trpc`. superjson 트랜스포머.
- **UI:** shadcn/ui (new-york 스타일) + Radix 프리미티브. `components/ui/`에 위치.
- **스타일링:** Tailwind CSS v4 (`@tailwindcss/vite`). 화이트 톤 베이스 + 블루(#2563EB) 액센트. CSS 변수는 `index.css`에 정의.
- **폰트:** Pretendard (한국어 최적화)
- **자동 로그아웃:** 관리자 패널 10분 비활동 → 경고 토스트 → 자동 로그아웃.

### 서버 (`server/`)

- **진입점:** `_core/index.ts` — Express 앱. 개발 모드에서는 Vite HMR, 프로덕션에서는 정적 파일 서빙.
- **tRPC:** `_core/trpc.ts`에서 `publicProcedure`, `protectedProcedure`, `adminProcedure` 3가지 프로시저 정의.
- **라우트:** `routers.ts` 단일 파일에 모든 API. `AppRouter` 타입을 클라이언트에서 import하여 엔드투엔드 타입 안전성 확보.
- **인증 (3가지 방식):**
  - 개발 모드: `GET /api/dev/login` → 즉시 관리자 세션 (`_core/devAuth.ts`, 개발 환경 전용)
  - 관리자 로그인: 아이디/비밀번호 (SHA256 + salt) → JWT 쿠키
  - OAuth: Manus 플랫폼 OAuth 플로우 (프로덕션, `_core/oauth.ts` + `_core/sdk.ts`)
- **데이터베이스:** `@supabase/supabase-js` REST API 클라이언트 사용. `db.ts`의 `getSupabase()`가 SupabaseClient 반환. `SUPABASE_URL`/`SUPABASE_ANON_KEY` 미설정 시 null 반환, 라우트가 빈 데이터로 정상 응답. `drizzle/schema.ts`는 PostgreSQL 스키마 정의 및 타입 생성용으로 유지.
- **쿠키:** `_core/cookies.ts` — localhost에서는 `sameSite=lax`, 프로덕션에서는 `sameSite=none` + `secure=true`.
- **파일 저장:** Manus 스토리지 프록시 (`storage.ts`). 환경 변수 없으면 업로드 시 에러 (정상 처리).
- **알림:** `_core/notification.ts` — Manus 알림 서비스. 연결 불가 시 false 반환.

### 공유 (`shared/`)

- `@shared/types` — Drizzle 스키마 타입 재export
- `@shared/const` — 쿠키 이름(`app_session_id`), 에러 메시지, 타임아웃 상수
- `@shared/_core/errors.ts` — 커스텀 `HttpError` 클래스

## 환경 변수

`.env.example` 참고. 주요 변수:

| 변수 | 필수 | 설명 |
|------|------|------|
| `SUPABASE_URL` | O | Supabase 프로젝트 URL |
| `SUPABASE_ANON_KEY` | O | Supabase anon API 키 |
| `JWT_SECRET` | O | JWT 세션 서명 키 |
| `VITE_APP_ID` | O | 앱 식별자 (개발 시 아무 값 OK) |
| `OAUTH_SERVER_URL` | 프로덕션만 | Manus OAuth 서버 URL |
| `VITE_OAUTH_PORTAL_URL` | 프로덕션만 | OAuth 포털 URL (클라이언트용) |
| `OWNER_OPEN_ID` | - | 자동 관리자 승격 대상 openId |
| `BUILT_IN_FORGE_API_URL` | - | Manus 파일 저장소 URL |
| `BUILT_IN_FORGE_API_KEY` | - | Manus 파일 저장소 API 키 |
| `ADMIN_SETUP_KEY` | - | 최초 관리자 생성 키 (기본: `kimkyungsu2026!`) |
| `PORT` | - | 서버 포트 (기본: 3000) |
| `VITE_ANALYTICS_ENDPOINT` | - | Umami 분석 엔드포인트 (빈값이면 비활성) |
| `VITE_ANALYTICS_WEBSITE_ID` | - | Umami 웹사이트 ID |

## 개발 vs 프로덕션

| 항목 | 개발 (`pnpm dev`) | 프로덕션 (`pnpm start`) |
|------|-------------------|------------------------|
| 프론트엔드 | Vite HMR (실시간 반영) | `dist/public` 정적 서빙 |
| 인증 | `/api/dev/login` 간편 로그인 | OAuth + 관리자 로그인만 |
| 쿠키 | `sameSite=lax`, `secure=false` | `sameSite=none`, `secure=true` |
| OAuth | 불필요 (환경변수 없어도 동작) | `OAUTH_SERVER_URL` 필요 |
| DB | 없어도 서버 구동 (빈 데이터) | `SUPABASE_URL` + `SUPABASE_ANON_KEY` 필수 |

## 데이터베이스 (Supabase)

- **프로젝트:** `kim-kyungsu` (ap-northeast-1, ID: `grpzpsxcqmtilmzgrbve`)
- **연결 방식:** `@supabase/supabase-js` REST API 클라이언트 (PostgreSQL pooler 연결이 아닌 HTTP 기반). `server/db.ts`의 `getSupabase()` 사용.
- **스키마 정의:** `drizzle/schema.ts` — `pgTable` 사용. 타입 생성용으로 유지. 실제 DB 조작은 Supabase JS 클라이언트.
- **RLS:** 서버 사이드 전용이므로 모든 테이블 RLS 비활성화 상태.
- **테이블:** users, admin_accounts, uploaded_files, announcements, schedules, citizen_proposals, policy_docs, pledges
- **`updatedAt`:** PostgreSQL 트리거(`update_updated_at`)로 자동 갱신
- **시드 데이터:** MCP로 직접 삽입 완료. 관리자 대시보드에서 추가 시드 가능.

## 주요 패턴

- UI 텍스트, DB 값, 코드 주석에 **한국어** 사용 — 이 관례를 유지할 것.
- tRPC 입력 검증에 **Zod** 사용. **superjson**이 양쪽 트랜스포머.
- `routers.ts`에서 DB 조작 시 `getSupabase()` 호출 → null 체크 → Supabase JS 체이닝 (`.from().select().eq()` 등).
- 테스트는 `appRouter.createCaller(ctx)` 패턴. DB/스토리지/알림을 모킹, `TrpcContext` 타입의 목 유저로 컨텍스트 구성.
- wouter 라우터에 커스텀 패치 적용 (`patches/wouter@3.7.1.patch`) — `window.__WOUTER_ROUTES__` 디버깅용 노출.
- `getLoginUrl()` (`client/src/const.ts`)은 OAuth 환경변수 없으면 `/admin/login`으로 폴백.
- Analytics 스크립트(`index.html`)는 `VITE_ANALYTICS_ENDPOINT` 미설정 시 자동 비활성화.
