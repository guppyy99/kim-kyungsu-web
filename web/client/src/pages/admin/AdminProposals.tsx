/**
 * 관리자 - 도민 제안 관리 페이지
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { MessageSquare, Pencil, Check, X, AlertCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type ProposalStatus = "접수" | "검토중" | "반영" | "보류";

const statusColors: Record<string, { bg: string; color: string }> = {
  "접수": { bg: "#DBEAFE", color: "#1D4ED8" },
  "검토중": { bg: "#FEF3C7", color: "#92400E" },
  "반영": { bg: "#D1FAE5", color: "#065F46" },
  "보류": { bg: "#F1F5F9", color: "#64748B" },
};

export default function AdminProposals() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [editId, setEditId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<ProposalStatus>("접수");
  const [filterStatus, setFilterStatus] = useState<string>("전체");

  const utils = trpc.useUtils();

  const { data: list = [], isLoading } = trpc.proposals.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const updateMutation = trpc.proposals.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("상태가 변경되었습니다.");
      utils.proposals.list.invalidate();
      setEditId(null);
    },
    onError: () => toast.error("변경에 실패했습니다."),
  });

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertCircle size={36} style={{ color: "#F59E0B" }} />
        <p className="text-sm" style={{ color: "#64748B" }}>관리자 권한이 필요합니다.</p>
        <button onClick={() => navigate("/admin")} className="text-xs px-3 py-1.5 rounded-lg text-white" style={{ background: "#1B3A5C" }}>
          대시보드로
        </button>
      </div>
    );
  }

  const filtered = filterStatus === "전체" ? list : list.filter((p) => p.status === filterStatus);

  return (
    <div className="p-5 space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} style={{ color: "#B45309" }} />
          <h1 className="text-lg font-bold" style={{ color: "#1E3A5F" }}>도민 제안 관리</h1>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#FEF3C7", color: "#92400E" }}>
            {list.length}건
          </span>
        </div>
      </div>

      {/* 상태 필터 */}
      <div className="flex gap-2 flex-wrap">
        {["전체", "접수", "검토중", "반영", "보류"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: filterStatus === s ? "#1B3A5C" : "#F1F5F9",
              color: filterStatus === s ? "white" : "#64748B",
            }}
          >
            {s}
            {s !== "전체" && (
              <span className="ml-1.5 font-bold">
                {list.filter((p) => p.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 목록 */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: "#F1F5F9" }} />
          ))
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs rounded-xl" style={{ background: "#F8FAFF", color: "#94A3B8", border: "1px solid #E2EAF4" }}>
            해당 상태의 제안이 없습니다.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-xl p-4"
              style={{ background: "#FFFFFF", border: "1px solid #E2EAF4", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    {editId === item.id ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as ProposalStatus)}
                          className="px-2 py-1 rounded-lg text-xs border outline-none"
                          style={{ borderColor: "#BFDBFE" }}
                        >
                          {["접수", "검토중", "반영", "보류"].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => updateMutation.mutate({ id: item.id, status: editStatus })}
                          className="p-1 rounded-lg"
                          style={{ background: "#D1FAE5" }}
                        >
                          <Check size={12} style={{ color: "#065F46" }} />
                        </button>
                        <button onClick={() => setEditId(null)} className="p-1 rounded-lg" style={{ background: "#FEE2E2" }}>
                          <X size={12} style={{ color: "#DC2626" }} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditId(item.id); setEditStatus(item.status as ProposalStatus); }}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium"
                        style={{ background: statusColors[item.status]?.bg, color: statusColors[item.status]?.color }}
                        title="클릭하여 상태 변경"
                      >
                        {item.status} <Pencil size={9} />
                      </button>
                    )}
                    {item.region && (
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: "#F1F5F9", color: "#64748B" }}>
                        {item.region}
                      </span>
                    )}
                    {item.category && (
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: "#EDE9FE", color: "#6D28D9" }}>
                        {item.category}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "#1E3A5F" }}>{item.title}</p>
                  <p className="text-xs line-clamp-2 mb-2" style={{ color: "#64748B" }}>{item.content}</p>
                  <div className="flex items-center gap-3 text-xs" style={{ color: "#94A3B8" }}>
                    <span>제안자: {item.name}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString("ko-KR")}</span>
                    {item.attachmentUrl && (
                      <a
                        href={item.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                        style={{ color: "#3B82F6" }}
                      >
                        <ExternalLink size={11} /> 첨부파일
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
