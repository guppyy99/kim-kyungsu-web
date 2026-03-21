/**
 * 관리자 - 공지사항 관리 페이지 (모바일 반응형)
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Bell, Plus, Pencil, Trash2, X, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type AnnouncementType = "공지" | "보도" | "일정";

interface FormState {
  type: AnnouncementType;
  title: string;
  content: string;
  isNew: boolean;
}

const defaultForm: FormState = { type: "공지", title: "", content: "", isNew: true };

const typeColors: Record<string, { bg: string; color: string }> = {
  "공지": { bg: "#DBEAFE", color: "#1D4ED8" },
  "보도": { bg: "#FEF3C7", color: "#92400E" },
  "일정": { bg: "#D1FAE5", color: "#065F46" },
};

export default function AdminAnnouncements() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);

  const utils = trpc.useUtils();

  const { data: list = [], isLoading } = trpc.announcements.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const createMutation = trpc.announcements.create.useMutation({
    onSuccess: () => {
      toast.success("공지사항이 등록되었습니다.");
      utils.announcements.list.invalidate();
      setShowForm(false);
      setForm(defaultForm);
    },
    onError: () => toast.error("등록에 실패했습니다."),
  });

  const updateMutation = trpc.admin.updateAnnouncement.useMutation({
    onSuccess: () => {
      toast.success("수정되었습니다.");
      utils.announcements.list.invalidate();
      setEditId(null);
      setShowForm(false);
      setForm(defaultForm);
    },
    onError: () => toast.error("수정에 실패했습니다."),
  });

  const deleteMutation = trpc.announcements.delete.useMutation({
    onSuccess: () => {
      toast.success("삭제되었습니다.");
      utils.announcements.list.invalidate();
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
    if (!form.title.trim()) { toast.error("제목을 입력하세요."); return; }
    if (editId !== null) {
      updateMutation.mutate({ id: editId, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleEdit = (item: typeof list[0]) => {
    setEditId(item.id);
    setForm({ type: item.type as AnnouncementType, title: item.title, content: item.content ?? "", isNew: item.isNew });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-4 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={16} style={{ color: "#1D4ED8" }} />
          <h1 className="text-base font-bold" style={{ color: "#1E3A5F" }}>공지사항 관리</h1>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#DBEAFE", color: "#1D4ED8" }}>
            {list.length}건
          </span>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(defaultForm); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white"
          style={{ background: "#1D4ED8" }}
        >
          <Plus size={13} /> 새 공지
        </button>
      </div>

      {/* 등록/수정 폼 */}
      {showForm && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: "#F8FAFF", border: "1px solid #BFDBFE" }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: "#1E3A5F" }}>
              {editId !== null ? "공지사항 수정" : "새 공지사항 등록"}
            </h2>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(defaultForm); }}>
              <X size={16} style={{ color: "#94A3B8" }} />
            </button>
          </div>

          {/* 유형 + NEW 표시 */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium mb-1 block" style={{ color: "#64748B" }}>유형</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as AnnouncementType })}
                className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
                style={{ borderColor: "#BFDBFE", background: "#FFFFFF" }}
              >
                <option value="공지">공지</option>
                <option value="보도">보도</option>
                <option value="일정">일정</option>
              </select>
            </div>
            <div className="flex items-end pb-2 gap-2">
              <input
                type="checkbox"
                id="isNew"
                checked={form.isNew}
                onChange={(e) => setForm({ ...form, isNew: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isNew" className="text-xs font-medium" style={{ color: "#64748B" }}>NEW</label>
            </div>
          </div>

          {/* 제목 */}
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "#64748B" }}>제목 *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="공지사항 제목"
              className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
              style={{ borderColor: "#BFDBFE", background: "#FFFFFF" }}
            />
          </div>

          {/* 내용 */}
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "#64748B" }}>내용</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="공지 내용 (선택)"
              rows={4}
              className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none resize-none"
              style={{ borderColor: "#BFDBFE", background: "#FFFFFF" }}
            />
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
              style={{ background: "#1D4ED8" }}
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
          <Bell size={28} className="mx-auto mb-2" style={{ color: "#CBD5E1" }} />
          <p className="text-xs" style={{ color: "#94A3B8" }}>등록된 공지사항이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((item) => {
            const tc = typeColors[item.type] ?? { bg: "#F1F5F9", color: "#64748B" };
            return (
              <div
                key={item.id}
                className="rounded-xl p-3.5"
                style={{ background: "#FFFFFF", border: "1px solid #E2EAF4" }}
              >
                <div className="flex items-start gap-2.5">
                  {/* 유형 배지 */}
                  <span
                    className="text-xs px-2 py-0.5 rounded font-medium shrink-0 mt-0.5"
                    style={{ background: tc.bg, color: tc.color }}
                  >
                    {item.type}
                  </span>

                  {/* 제목 + 날짜 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-medium" style={{ color: "#1E3A5F" }}>{item.title}</p>
                      {item.isNew && (
                        <span className="text-xs px-1.5 py-0.5 rounded font-bold shrink-0" style={{ background: "#FEE2E2", color: "#DC2626", fontSize: "9px" }}>NEW</span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>
                      {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                    </p>
                    {item.content && (
                      <p className="text-xs mt-1 line-clamp-1" style={{ color: "#64748B" }}>{item.content}</p>
                    )}
                  </div>

                  {/* 수정/삭제 버튼 */}
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 rounded-lg"
                      style={{ background: "#EFF6FF" }}
                      title="수정"
                    >
                      <Pencil size={13} style={{ color: "#3B82F6" }} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("정말 삭제하시겠습니까?")) deleteMutation.mutate({ id: item.id });
                      }}
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
