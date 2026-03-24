/**
 * Home Page — 디지털 상황실 HOME
 * Civic Premium Design: 네이비 히어로 + 엘리베이티드 카드 + 스태거 애니메이션
 */
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  Bell,
  Calendar,
  MapPin,
  Clock,
  MessageSquare,
  BookOpen,
  ArrowRight,
  ChevronRight,
  Loader2,
} from "lucide-react";

const quickLinks = [
  {
    id: "pledges",
    path: "/pledges",
    icon: MapPin,
    label: "시·군 공약",
    desc: "18개 지역별 맞춤",
    gradient: "linear-gradient(135deg, #1E40AF, #3B82F6)",
  },
  {
    id: "daily",
    path: "/daily",
    icon: Clock,
    label: "김경수의 하루",
    desc: "일정 투명 공개",
    gradient: "linear-gradient(135deg, #0F766E, #14B8A6)",
  },
  {
    id: "proposals",
    path: "/proposals",
    icon: MessageSquare,
    label: "도민 제안함",
    desc: "양방향 소통 채널",
    gradient: "linear-gradient(135deg, #7C3AED, #A78BFA)",
  },
  {
    id: "policy",
    path: "/policy",
    icon: BookOpen,
    label: "정책 자료실",
    desc: "아카이브 허브",
    gradient: "linear-gradient(135deg, #B45309, #F59E0B)",
  },
];

const typeColors: Record<string, { color: string; bg: string; dot: string }> = {
  "공지": { color: "#1D4ED8", bg: "#EFF6FF", dot: "#2563EB" },
  "보도": { color: "#92400E", bg: "#FFFBEB", dot: "#F59E0B" },
  "긴급": { color: "#B91C1C", bg: "#FEF2F2", dot: "#EF4444" },
  "일반": { color: "#475569", bg: "#F8FAFC", dot: "#94A3B8" },
};

const scheduleTypeColors: Record<string, { color: string; bg: string }> = {
  "행사": { color: "#1D4ED8", bg: "#EFF6FF" },
  "현장": { color: "#047857", bg: "#ECFDF5" },
  "이동": { color: "#475569", bg: "#F8FAFC" },
  "내부": { color: "#475569", bg: "#F8FAFC" },
  "회의": { color: "#6D28D9", bg: "#F5F3FF" },
};


export default function Home() {
  const [, navigate] = useLocation();

  const { data: announcementsData, isLoading: annLoading } = trpc.announcements.list.useQuery();
  const { data: schedulesData, isLoading: schLoading } = trpc.schedules.list.useQuery({});
  const { data: proposalStats } = trpc.proposals.list.useQuery();
  const { data: pledgesData } = trpc.pledges.list.useQuery({});

  const today = new Date();
  const todayStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;

  const proposalCount = proposalStats?.length ?? 0;
  const pledgeCount = pledgesData?.length ?? 0;

  const stats = [
    { num: "18", label: "시·군" },
    { num: String(pledgeCount > 0 ? pledgeCount : 95), label: "세부 공약" },
    { num: String(proposalCount > 0 ? proposalCount : 0), label: "도민 제안" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5 md:space-y-6 stagger-in">
      {/* ═══ Hero Banner ═══ */}
      <div
        className="hero-shimmer relative rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0C1E3A 0%, #1E3A5F 40%, #1E40AF 80%, #2563EB 100%)",
        }}
      >
        {/* Background photo */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663275956251/2tf7d959bKmS3eN22yndrr/hero-gyeongnam-CLCPX33ojfLHnx4qEbGuMw.webp)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            mixBlendMode: "luminosity",
          }}
        />
        {/* Diagonal accent */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(170deg, transparent 55%, rgba(37,99,235,0.15) 100%)",
          }}
        />

        {/* ── 모바일 ── */}
        <div className="sm:hidden relative z-10">
          <div className="relative w-full overflow-hidden" style={{ height: "210px" }}>
            <div
              className="absolute inset-0 z-10"
              style={{
                background: "linear-gradient(to bottom, transparent 20%, rgba(12,30,58,0.6) 70%, rgba(12,30,58,0.95) 100%)",
              }}
            />
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663275956251/2tf7d959bKmS3eN22yndrr/kimkyungsu-profile3_a89a09df.png"
              alt="김경수 후보"
              className="w-full h-full object-cover"
              style={{ objectPosition: "top center" }}
            />
            {/* LIVE badge */}
            <div className="absolute top-3.5 left-3.5 z-20">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold live-badge"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.9)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                LIVE
              </div>
            </div>
          </div>
          {/* Text over gradient */}
          <div className="px-5 pt-2 pb-5">
            <p className="text-blue-300/70 text-[11px] font-bold tracking-wider uppercase mb-1">
              2026 경남도지사 선거
            </p>
            <h1 className="text-xl font-extrabold text-white leading-snug tracking-tight mb-1">
              다시 뛰는 경남!
              <br />
              <span className="text-blue-300">김경수</span>와 함께
            </h1>
            <p className="text-[13px] text-blue-200/50 font-medium mb-4">
              도민과 함께 만드는 경남 대전환
            </p>
            {/* Stats row */}
            <div className="flex items-center gap-0">
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center">
                  <div className="text-center px-3">
                    <div className="stat-num text-lg font-extrabold text-white">{stat.num}</div>
                    <div className="text-[10px] text-blue-300/50 font-medium">{stat.label}</div>
                  </div>
                  {i < stats.length - 1 && (
                    <div className="w-px h-6 bg-white/10" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── PC ── */}
        <div
          className="hidden sm:flex relative z-10 items-end justify-between gap-6"
          style={{ minHeight: "200px", padding: "32px 32px 0" }}
        >
          <div className="flex-1 min-w-0 pb-8">
            {/* LIVE + election label */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold live-badge"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.85)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                LIVE · 상황실 운영 중
              </div>
              <span className="text-[11px] font-bold text-blue-300/40 uppercase tracking-wider">
                2026 경남도지사 선거
              </span>
            </div>
            {/* Title */}
            <h1
              className="text-[28px] font-extrabold text-white leading-tight mb-2"
              style={{ letterSpacing: "-0.025em" }}
            >
              다시 뛰는 경남!{" "}
              <span className="text-blue-300">김경수</span>와 함께!
            </h1>
            <p className="text-sm text-blue-200/50 font-medium mb-7">
              도민과 함께 만드는 경남 대전환
            </p>
            {/* Stats */}
            <div className="flex items-center gap-0">
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center">
                  <div className="pr-6 pl-1">
                    <div className="stat-num text-2xl font-extrabold text-white leading-none">{stat.num}</div>
                    <div className="text-[11px] text-blue-300/40 font-semibold mt-1">{stat.label}</div>
                  </div>
                  {i < stats.length - 1 && (
                    <div className="w-px h-8 bg-white/10 mr-5" />
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Candidate photo */}
          <div className="shrink-0" style={{ marginRight: "-8px" }}>
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663275956251/2tf7d959bKmS3eN22yndrr/kimkyungsu-profile3_a89a09df.png"
              alt="김경수 후보"
              className="block"
              style={{
                height: "220px",
                width: "auto",
                objectFit: "cover",
                objectPosition: "top",
                borderRadius: "16px 16px 0 0",
                filter: "drop-shadow(0 -8px 32px rgba(0,0,0,0.3))",
              }}
            />
          </div>
        </div>
      </div>

      {/* ═══ Quick Links ═══ */}
      <div>
        <div className="section-header mb-3">
          <span className="text-[13px] font-bold" style={{ color: "#0C1E3A" }}>
            빠른 이동
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 md:gap-3">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="quick-link card-flat flex flex-col items-start gap-3 p-4 text-left"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ background: item.gradient }}
                >
                  <Icon size={16} color="#FFFFFF" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-[13px] font-bold" style={{ color: "#0C1E3A" }}>
                    {item.label}
                  </div>
                  <div className="text-[11px] font-medium mt-0.5" style={{ color: "#94A3B8" }}>
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ Announcements + Schedule ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {/* ── Announcements ── */}
        <div className="card-elevated p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="section-header">
              <div className="flex items-center gap-2">
                <Bell size={14} style={{ color: "#2563EB" }} />
                <span className="text-[13px] font-bold" style={{ color: "#0C1E3A" }}>
                  공지사항
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate("/announcements")}
              className="flex items-center gap-0.5 text-[11px] font-bold transition-colors"
              style={{ color: "#2563EB" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#1D4ED8")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#2563EB")}
            >
              전체보기 <ChevronRight size={13} />
            </button>
          </div>

          {annLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={20} className="animate-spin" style={{ color: "#CBD5E1" }} />
            </div>
          ) : announcementsData && announcementsData.length > 0 ? (
            <div className="space-y-0">
              {announcementsData.map((item, idx) => {
                const tc = typeColors[item.type] ?? typeColors["일반"];
                const createdDate = new Date(item.createdAt);
                const dateStr = `${createdDate.getFullYear()}.${String(createdDate.getMonth() + 1).padStart(2, "0")}.${String(createdDate.getDate()).padStart(2, "0")}`;
                const isNew = Date.now() - createdDate.getTime() < 3 * 24 * 60 * 60 * 1000;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/announcements/${item.id}`)}
                    className="w-full flex items-center gap-3 py-3 text-left transition-colors hover:bg-slate-50/80 rounded-lg px-2 -mx-2"
                    style={{
                      borderBottom: idx < announcementsData.length - 1 ? "1px solid #F1F5F9" : "none",
                    }}
                  >
                    {/* Type dot */}
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: tc.dot }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0"
                          style={{ background: tc.bg, color: tc.color }}
                        >
                          {item.type}
                        </span>
                        <p className="text-[13px] font-medium truncate" style={{ color: "#1E293B" }}>
                          {item.title}
                        </p>
                        {isNew && (
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded-full shrink-0 font-extrabold uppercase"
                            style={{
                              background: "linear-gradient(135deg, #EF4444, #F97316)",
                              color: "#FFFFFF",
                            }}
                          >
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] mt-0.5 font-medium" style={{ color: "#94A3B8" }}>
                        {dateStr}
                      </p>
                    </div>
                    <ChevronRight size={14} className="shrink-0" style={{ color: "#CBD5E1" }} />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="text-[13px] font-medium" style={{ color: "#94A3B8" }}>
                등록된 공지사항이 없습니다
              </div>
            </div>
          )}
        </div>

        {/* ── Today's Schedule ── */}
        <div className="card-elevated p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="section-header">
              <div className="flex items-center gap-2">
                <Calendar size={14} style={{ color: "#2563EB" }} />
                <span className="text-[13px] font-bold" style={{ color: "#0C1E3A" }}>
                  오늘의 일정
                </span>
              </div>
            </div>
            <div
              className="px-2.5 py-1 rounded-md text-[11px] font-bold"
              style={{ background: "#F1F5F9", color: "#64748B" }}
            >
              {todayStr}
            </div>
          </div>

          {schLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={20} className="animate-spin" style={{ color: "#CBD5E1" }} />
            </div>
          ) : schedulesData && schedulesData.length > 0 ? (
            <div className="space-y-1">
              {schedulesData.map((item) => {
                const tc = scheduleTypeColors[item.label] ?? scheduleTypeColors["내부"];
                const timeStr = item.time ?? "00:00";
                const isCurrent = item.isCurrent;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all"
                    style={{
                      background: isCurrent
                        ? "linear-gradient(135deg, #EFF6FF, #DBEAFE)"
                        : "transparent",
                      border: isCurrent ? "1px solid #BFDBFE" : "1px solid transparent",
                    }}
                  >
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center shrink-0">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: isCurrent ? "#2563EB" : "#CBD5E1",
                          boxShadow: isCurrent ? "0 0 0 3px rgba(37,99,235,0.15)" : "none",
                        }}
                      />
                    </div>
                    <span
                      className="text-[12px] font-bold w-11 shrink-0 stat-num"
                      style={{ color: isCurrent ? "#1D4ED8" : "#64748B" }}
                    >
                      {timeStr}
                    </span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-md shrink-0 font-bold"
                      style={{ background: tc.bg, color: tc.color }}
                    >
                      {item.label}
                    </span>
                    <span
                      className="text-[13px] flex-1 truncate"
                      style={{
                        color: isCurrent ? "#1E40AF" : "#475569",
                        fontWeight: isCurrent ? 700 : 500,
                      }}
                    >
                      {item.title}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="text-[13px] font-medium" style={{ color: "#94A3B8" }}>
                등록된 일정이 없습니다
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ CTA Banner ═══ */}
      <div
        className="relative overflow-hidden rounded-2xl p-5 md:p-6"
        style={{
          background: "linear-gradient(135deg, #0C1E3A 0%, #1E3A5F 50%, #1E40AF 100%)",
        }}
      >
        {/* Pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <MessageSquare size={18} color="#93C5FD" />
            </div>
            <div className="min-w-0">
              <p className="text-[14px] md:text-[15px] font-bold text-white truncate">
                도민 여러분의 목소리를 듣습니다
              </p>
              <p className="text-[12px] text-blue-300/50 font-medium mt-0.5 truncate">
                제안 및 아이디어를 자유롭게 남겨주세요
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/proposals")}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[13px] font-bold shrink-0 transition-all"
            style={{
              background: "#FFFFFF",
              color: "#1E40AF",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
            }}
          >
            제안하기 <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
