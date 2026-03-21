/**
 * 공지사항 전체보기 페이지
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Bell, ChevronRight, ArrowLeft, Loader2 } from "lucide-react";

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  "공지": { bg: "#DBEAFE", text: "#1D4ED8" },
  "보도": { bg: "#FEF3C7", text: "#92400E" },
  "일정": { bg: "#D1FAE5", text: "#065F46" },
};

export default function AnnouncementList() {
  const [, navigate] = useLocation();
  const [filter, setFilter] = useState<"전체" | "공지" | "보도" | "일정">("전체");

  const { data: items = [], isLoading } = trpc.announcements.list.useQuery();

  const filtered = filter === "전체" ? items : items.filter((a) => a.type === filter);

  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC" }}>
      {/* 헤더 */}
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3"
        style={{ background: "#1B3A5C", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <button onClick={() => navigate("/")} style={{ color: "rgba(180,210,240,0.8)" }}>
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <Bell size={16} style={{ color: "#7DD3FC" }} />
          <span className="text-sm font-bold" style={{ color: "white" }}>공지사항</span>
        </div>
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-2 px-4 py-3" style={{ borderBottom: "1px solid #E2EAF4", background: "white" }}>
        {(["전체", "공지", "보도", "일정"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: filter === tab ? "#1D4ED8" : "#F1F5F9",
              color: filter === tab ? "white" : "#64748B",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 목록 */}
      <div className="px-4 py-3 space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin" style={{ color: "#3B82F6" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Bell size={32} className="mx-auto mb-3" style={{ color: "#CBD5E1" }} />
            <p className="text-sm" style={{ color: "#94A3B8" }}>공지사항이 없습니다.</p>
          </div>
        ) : (
          filtered.map((item) => {
            const colors = TYPE_COLORS[item.type] ?? { bg: "#F1F5F9", text: "#475569" };
            const dateStr = new Date(item.publishedAt).toLocaleDateString("ko-KR", {
              year: "numeric", month: "2-digit", day: "2-digit",
            }).replace(/\. /g, ".").replace(/\.$/, "");
            return (
              <button
                key={item.id}
                onClick={() => navigate(`/announcements/${item.id}`)}
                className="w-full text-left rounded-xl p-4 transition-all"
                style={{
                  background: "white",
                  border: "1px solid #E2EAF4",
                  boxShadow: "0 1px 4px rgba(27,58,92,0.04)",
                }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="text-xs px-2 py-0.5 rounded font-medium shrink-0 mt-0.5"
                    style={{ background: colors.bg, color: colors.text }}
                  >
                    {item.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate" style={{ color: "#1E3A5F" }}>{item.title}</p>
                      {item.isNew && (
                        <span className="text-xs px-1 py-0.5 rounded font-bold shrink-0" style={{ background: "#FEE2E2", color: "#DC2626", fontSize: "9px" }}>NEW</span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>{dateStr}</p>
                    {item.content && (
                      <p className="text-xs mt-1.5 line-clamp-2" style={{ color: "#64748B" }}>{item.content}</p>
                    )}
                  </div>
                  <ChevronRight size={14} className="shrink-0 mt-1" style={{ color: "#CBD5E1" }} />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
