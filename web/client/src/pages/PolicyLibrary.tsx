/**
 * PolicyLibrary Page - 정책 자료실
 * Design: 라이트 메인 + 블루 사이드바
 * DB 연동: 관리자가 등록한 정책 자료 실시간 반영
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { BookOpen, Download, Eye, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

const tabs = [
  { label: "심층 정책 리포트", value: "심층리포트" as const },
  { label: "보도자료 원본", value: "보도자료" as const },
  { label: "홍보물 (카드뉴스)", value: "카드뉴스" as const },
];

const categoryStyleMap: Record<string, { color: string; bg: string; border: string }> = {
  "심층리포트": { color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
  "보도자료":   { color: "#92400E", bg: "#FEF3C7", border: "#FDE68A" },
  "카드뉴스":   { color: "#9A3412", bg: "#FFF7ED", border: "#FDBA74" },
};

export default function PolicyLibrary() {
  const [activeTab, setActiveTab] = useState(0);

  // DB에서 전체 정책 자료 조회
  const { data: allDocs, isLoading } = trpc.policyDocs.list.useQuery({});

  const currentCategory = tabs[activeTab].value;
  const currentData = allDocs?.filter(d => d.category === currentCategory) ?? [];

  const totalCounts = tabs.map(t => allDocs?.filter(d => d.category === t.value).length ?? 0);

  // 날짜 포맷
  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}.${m}.${day}`;
  };

  return (
    <div className="p-5 space-y-4">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={18} style={{ color: "#1D4ED8" }} />
          <h1 className="text-lg font-bold" style={{ color: "#1E3A5F" }}>정책 자료실</h1>
        </div>
        <p className="text-xs mb-2" style={{ color: "#64748B" }}>김경수 후보의 정책 자료를 투명하게 공개합니다</p>
        {!isLoading && (
          <div className="flex gap-3 text-xs" style={{ color: "#94A3B8" }}>
            <span>{totalCounts[0]}건 정책 리포트</span>
            <span>{totalCounts[1]}건 보도자료</span>
            <span>{totalCounts[2]}건 홍보물</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#EFF4FB" }}>
        {tabs.map((tab, idx) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(idx)}
            className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: activeTab === idx ? "#FFFFFF" : "transparent",
              color: activeTab === idx ? "#1D4ED8" : "#64748B",
              boxShadow: activeTab === idx ? "0 1px 4px rgba(27,58,92,0.1)" : "none",
              border: activeTab === idx ? "1px solid #E2EAF4" : "1px solid transparent",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Document list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin" style={{ color: "#94A3B8" }} />
        </div>
      ) : currentData.length === 0 ? (
        <div className="text-center py-12 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2EAF4" }}>
          <FileText size={32} className="mx-auto mb-3" style={{ color: "#CBD5E1" }} />
          <p className="text-sm font-medium" style={{ color: "#64748B" }}>등록된 자료가 없습니다.</p>
          <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>관리자 페이지에서 자료를 등록해 주세요.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentData.map((doc) => {
            const cs = categoryStyleMap[doc.category] ?? { color: "#64748B", bg: "#F1F5F9", border: "#E2E8F0" };
            return (
              <div
                key={doc.id}
                className="rounded-xl p-4 notion-card"
                style={{ background: "#FFFFFF", border: "1px solid #E2EAF4", boxShadow: "0 1px 4px rgba(27,58,92,0.05)" }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: cs.bg, border: `1px solid ${cs.border}` }}
                  >
                    <FileText size={15} style={{ color: cs.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: cs.bg, color: cs.color, border: `1px solid ${cs.border}` }}>
                        {doc.category}
                      </span>
                      <span className="text-xs" style={{ color: "#94A3B8" }}>{formatDate(doc.publishedAt)}</span>
                    </div>

                    <h3 className="text-sm font-bold mb-0.5" style={{ color: "#1E3A5F" }}>{doc.title}</h3>
                    {doc.description && (
                      <p className="text-xs mb-3" style={{ color: "#64748B", lineHeight: "1.7" }}>{doc.description}</p>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      {doc.fileUrl ? (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                          style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}
                        >
                          <Download size={11} /> 다운로드
                        </a>
                      ) : (
                        <button
                          onClick={() => toast.info("파일이 아직 등록되지 않았습니다.")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                          style={{ background: "#F1F5F9", color: "#94A3B8", border: "1px solid #E2E8F0" }}
                        >
                          <Download size={11} /> 다운로드
                        </button>
                      )}
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                          style={{ background: "#F1F5F9", color: "#475569", border: "1px solid #E2E8F0" }}
                        >
                          <Eye size={11} /> 보기
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
