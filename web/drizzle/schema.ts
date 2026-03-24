import { boolean, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 10 }).default("user").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 업로드된 파일 메타데이터 테이블
 * 실제 파일 바이트는 S3에 저장, 여기서는 메타데이터만 관리
 */
export const uploadedFiles = pgTable("uploaded_files", {
  id: serial("id").primaryKey(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  mimeType: varchar("mimeType", { length: 128 }),
  fileSize: integer("fileSize"),
  category: varchar("category", { length: 10 }).default("other").notNull(),
  uploadedBy: integer("uploadedBy"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type UploadedFile = typeof uploadedFiles.$inferSelect;
export type InsertUploadedFile = typeof uploadedFiles.$inferInsert;

/**
 * 공지사항 테이블
 */
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 10 }).default("공지").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content"),
  isNew: boolean("isNew").default(true).notNull(),
  publishedAt: timestamp("publishedAt", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;

/**
 * 일정 테이블
 */
export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  scheduleDate: varchar("scheduleDate", { length: 10 }).notNull(), // YYYY.MM.DD
  time: varchar("time", { length: 5 }).notNull(), // HH:MM
  label: varchar("label", { length: 10 }).default("행사").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  isCurrent: boolean("isCurrent").default(false).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = typeof schedules.$inferInsert;

/**
 * 도민 제안 테이블
 */
export const citizenProposals = pgTable("citizen_proposals", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  region: varchar("region", { length: 50 }),
  category: varchar("category", { length: 50 }),
  title: varchar("title", { length: 300 }).notNull(),
  content: text("content").notNull(),
  status: varchar("status", { length: 10 }).default("접수").notNull(),
  attachmentUrl: text("attachmentUrl"),
  attachmentKey: varchar("attachmentKey", { length: 512 }),
  attachmentName: varchar("attachmentName", { length: 255 }),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type CitizenProposal = typeof citizenProposals.$inferSelect;
export type InsertCitenProposal = typeof citizenProposals.$inferInsert;

/**
 * 정책 자료 테이블
 */
export const policyDocs = pgTable("policy_docs", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  category: varchar("category", { length: 20 }).default("보도자료").notNull(),
  description: text("description"),
  fileUrl: text("fileUrl"),
  fileKey: varchar("fileKey", { length: 512 }),
  fileName: varchar("fileName", { length: 255 }),
  publishedAt: timestamp("publishedAt", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type PolicyDoc = typeof policyDocs.$inferSelect;
export type InsertPolicyDoc = typeof policyDocs.$inferInsert;

/**
 * 공약 테이블 (18개 시·군별 공약 DB)
 */
export const pledges = pgTable("pledges", {
  id: serial("id").primaryKey(),
  region: varchar("region", { length: 50 }).notNull(), // 시·군 이름
  category: varchar("category", { length: 50 }).notNull(), // 분야 (경제, 교육, 복지 등)
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  progress: integer("progress").default(0).notNull(), // 이행 진행률 0-100
  status: varchar("status", { length: 10 }).default("공약").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Pledge = typeof pledges.$inferSelect;
export type InsertPledge = typeof pledges.$inferInsert;

/**
 * 관리자 계정 테이블 (아이디/비밀번호 로그인)
 */
export const adminAccounts = pgTable("admin_accounts", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  displayName: varchar("displayName", { length: 100 }),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type AdminAccount = typeof adminAccounts.$inferSelect;
export type InsertAdminAccount = typeof adminAccounts.$inferInsert;
