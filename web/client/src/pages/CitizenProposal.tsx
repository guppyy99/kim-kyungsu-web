/**
 * CitizenProposal Page - 도민 제안함
 * Design: 라이트 메인 + 블루 사이드바
 * DB 연동: 제안 제출 및 칸반보드 실시간 반영
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { MessageSquare, CheckCircle, Eye, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

const regions18 = [
  "지역 선택", "창원", "김해", "양산", "진주", "통영", "사천",
  "밀양", "거제", "고성", "남해", "하동", "산청", "함양",
  "거창", "합천", "창녕", "함안", "의령",
];

const fieldOptions = [
  "분야 선택", "경제·일자리", "교육·청년", "복지·의료", "교통·인프라",
  "우주항공·방산", "환경·관광", "농림·수산", "문화·체육",
];

const kanbanStyle: Record<string, { color: string; bg: string; border: string }> = {
  "접수":   { color: "#475569", bg: "#F1F5F9", border: "#E2E8F0" },
  "검토중": { color: "#92400E", bg: "#FEF3C7", border: "#FDE68A" },
  "반영":   { color: "#065F46", bg: "#D1FAE5", border: "#A7F3D0" },
  "보류":   { color: "#DC2626", bg: "#FEE2E2", border: "#FECACA" },
};

const kanbanLabels: Record<string, string> = {
  "접수":   "접수완료",
  "검토중": "검토중",
  "반영":   "정책반영",
  "보류":   "보류",
};

export default function CitizenProposal() {
  const [form, setForm] = useState({ title: "", region: "", field: "", name: "", content: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const utils = trpc.useUtils();

  // DB에서 제안 목록 조회
  const { data: proposals, isLoading } = trpc.proposals.list.useQuery();

  // 제안 제출 mutation
  const submitMutation = trpc.proposals.submit.useMutation({
    onSuccess: () => {
      toast.success("제안이 성공적으로 접수되었습니다! 검토 후 피드백 드리겠습니다.");
      setForm({ title: "", region: "", field: "", name: "", content: "" });
      utils.proposals.list.invalidate();
    },
    onError: (err) => {
      toast.error("제출 중 오류가 발생했습니다: " + err.message);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleSubmit = () => {
    if (!form.title || !form.region || !form.field || !form.content) {
      toast.error("제목, 지역, 분야, 내용은 필수 입력 항목입니다.");
      return;
    }
    setIsSubmitting(true);
    submitMutation.mutate({
      title: form.title,
      region: form.region,
      category: form.field,
      name: form.name || "익명",
      content: form.content,
    });
  };

  // 통계 계산
  const totalProposals = proposals?.length ?? 0;
  const reviewing = proposals?.filter(p => p.status === "검토중").length ?? 0;
  const reflected = proposals?.filter(p => p.status === "반영").length ?? 0;

  // 칸반 그룹핑
  const kanbanGroups: Record<string, typeof proposals> = {
    "접수": proposals?.filter(p => p.status === "접수") ?? [],
    "검토중": proposals?.filter(p => p.status === "검토중") ?? [],
    "반영": proposals?.filter(p => p.status === "반영") ?? [],
  };

  // 반영된 제안 (피드백 섹션)
  const reflectedProposals = proposals?.filter(p => p.status === "반영") ?? [];

  // 날짜 포맷 (MM.DD)
  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${m}.${day}`;
  };

  return (
    <div className="p-5 space-y-4">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare size={18} style={{ color: "#1D4ED8" }} />
          <h1 className="text-lg font-bold" style={{ color: "#1E3A5F" }}>도민 제안함</h1>
        </div>
        <p className="text-xs" style={{ color: "#64748B" }}>도민 여러분의 아이디어와 제안이 경남도 정책을 만듭니다</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "총 제안", value: totalProposals, color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
          { label: "검토 중", value: reviewing, color: "#92400E", bg: "#FFFBEB", border: "#FDE68A" },
          { label: "정책 반영", value: reflected, color: "#065F46", bg: "#ECFDF5", border: "#A7F3D0" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl p-3 text-center" style={{ background: stat.bg, border: `1px solid ${stat.border}` }}>
            <div className="text-xl font-bold" style={{ color: stat.color }}>
              {isLoading ? "-" : stat.value}
            </div>
            <div className="text-xs" style={{ color: "#64748B" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Proposal form */}
      <div className="rounded-xl p-4" style={{ background: "#FFFFFF", border: "1px solid #E2EAF4", boxShadow: "0 1px 6px rgba(27,58,92,0.06)" }}>
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "#1E3A5F" }}>
          <Send size={14} style={{ color: "#3B82F6" }} /> 제안 접수 폼
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div className="md:col-span-2">
            <label className="text-xs mb-1 block font-medium" style={{ color: "#475569" }}>
              제목 <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <input
              type="text"
              placeholder="제안 제목을 입력하세요"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "#F8FAFC", border: "1px solid #E2EAF4", color: "#334155" }}
            />
          </div>

          <div>
            <label className="text-xs mb-1 block font-medium" style={{ color: "#475569" }}>
              지역 <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <select
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "#F8FAFC", border: "1px solid #E2EAF4", color: form.region ? "#334155" : "#94A3B8" }}
            >
              {regions18.map((r) => (
                <option key={r} value={r === "지역 선택" ? "" : r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs mb-1 block font-medium" style={{ color: "#475569" }}>
              분야 <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <select
              value={form.field}
              onChange={(e) => setForm({ ...form, field: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "#F8FAFC", border: "1px solid #E2EAF4", color: form.field ? "#334155" : "#94A3B8" }}
            >
              {fieldOptions.map((f) => (
                <option key={f} value={f === "분야 선택" ? "" : f}>{f}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs mb-1 block font-medium" style={{ color: "#475569" }}>이름 (선택)</label>
            <input
              type="text"
              placeholder="익명으로 제출 가능합니다"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "#F8FAFC", border: "1px solid #E2EAF4", color: "#334155" }}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs mb-1 block font-medium" style={{ color: "#475569" }}>
              제안 내용 <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <textarea
              placeholder="구체적인 제안 내용을 작성해주세요. 문제 상황, 개선 방안, 기대 효과 등을 포함하면 더욱 좋습니다."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: "#F8FAFC", border: "1px solid #E2EAF4", color: "#334155" }}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
            style={{ background: "#1D4ED8", color: "white" }}
          >
            {isSubmitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            제안 제출하기
          </button>
        </div>
      </div>

      {/* Kanban board */}
      <div>
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "#1E3A5F" }}>
          <Eye size={14} style={{ color: "#64748B" }} /> 검토 현황 (칸반보드)
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin" style={{ color: "#94A3B8" }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(["접수", "검토중", "반영"] as const).map((status) => {
              const sc = kanbanStyle[status];
              const items = kanbanGroups[status] ?? [];
              return (
                <div key={status} className="rounded-xl p-3" style={{ background: sc.bg, border: `1px solid ${sc.border}` }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold" style={{ color: sc.color }}>{kanbanLabels[status]}</span>
                    <span className="text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold" style={{ background: "white", color: sc.color }}>
                      {items.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {items.length === 0 ? (
                      <p className="text-xs text-center py-2" style={{ color: "#94A3B8" }}>없음</p>
                    ) : (
                      items.map((item) => (
                        <div key={item.id} className="rounded-lg p-2.5" style={{ background: "white", border: "1px solid #E2EAF4", boxShadow: "0 1px 3px rgba(27,58,92,0.04)" }}>
                          <p className="text-xs font-medium mb-1.5" style={{ color: "#334155" }}>{item.title}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              {item.region && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "#EFF6FF", color: "#1D4ED8", fontSize: "10px" }}>
                                  {item.region}
                                </span>
                              )}
                              <span className="text-xs" style={{ color: "#94A3B8", fontSize: "10px" }}>
                                {formatDate(item.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Feedback section - 반영된 제안 */}
      {reflectedProposals.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: "#FFFFFF", border: "1px solid #E2EAF4", boxShadow: "0 1px 6px rgba(27,58,92,0.06)" }}>
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "#1E3A5F" }}>
            <CheckCircle size={14} style={{ color: "#065F46" }} /> 반영 결과 피드백
          </h2>
          <div className="space-y-2">
            {reflectedProposals.map((item) => (
              <div key={item.id} className="rounded-lg p-3" style={{ background: "#ECFDF5", border: "1px solid #A7F3D0" }}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-xs font-medium" style={{ color: "#334155" }}>{item.title}</p>
                  <span className="text-xs px-1.5 py-0.5 rounded shrink-0 font-medium" style={{ background: "#D1FAE5", color: "#065F46", fontSize: "10px" }}>정책반영</span>
                </div>
                <p className="text-xs" style={{ color: "#94A3B8", fontSize: "10px" }}>
                  {item.region ?? ""} · {formatDate(item.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
