/**
 * Layout Component — Civic Premium 디자인 시스템
 * 모바일: 하단 플로팅 탭 바 + 미니 헤더
 * PC: 좌측 사이드바(네이비 그라데이션 헤더) + 탑 바
 */
import { useLocation } from "wouter";
import {
  Home,
  MapPin,
  Clock,
  MessageSquare,
  BookOpen,
  User,
  Shield,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

const navItems = [
  {
    id: "home",
    path: "/",
    icon: Home,
    label: "디지털 상황실",
    sublabel: "공지 · 일정 · 퀵링크",
    badge: null,
    mobileLabel: "홈",
  },
  {
    id: "profile",
    path: "/profile",
    icon: User,
    label: "후보 프로필",
    sublabel: "경력 · 공약 · 가치관",
    badge: null,
    mobileLabel: "프로필",
  },
  {
    id: "pledges",
    path: "/pledges",
    icon: MapPin,
    label: "18개 시·군 공약",
    sublabel: "원클릭 탐색",
    badge: "18",
    mobileLabel: "공약",
  },
  {
    id: "daily",
    path: "/daily",
    icon: Clock,
    label: "김경수의 하루",
    sublabel: "일정 · 투명성",
    badge: null,
    mobileLabel: "하루",
  },
  {
    id: "proposals",
    path: "/proposals",
    icon: MessageSquare,
    label: "도민 제안함",
    sublabel: "양방향 소통",
    badge: null,
    mobileLabel: "제안",
  },
  {
    id: "policy",
    path: "/policy",
    icon: BookOpen,
    label: "정책 자료실",
    sublabel: "아카이브 허브",
    badge: null,
    mobileLabel: "정책",
  },
];

const pageTitles: Record<string, string> = {
  "/": "디지털 상황실",
  "/profile": "후보 프로필",
  "/pledges": "18개 시·군 공약",
  "/daily": "김경수의 하루",
  "/proposals": "도민 제안함",
  "/policy": "정책 자료실",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const adminUser = isAuthenticated && user?.role === "admin";

  const currentTitle = pageTitles[location] || "디지털 상황실";

  const electionDate = new Date("2026-06-03");
  const today = new Date();
  const diffTime = electionDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F8FAFB" }}>
      {/* ─── Sidebar (PC only) — Full Navy ─── */}
      <aside
        className="hidden md:flex flex-col w-[240px] h-full shrink-0 relative overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #0C1E3A 0%, #0F2847 40%, #122E52 100%)",
        }}
      >
        {/* Subtle dot texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "16px 16px",
          }}
        />

        {/* Candidate header */}
        <div className="relative px-5 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 ring-2 ring-white/15 shadow-lg">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663275956251/2tf7d959bKmS3eN22yndrr/kimkyungsu-profile_cbc0ddef.png"
                alt="김경수 후보"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="min-w-0">
              <div className="text-[15px] font-bold text-white tracking-tight">김경수</div>
              <div className="text-[11px] font-medium" style={{ color: "rgba(147,197,253,0.7)" }}>
                경남도지사 후보
              </div>
            </div>
          </div>
          <div className="mt-3.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-badge" />
              <span className="text-[10px] font-medium" style={{ color: "rgba(147,197,253,0.5)" }}>
                상황실 운영 중
              </span>
            </div>
            <div className="dday-badge px-2.5 py-1 rounded-md text-[11px] font-extrabold tracking-tight">
              D-{diffDays}
            </div>
          </div>
        </div>

        {/* Section label */}
        <div className="relative px-5 pt-5 pb-2">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{ color: "rgba(148,163,184,0.5)" }}
          >
            메뉴
          </span>
        </div>

        {/* Nav items */}
        <nav className="relative flex-1 px-3 py-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="sidebar-nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left mb-0.5"
                style={{
                  background: isActive
                    ? "rgba(37,99,235,0.15)"
                    : "transparent",
                  transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
                }}
                onMouseOver={(e) => {
                  if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
                onMouseOut={(e) => {
                  if (!isActive) e.currentTarget.style.background = "transparent";
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, #2563EB, #3B82F6)"
                      : "rgba(255,255,255,0.06)",
                    boxShadow: isActive ? "0 2px 8px rgba(37,99,235,0.3)" : "none",
                  }}
                >
                  <Icon
                    size={15}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    style={{ color: isActive ? "#FFFFFF" : "rgba(148,163,184,0.7)" }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[13px] font-semibold truncate"
                    style={{ color: isActive ? "#FFFFFF" : "rgba(203,213,225,0.8)" }}
                  >
                    {item.label}
                  </div>
                  <div
                    className="text-[10px] truncate"
                    style={{ color: isActive ? "rgba(147,197,253,0.7)" : "rgba(148,163,184,0.4)" }}
                  >
                    {item.sublabel}
                  </div>
                </div>
                {item.badge && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0"
                    style={{
                      background: isActive ? "#2563EB" : "rgba(255,255,255,0.08)",
                      color: isActive ? "#FFFFFF" : "rgba(148,163,184,0.6)",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div
          className="relative px-4 py-3 space-y-2"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          {adminUser && (
            <button
              onClick={() => navigate("/admin")}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                color: "rgba(147,197,253,0.7)",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(37,99,235,0.15)";
                e.currentTarget.style.borderColor = "rgba(37,99,235,0.3)";
                e.currentTarget.style.color = "#93C5FD";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                e.currentTarget.style.color = "rgba(147,197,253,0.7)";
              }}
            >
              <Shield size={13} />
              관리자 페이지
            </button>
          )}
          <div className="text-[10px] px-1 font-medium" style={{ color: "rgba(148,163,184,0.3)" }}>
            © 2026 김경수 선거캠프
          </div>
        </div>
      </aside>

      {/* ─── Main content area ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header bar */}
        <header
          className="flex items-center gap-3 px-4 md:px-6 shrink-0 bg-white"
          style={{
            borderBottom: "1px solid #EEF2F6",
            height: "52px",
          }}
        >
          {/* Mobile: 후보 미니 프로필 */}
          <div className="flex md:hidden items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 shadow-sm ring-1 ring-black/5">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663275956251/2tf7d959bKmS3eN22yndrr/kimkyungsu-profile_cbc0ddef.png"
                alt="김경수 후보"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="min-w-0">
              <span className="text-[13px] font-bold block leading-tight" style={{ color: "#0C1E3A" }}>
                {currentTitle}
              </span>
            </div>
          </div>

          {/* PC: 페이지 타이틀 */}
          <div className="hidden md:flex items-center gap-3">
            <span className="text-[15px] font-bold tracking-tight" style={{ color: "#0C1E3A" }}>
              {currentTitle}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Live indicator - PC */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "#F8FAFC" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-badge" />
              <span className="text-[11px] font-medium" style={{ color: "#64748B" }}>
                2026 경남도지사 선거
              </span>
            </div>
            {/* D-Day */}
            <div className="dday-badge px-3 py-1.5 rounded-lg text-xs font-extrabold">
              D-{diffDays}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar content-bg has-bottom-nav md:!pb-0">
          {children}
        </main>

        {/* Footer - PC only */}
        <div
          className="hidden md:flex items-center px-6 py-2.5 text-[11px] font-medium shrink-0 bg-white"
          style={{ borderTop: "1px solid #EEF2F6", color: "#94A3B8" }}
        >
          <span>© 2026 김경수 선거캠프 · 경남도지사 후보</span>
        </div>
      </div>

      {/* ─── Mobile bottom navigation ─── */}
      <nav
        className="bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderTop: "1px solid rgba(238,242,246,0.8)",
        }}
      >
        <div className="flex items-center justify-around px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="bottom-nav-item flex flex-col items-center justify-center py-2 flex-1 min-w-0"
              >
                <div
                  className="flex items-center justify-center rounded-xl transition-all duration-200"
                  style={{
                    width: isActive ? "40px" : "32px",
                    height: isActive ? "24px" : "24px",
                    background: isActive ? "#EFF6FF" : "transparent",
                  }}
                >
                  <Icon
                    size={isActive ? 18 : 19}
                    strokeWidth={isActive ? 2.4 : 1.6}
                    style={{ color: isActive ? "#2563EB" : "#94A3B8" }}
                  />
                </div>
                <span
                  className="text-[10px] mt-0.5 truncate font-semibold"
                  style={{
                    color: isActive ? "#2563EB" : "#94A3B8",
                  }}
                >
                  {item.mobileLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
