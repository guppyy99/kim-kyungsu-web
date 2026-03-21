/**
 * 관리자 - 일정 관리 페이지 (모바일 반응형)
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Calendar, Plus, Pencil, Trash2, X, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type ScheduleLabel = "이동" | "행사" | "현장" | "내부" | "회의";

interface FormState {
  scheduleDate: string;
  time: string;
  label: ScheduleLabel;
  title: string;
  isCurrent: boolean;
}

const defaultForm: FormState = {
  scheduleDate: new Date().toISOString().slice(0, 10).replace(/-/g, "."),
  time: "09:00",
  label: "행사",
  title: "",
  isCurrent: false,
};

const labelColors: Record<string, { bg: string; color: string }> = {
  "이동": { bg: "#F1F5F9", color: "#64748B" },
  "행사": { bg: "#DBEAFE", color: "#1D4ED8" },
  "현장": { bg: "#D1FAE5", color: "#065F46" },
  "내부": { bg: "#F1F5F9", color: "#64748B" },
  "회의": { bg: "#EDE9FE", color: "#6D28D9" },
};

export default function AdminSchedules() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);

  const utils = trpc.useUtils();

  const { data: list = [], isLoading } = trpc.schedules.list.useQuery({}, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const createMutation = trpc.schedules.create.useMutation({
    onSuccess: () => {
      toast.success("일정이 등록되었습니다.");
      utils.schedules.list.invalidate();
      setShowForm(false);
      setForm(defaultForm);
    },
    onError: () => toast.error("등록에 실패했습니다."),
  });

  const updateMutation = trpc.admin.updateSchedule.useMutation({
    onSuccess: () => {
      toast.success("수정되었습니다.");
      utils.schedules.list.invalidate();
      setEditId(null);
      setShowForm(false);
      setForm(defaultForm);
    },
    onError: () => toast.error("수정에 실패했습니다."),
  });

  const deleteMutation = trpc.schedules.delete.useMutation({
    onSuccess: () => {
      toast.success("삭제되었습니다.");
      utils.schedules.list.invalidate();
    },
    onError: () => toast.error("삭제에 실패했습니다."),
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

  const handleSubmit = () => {
    if (!form.title.trim()) { toast.error("일정 제목을 입력하세요."); return; }
    if (!form.scheduleDate.trim()) { toast.error("날짜를 입력하세요."); return; }
    if (editId !== null) {
      updateMutation.mutate({ id: editId, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleEdit = (item: typeof list[0]) => {
    setEditId(item.id);
    setForm({
      scheduleDate: item.scheduleDate,
      time: item.time,
      label: item.label as ScheduleLabel,
      title: item.title,
      isCurrent: item.isCurrent,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-4 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={16} style={{ color: "#065F46" }} />
          <h1 className="text-base font-bold" style={{ color: "#1E3A5F" }}>일정 관리</h1>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#D1FAE5", color: "#065F46" }}>
            {list.length}건
          </span>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(defaultForm); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white"
          style={{ background: "#065F46" }}
        >
          <Plus size={13} /> 일정 추가
        </button>
      </div>

      {/* 등록/수정 폼 */}
      {showForm && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: "#F0FDF4", border: "1px solid #A7F3D0" }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: "#1E3A5F" }}>
              {editId !== null ? "일정 수정" : "새 일정 등록"}
            </h2>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(defaultForm); }}>
              <X size={16} style={{ color: "#94A3B8" }} />
            </button>
          </div>

          {/* 날짜 + 시간 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "#64748B" }}>날짜</label>
              <input
                type="text"
                value={form.scheduleDate}
                onChange={(e) => setForm({ ...form, scheduleDate: e.target.value })}
                placeholder="2026.06.01"
                className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
                style={{ borderColor: "#A7F3D0", background: "#FFFFFF" }}
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "#64748B" }}>시간</label>
              <input
                type="text"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                placeholder="09:00"
                className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
                style={{ borderColor: "#A7F3D0", background: "#FFFFFF" }}
              />
            </div>
          </div>

          {/* 구분 */}
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "#64748B" }}>구분</label>
            <select
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value as ScheduleLabel })}
              className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
              style={{ borderColor: "#A7F3D0", background: "#FFFFFF" }}
            >
              {["이동", "행사", "현장", "내부", "회의"].map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* 제목 */}
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "#64748B" }}>일정 제목 *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="일정 내용을 입력하세요"
              className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
              style={{ borderColor: "#A7F3D0", background: "#FFFFFF" }}
            />
          </div>

          {/* 진행중 체크 */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isCurrent"
              checked={form.isCurrent}
              onChange={(e) => setForm({ ...form, isCurrent: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isCurrent" className="text-xs font-medium" style={{ color: "#64748B" }}>현재 진행 중 표시</label>
          </div>

          {/* 버튼 */}
          <div className="flex gap-2">
            <button
              onClick={() => { setShowForm(false); setEditId(null); setForm(defaultForm); }}
              className="flex-1 py-2.5 rounded-lg text-xs font-medium border"
              style={{ borderColor: "#E2E8F0", color: "#64748B" }}
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold text-white disabled:opacity-60"
              style={{ background: "#065F46" }}
            >
              <Check size={13} /> {editId !== null ? "수정 완료" : "등록"}
            </button>
          </div>
        </div>
      )}

      {/* 목록 - 카드 형태 */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "#F1F5F9" }} />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2EAF4" }}>
          <Calendar size={28} className="mx-auto mb-2" style={{ color: "#CBD5E1" }} />
          <p className="text-xs" style={{ color: "#94A3B8" }}>등록된 일정이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((item) => {
            const lc = labelColors[item.label] ?? { bg: "#F1F5F9", color: "#64748B" };
            return (
              <div
                key={item.id}
                className="rounded-xl p-3.5"
                style={{
                  background: item.isCurrent ? "#F0FDF4" : "#FFFFFF",
                  border: `1px solid ${item.isCurrent ? "#A7F3D0" : "#E2EAF4"}`,
                }}
              >
                <div className="flex items-start gap-2.5">
                  {/* 시간 */}
                  <div
                    className="shrink-0 text-center rounded-lg px-2 py-1.5"
                    style={{ background: "#EFF6FF", minWidth: "52px" }}
                  >
                    <p className="text-xs font-mono font-bold" style={{ color: "#3B82F6" }}>{item.time}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#94A3B8", fontSize: "9px" }}>{item.scheduleDate.slice(5)}</p>
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className="text-xs px-1.5 py-0.5 rounded font-medium shrink-0"
                        style={{ background: lc.bg, color: lc.color }}
                      >
                        {item.label}
                      </span>
                      {item.isCurrent && (
                        <span className="text-xs px-1.5 py-0.5 rounded font-bold shrink-0" style={{ background: "#DBEAFE", color: "#1D4ED8", fontSize: "9px" }}>진행중</span>
                      )}
                    </div>
                    <p className="text-sm font-medium mt-1" style={{ color: "#1E3A5F" }}>{item.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>{item.scheduleDate}</p>
                  </div>

                  {/* 수정/삭제 */}
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 rounded-lg"
                      style={{ background: "#ECFDF5" }}
                      title="수정"
                    >
                      <Pencil size={13} style={{ color: "#10B981" }} />
                    </button>
                    <button
                      onClick={() => { if (confirm("정말 삭제하시겠습니까?")) deleteMutation.mutate({ id: item.id }); }}
                      className="p-2 rounded-lg"
                      style={{ background: "#FEF2F2" }}
                      title="삭제"
                    >
                      <Trash2 size={13} style={{ color: "#EF4444" }} />
                    </button>
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
