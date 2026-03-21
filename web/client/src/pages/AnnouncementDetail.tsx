/**
 * 공지사항 상세 페이지
 */
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Bell, ArrowLeft, Loader2, AlertCircle } from "lucide-react";

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  "공지": { bg: "#DBEAFE", text: "#1D4ED8" },
  "보도": { bg: "#FEF3C7", text: "#92400E" },
  "일정": { bg: "#D1FAE5", text: "#065F46" },
};

export default function AnnouncementDetail() {
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0", 10);

  const { data: item, isLoading, error } = trpc.announcements.getById.useQuery(
    { id },
    { enabled: !!id && !isNaN(id) }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8FAFC" }}>
        <Loader2 size={28} className="animate-spin" style={{ color: "#3B82F6" }} />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: "#F8FAFC" }}>
        <AlertCircle size={32} style={{ color: "#CBD5E1" }} />
        <p className="text-sm" style={{ color: "#94A3B8" }}>공지사항을 찾을 수 없습니다.</p>
        <button
          onClick={() => navigate("/announcements")}
          className="text-xs px-4 py-2 rounded-lg"
          style={{ background: "#1D4ED8", color: "white" }}
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  const colors = TYPE_COLORS[item.type] ?? { bg: "#F1F5F9", text: "#475569" };
  const dateStr = new Date(item.publishedAt).toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC" }}>
      {/* 헤더 */}
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3"
        style={{ background: "#1B3A5C", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <button onClick={() => navigate("/announcements")} style={{ color: "rgba(180,210,240,0.8)" }}>
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <Bell size={16} style={{ color: "#7DD3FC" }} />
          <span className="text-sm font-bold" style={{ color: "white" }}>공지사항</span>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="px-4 py-5 max-w-2xl mx-auto">
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "white", border: "1px solid #E2EAF4", boxShadow: "0 2px 12px rgba(27,58,92,0.06)" }}
        >
          {/* 상단 메타 */}
          <div className="px-5 pt-5 pb-4" style={{ borderBottom: "1px solid #F1F5F9" }}>
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{ background: colors.bg, color: colors.text }}
              >
                {item.type}
              </span>
              {item.isNew && (
                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "#FEE2E2", color: "#DC2626", fontSize: "10px" }}>
                  NEW
                </span>
              )}
            </div>
            <h1 className="text-base font-bold leading-snug mb-2" style={{ color: "#1E3A5F" }}>
              {item.title}
            </h1>
            <p className="text-xs" style={{ color: "#94A3B8" }}>{dateStr}</p>
          </div>

          {/* 본문 */}
          <div className="px-5 py-5">
            {item.content ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#334155" }}>
                {item.content}
              </p>
            ) : (
              <p className="text-sm" style={{ color: "#94A3B8" }}>본문 내용이 없습니다.</p>
            )}
          </div>
        </div>

        {/* 목록으로 버튼 */}
        <button
          onClick={() => navigate("/announcements")}
          className="mt-4 w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
          style={{ background: "white", border: "1px solid #E2EAF4", color: "#64748B" }}
        >
          <ArrowLeft size={14} />
          목록으로 돌아가기
        </button>
      </div>
    </div>
  );
}
