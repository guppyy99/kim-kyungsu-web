/**
 * Layout Component - 노션 스타일 레이아웃
 * Design: 라이트 메인 + 블루 사이드바
 * - 좌측 고정 사이드바: 딥 블루 (#1E3A5F 계열)
 * - 상단 헤더: 블루 계열
 * - 우측 메인: 밝은 화이트/라이트 그레이
 */
import { useState } from "react";
import { useLocation } from "wouter";
import {
  Home,
  MapPin,
  Clock,
  MessageSquare,
  BookOpen,
  ChevronRight,
  Menu,
  X,
  User,
  Shield,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

// Sidebar deep blue palette
const SB = {
  bg: "#1B3A5C",
  bgDark: "#142E4A",
  bgHover: "rgba(255,255,255,0.07)",
  bgActive: "rgba(100,200,255,0.15)",
  text: "rgba(220,235,255,0.9)",
  textMuted: "rgba(160,195,230,0.6)",
  textActive: "#7DD3FC",
  border: "rgba(255,255,255,0.08)",
  badge: "rgba(100,200,255,0.2)",
  badgeText: "#7DD3FC",
  accent: "#3B82F6",
};

// Header blue palette
const HD = {
  bg: "#1E4080",
  border: "rgba(255,255,255,0.1)",
  text: "rgba(210,230,255,0.85)",
  textMuted: "rgba(160,200,240,0.6)",
};

const navItems = [
  {
    id: "profile",
    path: "/profile",
    icon: User,
    label: "후보 프로필",
    sublabel: "경력 · 공약 · 가치관",
    badge: null,
  },
  {
    id: "home",
    path: "/",
    icon: Home,
    label: "디지털 상황실 HOME",
    sublabel: "공지 · 일정 · 퀵링크",
    badge: null,
  },
  {
    id: "pledges",
    path: "/pledges",
    icon: MapPin,
    label: "18개 시·군 공약DB",
    sublabel: "원클릭 탐색",
    badge: "18",
  },
  {
    id: "daily",
    path: "/daily",
    icon: Clock,
    label: "김경수의 하루",
    sublabel: "투명성 강조",
    badge: null,
  },
  {
    id: "proposals",
    path: "/proposals",
    icon: MessageSquare,
    label: "도민 제안함",
    sublabel: "양방향 소통",
    badge: "3",
  },
  {
    id: "policy",
    path: "/policy",
    icon: BookOpen,
    label: "정책 자료실",
    sublabel: "아카이브 허브",
    badge: null,
  },
];

const pageTitles: Record<string, string> = {
  "/profile": "후보 프로필",
  "/": "디지털 상황실 HOME",
  "/pledges": "18개 시·군 공약DB",
  "/daily": "김경수의 하루",
  "/proposals": "도민 제안함",
  "/policy": "정책 자료실",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const adminUser = isAuthenticated && user?.role === "admin";

  const currentTitle = pageTitles[location] || "디지털 상황실";

  const electionDate = new Date("2026-06-03");
  const today = new Date();
  const diffTime = electionDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#EFF4FB" }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - Deep Blue */}
      <aside
        className={`
          fixed md:relative z-50 md:z-auto
          flex flex-col w-60 h-full shrink-0
          transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        style={{
          background: SB.bg,
          borderRight: `1px solid ${SB.border}`,
        }}
      >
        {/* Sidebar header */}
        <div
          className="flex items-center gap-2.5 px-3 py-4 border-b"
          style={{ borderColor: SB.border, background: SB.bgDark }}
        >
          <div
            className="w-8 h-8 rounded-lg overflow-hidden shrink-0"
            style={{ border: "2px solid rgba(125,211,252,0.4)" }}
          >
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663275956251/2tf7d959bKmS3eN22yndrr/kimkyungsu-profile_cbc0ddef.png"
              alt="김경수 후보"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold truncate" style={{ color: "#E0EFFF" }}>
              김경수
            </div>
            <div className="text-xs truncate" style={{ color: SB.textMuted }}>
              경남도지사 후보
            </div>
          </div>
          <button
            className="ml-auto md:hidden"
            onClick={() => setMobileOpen(false)}
            style={{ color: SB.textMuted }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Section label */}
        <div className="px-3 pt-3 pb-1">
          <span className="text-xs font-medium" style={{ color: "rgba(160,195,230,0.5)" }}>
            🏠 디지털 상황실
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2 py-2 rounded text-left transition-all duration-150 mb-0.5"
                style={{
                  background: isActive ? SB.bgActive : "transparent",
                  color: isActive ? SB.textActive : SB.text,
                  borderLeft: isActive ? `3px solid ${SB.textActive}` : "3px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = SB.bgHover;
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = "transparent";
                }}
              >
                <Icon size={15} className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{item.label}</div>
                  <div className="text-xs truncate" style={{ color: SB.textMuted, fontSize: "10px" }}>
                    {item.sublabel}
                  </div>
                </div>
                {item.badge && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0"
                    style={{
                      background: SB.badge,
                      color: SB.badgeText,
                      fontSize: "10px",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <ChevronRight size={12} className="shrink-0" style={{ color: SB.textActive }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div
          className="px-3 py-3 border-t text-xs space-y-2"
          style={{ borderColor: SB.border, color: "rgba(160,195,230,0.4)" }}
        >
          {adminUser && (
            <button
              onClick={() => navigate("/admin")}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all"
              style={{ background: "rgba(220,38,38,0.15)", color: "#FCA5A5", border: "1px solid rgba(220,38,38,0.25)" }}
            >
              <Shield size={12} />
              관리자 페이지
            </button>
          )}
          <div>© 2026 김경수 선거캠프</div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header bar - Blue */}
        <header
          className="flex items-center gap-3 px-4 py-2.5 shrink-0"
          style={{
            background: HD.bg,
            borderBottom: `1px solid ${HD.border}`,
          }}
        >
          <button
            className="md:hidden p-1 rounded"
            onClick={() => setMobileOpen(true)}
            style={{ color: HD.textMuted }}
          >
            <Menu size={18} />
          </button>
          <span className="text-sm font-medium" style={{ color: HD.text }}>
            | {currentTitle}
          </span>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "#4ADE80", animation: "pulse 2s infinite" }}
              />
              <span className="text-xs" style={{ color: HD.textMuted }}>
                2026 경남도지사 선거
              </span>
            </div>
            <div
              className="px-2.5 py-1 rounded text-xs font-bold"
              style={{
                background: "rgba(59,130,246,0.35)",
                color: "#93C5FD",
                border: "1px solid rgba(147,197,253,0.3)",
              }}
            >
              D-{diffDays}
            </div>
          </div>
        </header>

        {/* Page content - Light */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ background: "#F5F8FD" }}
        >
          {children}
        </main>

        {/* Footer status bar */}
        <div
          className="flex items-center gap-4 px-4 py-1.5 text-xs shrink-0"
          style={{
            background: "#E8EFF8",
            borderTop: "1px solid #D1DDEF",
            color: "#7A95B8",
          }}
        >
          <span>공지 2건 · 일정 3건</span>
          <span className="ml-auto">© 2026 김경수 선거캠프</span>
        </div>
      </div>
    </div>
  );
}
