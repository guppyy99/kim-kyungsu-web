/**
 * 관리자 대시보드 - 통계 카드 + 최근 활동 피드
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  LayoutDashboard,
  Bell,
  Calendar,
  MessageSquare,
  BookOpen,
  MapPin,
  Users,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  LogIn,
  Database,
  Loader2,
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [isSeedLoading, setIsSeedLoading] = useState(false);

  const utils = trpc.useUtils();

  const seedMutation = trpc.admin.seedSampleData.useMutation({
    onSuccess: (data) => {
      const { results } = data;
      const parts = [];
      if (results.pledges > 0) parts.push(`공약 ${results.pledges}건`);
      if (results.announcements > 0) parts.push(`공지사항 ${results.announcements}건`);
      if (results.schedules > 0) parts.push(`일정 ${results.schedules}건`);
      if (results.policyDocs > 0) parts.push(`정책자료 ${results.policyDocs}건`);
      if ((results as any).proposals > 0) parts.push(`도민제안 ${(results as any).proposals}건`);
      if (parts.length === 0) {
        toast.info("이미 데이터가 존재합니다. 기존 데이터가 있는 항목은 건너뜁니다.");
      } else {
        toast.success(`샘플 데이터 입력 완료! ${parts.join(', ')} 추가됨`);
      }
      utils.admin.stats.invalidate();
      utils.admin.recentActivity.invalidate();
    },
    onError: (err) => {
      toast.error("샘플 데이터 입력 실패: " + err.message);
    },
    onSettled: () => {
      setIsSeedLoading(false);
    },
  });

  const handleSeedData = () => {
    setIsSeedLoading(true);
    seedMutation.mutate();
  };

  const { data: stats, isLoading: statsLoading } = trpc.admin.stats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
    retry: false,
  });

  const { data: activity, isLoading: activityLoading } = trpc.admin.recentActivity.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
    retry: false,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle size={40} style={{ color: "#94A3B8" }} />
        <p className="text-sm font-medium" style={{ color: "#64748B" }}>
          관리자 로그인이 필요합니다
        </p>
        <a
          href={getLoginUrl()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: "#1D4ED8" }}
        >
          <LogIn size={14} /> 로그인
        </a>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle size={40} style={{ color: "#F59E0B" }} />
        <p className="text-sm font-medium" style={{ color: "#64748B" }}>
          관리자 권한이 없습니다
        </p>
        <p className="text-xs" style={{ color: "#94A3B8" }}>
          현재 계정: {user?.name ?? user?.email}
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: "#1B3A5C" }}
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  const statCards = [
    { label: "공지사항", value: stats?.announcements ?? 0, icon: Bell, color: "#1D4ED8", bg: "#EFF6FF" },
    { label: "일정", value: stats?.schedules ?? 0, icon: Calendar, color: "#065F46", bg: "#ECFDF5" },
    { label: "도민 제안", value: stats?.proposals ?? 0, icon: MessageSquare, color: "#B45309", bg: "#FFFBEB" },
    { label: "정책 자료", value: stats?.policyDocs ?? 0, icon: BookOpen, color: "#6D28D9", bg: "#F5F3FF" },
    { label: "공약", value: stats?.pledges ?? 0, icon: MapPin, color: "#DC2626", bg: "#FEF2F2" },
    { label: "가입 사용자", value: stats?.users ?? 0, icon: Users, color: "#0369A1", bg: "#F0F9FF" },
  ];

  const proposalStatusColors: Record<string, string> = {
    "접수": "#3B82F6",
    "검토중": "#F59E0B",
    "반영": "#10B981",
    "보류": "#94A3B8",
  };

  return (
    <div className="p-5 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutDashboard size={18} style={{ color: "#1B3A5C" }} />
          <h1 className="text-lg font-bold" style={{ color: "#1E3A5F" }}>
            관리자 대시보드
          </h1>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
          style={{ background: "#ECFDF5", color: "#065F46", border: "1px solid #A7F3D0" }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          {user?.name ?? "관리자"} 로그인 중
        </div>
      </div>

      {/* 통계 카드 */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#94A3B8" }}>
          전체 현황
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-xl p-4 flex flex-col gap-2"
                style={{
                  background: card.bg,
                  border: `1px solid ${card.color}20`,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: card.color + "18" }}
                >
                  <Icon size={15} style={{ color: card.color }} />
                </div>
                <div>
                  {statsLoading ? (
                    <div className="w-8 h-5 rounded animate-pulse" style={{ background: card.color + "30" }} />
                  ) : (
                    <p className="text-xl font-bold" style={{ color: card.color }}>
                      {card.value.toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                    {card.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 도민 제안 상태별 현황 */}
      {stats?.proposalByStatus && Object.keys(stats.proposalByStatus).length > 0 && (
        <div
          className="rounded-xl p-4"
          style={{ background: "#FFFFFF", border: "1px solid #E2EAF4", boxShadow: "0 1px 6px rgba(27,58,92,0.06)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} style={{ color: "#64748B" }} />
            <span className="text-sm font-semibold" style={{ color: "#1E3A5F" }}>
              도민 제안 상태별 현황
            </span>
          </div>
          <div className="flex gap-3 flex-wrap">
            {Object.entries(stats.proposalByStatus).map(([status, cnt]) => (
              <div
                key={status}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{
                  background: (proposalStatusColors[status] ?? "#94A3B8") + "15",
                  color: proposalStatusColors[status] ?? "#94A3B8",
                  border: `1px solid ${(proposalStatusColors[status] ?? "#94A3B8")}30`,
                }}
              >
                <span className="font-bold text-sm">{cnt}</span>
                {status}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 최근 활동 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 최근 공지사항 */}
        <div
          className="rounded-xl p-4"
          style={{ background: "#FFFFFF", border: "1px solid #E2EAF4", boxShadow: "0 1px 6px rgba(27,58,92,0.06)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell size={13} style={{ color: "#1D4ED8" }} />
              <span className="text-sm font-semibold" style={{ color: "#1E3A5F" }}>최근 공지사항</span>
            </div>
            <button
              onClick={() => navigate("/admin/announcements")}
              className="flex items-center gap-0.5 text-xs"
              style={{ color: "#3B82F6" }}
            >
              관리 <ChevronRight size={11} />
            </button>
          </div>
          <div className="space-y-2">
            {activityLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-8 rounded animate-pulse" style={{ background: "#F1F5F9" }} />
              ))
            ) : activity?.recentAnnouncements?.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: "#94A3B8" }}>등록된 공지사항이 없습니다</p>
            ) : (
              activity?.recentAnnouncements?.map((item) => (
                <div key={item.id} className="flex items-start gap-2 py-1.5 border-b last:border-0" style={{ borderColor: "#F1F5F9" }}>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded shrink-0 font-medium"
                    style={{ background: "#DBEAFE", color: "#1D4ED8" }}
                  >
                    {item.type}
                  </span>
                  <p className="text-xs truncate flex-1" style={{ color: "#334155" }}>{item.title}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 최근 도민 제안 */}
        <div
          className="rounded-xl p-4"
          style={{ background: "#FFFFFF", border: "1px solid #E2EAF4", boxShadow: "0 1px 6px rgba(27,58,92,0.06)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare size={13} style={{ color: "#B45309" }} />
              <span className="text-sm font-semibold" style={{ color: "#1E3A5F" }}>최근 도민 제안</span>
            </div>
            <button
              onClick={() => navigate("/admin/proposals")}
              className="flex items-center gap-0.5 text-xs"
              style={{ color: "#3B82F6" }}
            >
              관리 <ChevronRight size={11} />
            </button>
          </div>
          <div className="space-y-2">
            {activityLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-8 rounded animate-pulse" style={{ background: "#F1F5F9" }} />
              ))
            ) : activity?.recentProposals?.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: "#94A3B8" }}>접수된 제안이 없습니다</p>
            ) : (
              activity?.recentProposals?.map((item) => (
                <div key={item.id} className="flex items-start gap-2 py-1.5 border-b last:border-0" style={{ borderColor: "#F1F5F9" }}>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded shrink-0 font-medium"
                    style={{
                      background: (proposalStatusColors[item.status] ?? "#94A3B8") + "20",
                      color: proposalStatusColors[item.status] ?? "#94A3B8",
                    }}
                  >
                    {item.status}
                  </span>
                  <p className="text-xs truncate flex-1" style={{ color: "#334155" }}>{item.title}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 최근 정책 자료 */}
        <div
          className="rounded-xl p-4"
          style={{ background: "#FFFFFF", border: "1px solid #E2EAF4", boxShadow: "0 1px 6px rgba(27,58,92,0.06)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen size={13} style={{ color: "#6D28D9" }} />
              <span className="text-sm font-semibold" style={{ color: "#1E3A5F" }}>최근 정책 자료</span>
            </div>
            <button
              onClick={() => navigate("/admin/policy")}
              className="flex items-center gap-0.5 text-xs"
              style={{ color: "#3B82F6" }}
            >
              관리 <ChevronRight size={11} />
            </button>
          </div>
          <div className="space-y-2">
            {activityLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-8 rounded animate-pulse" style={{ background: "#F1F5F9" }} />
              ))
            ) : activity?.recentPolicyDocs?.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: "#94A3B8" }}>등록된 자료가 없습니다</p>
            ) : (
              activity?.recentPolicyDocs?.map((item) => (
                <div key={item.id} className="flex items-start gap-2 py-1.5 border-b last:border-0" style={{ borderColor: "#F1F5F9" }}>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded shrink-0 font-medium"
                    style={{ background: "#EDE9FE", color: "#6D28D9" }}
                  >
                    {item.category}
                  </span>
                  <p className="text-xs truncate flex-1" style={{ color: "#334155" }}>{item.title}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 샘플 데이터 불러오기 */}
      <div
        className="rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ background: "linear-gradient(135deg, #EFF6FF, #F5F3FF)", border: "1px solid #BFDBFE" }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "#1D4ED820" }}
          >
            <Database size={16} style={{ color: "#1D4ED8" }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#1E3A5F" }}>샘플 데이터 불러오기</p>
            <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
              공약(21건) · 공지사항(4건) · 일정(8건) · 정책자료(7건) · 도민제안(7건)을 자동으로 입력합니다.
              이미 데이터가 있는 항목은 건너뜁니다.
            </p>
          </div>
        </div>
        <button
          onClick={handleSeedData}
          disabled={isSeedLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shrink-0 disabled:opacity-60"
          style={{ background: "#1D4ED8", color: "white" }}
        >
          {isSeedLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Database size={14} />
          )}
          {isSeedLoading ? "입력 중..." : "샘플 데이터 입력"}
        </button>
      </div>

      {/* 빠른 이동 */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#94A3B8" }}>
          빠른 관리
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "공지사항 관리", path: "/admin/announcements", icon: Bell, color: "#1D4ED8", bg: "#EFF6FF" },
            { label: "일정 관리", path: "/admin/schedules", icon: Calendar, color: "#065F46", bg: "#ECFDF5" },
            { label: "도민 제안 관리", path: "/admin/proposals", icon: MessageSquare, color: "#B45309", bg: "#FFFBEB" },
            { label: "정책 자료 관리", path: "/admin/policy", icon: BookOpen, color: "#6D28D9", bg: "#F5F3FF" },
            { label: "공약 관리", path: "/admin/pledges", icon: MapPin, color: "#DC2626", bg: "#FEF2F2" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-shadow hover:shadow-md"
                style={{ background: item.bg, border: `1px solid ${item.color}20` }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: item.color + "18" }}
                >
                  <Icon size={16} style={{ color: item.color }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: item.color }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
