/**
 * Home Page - 디지털 상황실 HOME
 * Design: 라이트 메인 + 블루 사이드바
 * 메인 콘텐츠: 밝은 화이트/라이트 그레이 톤
 * DB 연동: 공지사항, 일정 실시간 반영
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  Bell,
  Calendar,
  MapPin,
  Clock,
  MessageSquare,
  BookOpen,
  ExternalLink,
  ChevronRight,
  Loader2,
} from "lucide-react";

const quickLinks = [
  { id: "pledges", path: "/pledges", icon: MapPin, label: "18개시·군\n공약DB", color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
  { id: "daily", path: "/daily", icon: Clock, label: "김경수의\n하루", color: "#B45309", bg: "#FFFBEB", border: "#FDE68A" },
  { id: "proposals", path: "/proposals", icon: MessageSquare, label: "도민\n제안함", color: "#065F46", bg: "#ECFDF5", border: "#A7F3D0" },
  { id: "policy", path: "/policy", icon: BookOpen, label: "정책\n자료실", color: "#6D28D9", bg: "#F5F3FF", border: "#DDD6FE" },
];

// 공지 타입별 색상
const typeColors: Record<string, { color: string; bg: string }> = {
  "공지": { color: "#1D4ED8", bg: "#DBEAFE" },
  "보도": { color: "#92400E", bg: "#FEF3C7" },
  "긴급": { color: "#DC2626", bg: "#FEE2E2" },
  "일반": { color: "#475569", bg: "#F1F5F9" },
};

// 일정 타입별 색상
const scheduleTypeColors: Record<string, { color: string; bg: string }> = {
  "행사": { color: "#1D4ED8", bg: "#DBEAFE" },
  "현장": { color: "#065F46", bg: "#D1FAE5" },
  "이동": { color: "#64748B", bg: "#F1F5F9" },
  "내부": { color: "#64748B", bg: "#F1F5F9" },
  "회의": { color: "#6D28D9", bg: "#F5F3FF" },
};


export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // DB에서 공지사항 최신 4건 조회
  const { data: announcementsData, isLoading: annLoading } = trpc.announcements.list.useQuery();
  // DB에서 오늘 일정 조회
  const { data: schedulesData, isLoading: schLoading } = trpc.schedules.list.useQuery({});
  // DB에서 통계 (도민제안 건수)
  const { data: proposalStats } = trpc.proposals.list.useQuery();
  // DB에서 공약 건수
  const { data: pledgesData } = trpc.pledges.list.useQuery({});

  const today = new Date();
  const todayStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;

  const proposalCount = proposalStats?.length ?? 0;
  const pledgeCount = pledgesData?.length ?? 0;

  return (
    <div className="p-5 space-y-5">
      {/* Hero Banner */}
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          background: "#1B3A5C",
          boxShadow: "0 4px 20px rgba(27,58,92,0.18)",
        }}
      >
        {/* Background image */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663275956251/2tf7d959bKmS3eN22yndrr/hero-gyeongnam-CLCPX33ojfLHnx4qEbGuMw.webp)`,
            backgroundSize: "cover",
            backgroundPosition: "center right",
          }}
        />

        {/* ── 모바일 레이아웃 (sm 미만): 사진 상단 + 텍스트 하단 ── */}
        <div className="sm:hidden relative z-10">
          {/* 사진 영역 */}
          <div
            className="relative w-full overflow-hidden"
            style={{ height: "220px" }}
          >
            {/* 사진 위 그라데이션 오버레이 */}
            <div
              className="absolute inset-0 z-10"
              style={{
                background: "linear-gradient(to bottom, rgba(27,58,92,0.3) 0%, rgba(27,58,92,0.1) 40%, rgba(27,58,92,0.7) 85%, rgba(27,58,92,1) 100%)",
              }}
            />
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663275956251/2tf7d959bKmS3eN22yndrr/kimkyungsu-profile3_a89a09df.png"
              alt="김경수 후보"
              className="w-full h-full"
              style={{
                objectFit: "cover",
                objectPosition: "top center",
              }}
            />
            {/* LIVE 배지 - 사진 위 좌상단 */}
            <div className="absolute top-3 left-3 z-20">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{
                  background: "rgba(125,211,252,0.15)",
                  color: "#7DD3FC",
                  border: "1px solid rgba(125,211,252,0.3)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                LIVE · 디지털 상황실 운영 중
              </div>
            </div>
          </div>
          {/* 텍스트 영역 */}
          <div className="px-5 pt-3 pb-5">
            <h1 className="text-xl font-bold mb-1" style={{ color: "#F0F8FF" }}>
              다시 뛰는 경남! 김경수와 함께!
            </h1>
            <p className="text-sm mb-4" style={{ color: "rgba(180,210,240,0.85)" }}>
              도민과 함께 만드는 경남 대전환
            </p>
            <div className="flex items-center gap-5 text-sm">
              {[
                { num: "18", label: "시·군 공약" },
                { num: String(pledgeCount > 0 ? pledgeCount : 95), label: "세부 공약" },
                { num: String(proposalCount > 0 ? proposalCount : 0), label: "도민 제안" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="font-bold text-lg" style={{ color: "#7DD3FC" }}>{stat.num}</span>
                  <span style={{ color: "rgba(160,200,240,0.75)" }}>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── PC 레이아웃 (sm 이상): 텍스트 좌 + 사진 우 ── */}
        <div
          className="hidden sm:flex relative z-10 items-center justify-between gap-4 p-6"
          style={{
            background: "linear-gradient(90deg, rgba(27,58,92,0.97) 40%, rgba(27,58,92,0.5) 100%)",
            minHeight: "180px",
          }}
        >
          {/* Left: text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium live-badge"
                style={{
                  background: "rgba(125,211,252,0.15)",
                  color: "#7DD3FC",
                  border: "1px solid rgba(125,211,252,0.3)",
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                LIVE · 디지털 상황실 운영 중
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: "#F0F8FF" }}>
              다시 뛰는 경남! 김경수와 함께!
            </h1>
            <p className="text-sm mb-5" style={{ color: "rgba(180,210,240,0.85)" }}>
              도민과 함께 만드는 경남 대전환
            </p>
            <div className="flex items-center gap-5 text-sm">
              {[
                { num: "18", label: "시·군 공약" },
                { num: String(pledgeCount > 0 ? pledgeCount : 95), label: "세부 공약" },
                { num: String(proposalCount > 0 ? proposalCount : 0), label: "도민 제안" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="font-bold text-lg" style={{ color: "#7DD3FC" }}>{stat.num}</span>
                  <span style={{ color: "rgba(160,200,240,0.75)" }}>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Right: candidate photo */}
          <div className="shrink-0" style={{ marginBottom: "-24px", marginRight: "-8px" }}>
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663275956251/2tf7d959bKmS3eN22yndrr/kimkyungsu-profile3_a89a09df.png"
              alt="김경수 후보"
              style={{
                height: "190px",
                width: "auto",
                objectFit: "cover",
                objectPosition: "top",
                borderRadius: "12px 12px 0 0",
                filter: "drop-shadow(0 -4px 16px rgba(0,0,0,0.35))",
              }}
            />
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xs font-semibold mb-2.5 uppercase tracking-wide" style={{ color: "#94A3B8" }}>
          빠른 이동
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="notion-card flex flex-col items-center gap-2 p-3.5 rounded-xl text-center"
                style={{
                  background: item.bg,
                  border: `1px solid ${item.border}`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: item.color + "18" }}
                >
                  <Icon size={17} style={{ color: item.color }} />
                </div>
                <span className="text-xs font-semibold whitespace-pre-line leading-tight" style={{ color: item.color }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Announcements + Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Announcements - DB 연동 */}
        <div
          className="rounded-xl p-4"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2EAF4",
            boxShadow: "0 1px 6px rgba(27,58,92,0.06)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell size={14} style={{ color: "#64748B" }} />
              <span className="text-sm font-semibold" style={{ color: "#1E3A5F" }}>
                공지사항
              </span>
            </div>
            <button
              onClick={() => navigate("/announcements")}
              className="flex items-center gap-1 text-xs"
              style={{ color: "#3B82F6" }}
            >
              전체보기 <ChevronRight size={12} />
            </button>
          </div>

          {annLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 size={18} className="animate-spin" style={{ color: "#94A3B8" }} />
            </div>
          ) : announcementsData && announcementsData.length > 0 ? (
            <div className="space-y-2">
              {announcementsData.map((item) => {
                const tc = typeColors[item.type] ?? typeColors["일반"];
                const createdDate = new Date(item.createdAt);
                const dateStr = `${createdDate.getFullYear()}.${String(createdDate.getMonth() + 1).padStart(2, "0")}.${String(createdDate.getDate()).padStart(2, "0")}`;
                const isNew = (Date.now() - createdDate.getTime()) < 3 * 24 * 60 * 60 * 1000;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/announcements/${item.id}`)}
                    className="w-full flex items-start gap-2 py-2 border-b last:border-b-0 text-left"
                    style={{ borderColor: "#F1F5F9" }}
                  >
                    <span
                      className="text-xs px-1.5 py-0.5 rounded shrink-0 mt-0.5 font-medium"
                      style={{ background: tc.bg, color: tc.color }}
                    >
                      {item.type}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs truncate" style={{ color: "#334155" }}>
                          {item.title}
                        </p>
                        {isNew && (
                          <span
                            className="text-xs px-1 py-0.5 rounded shrink-0 font-bold"
                            style={{ background: "#FEE2E2", color: "#DC2626", fontSize: "9px" }}
                          >
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>
                        {dateStr}
                      </p>
                    </div>
                  </button>
                );
              })}

            </div>
          ) : (
            <div className="text-center py-6 text-xs" style={{ color: "#94A3B8" }}>
              등록된 공지사항이 없습니다.
            </div>
          )}
        </div>

        {/* Today's Schedule - DB 연동 */}
        <div
          className="rounded-xl p-4"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2EAF4",
            boxShadow: "0 1px 6px rgba(27,58,92,0.06)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar size={14} style={{ color: "#64748B" }} />
              <span className="text-sm font-semibold" style={{ color: "#1E3A5F" }}>
                오늘의 일정
              </span>
            </div>
            <span className="text-xs" style={{ color: "#94A3B8" }}>
              {todayStr}
            </span>
          </div>

          {schLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 size={18} className="animate-spin" style={{ color: "#94A3B8" }} />
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
                    className="flex items-center gap-3 py-1.5 px-2 rounded-lg"
                    style={{
                      background: isCurrent ? "#EFF6FF" : "transparent",
                      border: isCurrent ? "1px solid #BFDBFE" : "1px solid transparent",
                    }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: isCurrent ? "#3B82F6" : "#CBD5E1" }}
                    />
                    <span className="text-xs font-mono font-bold w-10 shrink-0" style={{ color: "#3B82F6" }}>
                      {timeStr}
                    </span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded shrink-0"
                      style={{ background: tc.bg, color: tc.color }}
                    >
                      {item.label}
                    </span>
                    <span className="text-xs flex-1" style={{ color: isCurrent ? "#1D4ED8" : "#475569", fontWeight: isCurrent ? 600 : 400 }}>
                      {item.title}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-xs" style={{ color: "#94A3B8" }}>
              등록된 일정이 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* CTA Banner */}
      <div
        className="rounded-xl p-4 flex items-center justify-between"
        style={{
          background: "linear-gradient(135deg, #EFF6FF, #F0FDF4)",
          border: "1px solid #BFDBFE",
        }}
      >
        <div className="flex items-center gap-3">
          <MessageSquare size={18} style={{ color: "#3B82F6" }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: "#1E3A5F" }}>
              도민 여러분의 목소리를 듣습니다
            </p>
            <p className="text-xs" style={{ color: "#64748B" }}>
              제안 및 아이디어를 자유롭게 남겨주세요
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/proposals")}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold shrink-0"
          style={{
            background: "#1D4ED8",
            color: "white",
          }}
        >
          제안하기 <ExternalLink size={12} />
        </button>
      </div>
    </div>
  );
}
