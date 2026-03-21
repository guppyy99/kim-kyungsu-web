/**
 * 관리자 전용 레이아웃
 * - PC (md+): 왼쪽 사이드바 + 오른쪽 콘텐츠
 * - 모바일: 상단 헤더 + 콘텐츠 + 하단 탭 네비게이션
 * - 10분 비활동 시 자동 로그아웃 (1분 전 경고 토스트)
 */
import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import {
  LayoutDashboard,
  Bell,
  Calendar,
  MessageSquare,
  BookOpen,
  MapPin,
  ArrowLeft,
  Shield,
  LogOut,
  Settings,
  Clock,
} from "lucide-react";

const adminMenus = [
  { id: "dashboard", path: "/admin", icon: LayoutDashboard, label: "대시보드" },
  { id: "announcements", path: "/admin/announcements", icon: Bell, label: "공지" },
  { id: "schedules", path: "/admin/schedules", icon: Calendar, label: "일정" },
  { id: "proposals", path: "/admin/proposals", icon: MessageSquare, label: "제안" },
  { id: "policy", path: "/admin/policy", icon: BookOpen, label: "자료" },
  { id: "pledges", path: "/admin/pledges", icon: MapPin, label: "공약" },
  { id: "account", path: "/admin/account", icon: Settings, label: "설정" },
];

const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10분
const WARN_BEFORE_MS = 60 * 1000;        // 1분 전 경고

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, navigate] = useLocation();
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const warnToastIdRef = useRef<string | number | null>(null);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      navigate("/admin/login");
    },
  });

  const handleIdleLogout = () => {
    // 경고 토스트 닫기
    if (warnToastIdRef.current !== null) {
      toast.dismiss(warnToastIdRef.current);
      warnToastIdRef.current = null;
    }
    toast.error("10분간 활동이 없어 자동 로그아웃되었습니다.", { duration: 5000 });
    logoutMutation.mutate();
  };

  const handleIdleWarn = () => {
    warnToastIdRef.current = toast.warning(
      "1분 후 자동 로그아웃됩니다. 계속 사용하려면 화면을 터치하거나 클릭하세요.",
      {
        duration: WARN_BEFORE_MS,
        icon: <Clock size={16} />,
      }
    );
  };

  const handleActive = () => {
    // 활동 재개 시 경고 토스트 닫기
    if (warnToastIdRef.current !== null) {
      toast.dismiss(warnToastIdRef.current);
      warnToastIdRef.current = null;
    }
  };

  // 10분 비활동 자동 로그아웃 훅
  useIdleTimeout({
    timeout: IDLE_TIMEOUT_MS,
    warnBefore: WARN_BEFORE_MS,
    onIdle: handleIdleLogout,
    onWarn: handleIdleWarn,
    onActive: handleActive,
    enabled: !loading && !!user && user.role === "admin",
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      navigate("/admin/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0F2744" }}>
        <div className="animate-spin w-8 h-8 rounded-full border-2 border-blue-400 border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  const currentMenu = adminMenus.find(
    (m) => m.path === location || (m.path !== "/admin" && location.startsWith(m.path))
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F0F4F8" }}>

      {/* ── PC 사이드바 (md 이상) ── */}
      <aside
        className="hidden md:flex flex-col shrink-0"
        style={{
          width: "220px",
          background: "#0F2744",
          borderRight: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#DC2626" }}>
              <Shield size={14} style={{ color: "white" }} />
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: "white" }}>관리자 페이지</p>
              <p className="text-xs" style={{ color: "rgba(180,210,240,0.6)", fontSize: "10px" }}>김경수 디지털 상황실</p>
            </div>
          </div>
          {user && (
            <div className="mt-2 px-2 py-1 rounded-lg text-xs" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(180,210,240,0.8)" }}>
              {user.name ?? "관리자"}
            </div>
          )}
          {/* 자동 로그아웃 안내 */}
          <div
            className="mt-2 px-2 py-1 rounded-lg text-xs flex items-center gap-1.5"
            style={{ background: "rgba(255,255,255,0.04)", color: "rgba(180,210,240,0.4)" }}
          >
            <Clock size={10} />
            10분 비활동 시 자동 로그아웃
          </div>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {adminMenus.map((menu) => {
            const Icon = menu.icon;
            const isActive = location === menu.path || (menu.path !== "/admin" && location.startsWith(menu.path));
            return (
              <button
                key={menu.id}
                onClick={() => navigate(menu.path)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all"
                style={{
                  background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                  color: isActive ? "white" : "rgba(180,210,240,0.7)",
                }}
              >
                <Icon size={14} style={{ color: isActive ? "white" : "rgba(180,210,240,0.6)" }} />
                <span className="text-xs font-medium">{menu.label}</span>
                {isActive && (
                  <div className="ml-auto w-1 h-4 rounded-full" style={{ background: "#60A5FA" }} />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t space-y-1" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
            style={{ color: "rgba(180,210,240,0.6)" }}
          >
            <ArrowLeft size={13} />
            사이트로 돌아가기
          </button>
          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
            style={{ color: "rgba(248,113,113,0.8)" }}
          >
            <LogOut size={13} />
            로그아웃
          </button>
        </div>
      </aside>

      {/* ── 콘텐츠 영역 (PC + 모바일 공통) ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* 모바일 상단 헤더 */}
        <header
          className="md:hidden flex items-center justify-between px-4 shrink-0"
          style={{
            background: "#0F2744",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            height: "52px",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "#DC2626" }}>
              <Shield size={11} style={{ color: "white" }} />
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: "white" }}>
                {currentMenu?.label ?? "관리자"}
              </p>
              <p style={{ color: "rgba(180,210,240,0.5)", fontSize: "9px" }}>
                {user.name ?? "관리자"} · 10분 비활동 시 자동 로그아웃
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(180,210,240,0.8)" }}
            >
              <ArrowLeft size={11} />
              사이트
            </button>
            <button
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs"
              style={{ background: "rgba(220,38,38,0.15)", color: "rgba(248,113,113,0.9)" }}
            >
              <LogOut size={11} />
              로그아웃
            </button>
          </div>
        </header>

        {/* 페이지 콘텐츠 */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ paddingBottom: "calc(64px + env(safe-area-inset-bottom))" }}
        >
          <div className="md:pb-0">
            {children}
          </div>
        </main>

        {/* 모바일 하단 탭 네비게이션 */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
          style={{
            background: "#0F2744",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingBottom: "env(safe-area-inset-bottom)",
            height: "calc(56px + env(safe-area-inset-bottom))",
          }}
        >
          {adminMenus.map((menu) => {
            const Icon = menu.icon;
            const isActive = location === menu.path || (menu.path !== "/admin" && location.startsWith(menu.path));
            return (
              <button
                key={menu.id}
                onClick={() => navigate(menu.path)}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
                style={{ color: isActive ? "#60A5FA" : "rgba(180,210,240,0.4)" }}
              >
                {isActive && (
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 rounded-b-full"
                    style={{ width: "28px", height: "2px", background: "#60A5FA" }}
                  />
                )}
                <Icon size={19} />
                <span style={{ fontSize: "9px", fontWeight: isActive ? 600 : 400, lineHeight: 1 }}>
                  {menu.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
