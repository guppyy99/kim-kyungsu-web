#!/usr/bin/env node
/**
 * Vercel Build Output API를 사용한 빌드 스크립트
 *
 * .vercel/output/ 디렉토리에 배포 구조를 직접 생성:
 * - static/         → Vite 빌드 결과 (SPA)
 * - functions/      → esbuild 번들 (Express API)
 * - config.json     → 라우팅 설정
 */
import { cpSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEB = join(__dirname, "..");
const ROOT = join(WEB, "..");
const OUTPUT = join(ROOT, ".vercel", "output");

// 이전 빌드 결과 정리
rmSync(OUTPUT, { recursive: true, force: true });

// 1. Vite 클라이언트 빌드
console.log("1/4 Vite 클라이언트 빌드...");
execSync("npx vite build", { cwd: WEB, stdio: "inherit" });

// 2. esbuild API 번들링 (모든 의존성 포함, 자체 완결)
console.log("2/4 API 서버 번들링...");
const funcDir = join(OUTPUT, "functions", "api.func");
mkdirSync(funcDir, { recursive: true });
execSync(
  [
    "npx esbuild server/vercel-entry.ts",
    "--bundle",
    "--platform=node",
    "--format=esm",
    `--outfile=${join(funcDir, "index.mjs")}`,
    "--alias:@shared=./shared",
  ].join(" "),
  { cwd: WEB, stdio: "inherit" }
);

// 3. 정적 파일 복사
console.log("3/4 정적 파일 복사...");
cpSync(join(WEB, "dist", "public"), join(OUTPUT, "static"), {
  recursive: true,
});

// 4. 설정 파일 생성
console.log("4/4 설정 파일 생성...");

// 함수 런타임 설정
writeFileSync(
  join(funcDir, ".vc-config.json"),
  JSON.stringify(
    {
      runtime: "nodejs22.x",
      handler: "index.mjs",
      launcherType: "Nodejs",
      maxDuration: 30,
    },
    null,
    2
  )
);

// 라우팅 설정
writeFileSync(
  join(OUTPUT, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [
        {
          src: "/assets/(.*)",
          headers: {
            "Cache-Control": "public, max-age=31536000, immutable",
          },
          continue: true,
        },
        { handle: "filesystem" },
        { src: "/api/(.*)", dest: "/api" },
        { src: "/(.*)", dest: "/index.html" },
      ],
    },
    null,
    2
  )
);

console.log("✅ Vercel Build Output 생성 완료");
