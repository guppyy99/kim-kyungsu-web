/**
 * 관리자 - 정책 자료 관리 페이지 (모바일 반응형)
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { BookOpen, Plus, Pencil, Trash2, X, Check, AlertCircle, Upload, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type DocCategory = "심층리포트" | "보도자료" | "카드뉴스";

interface FormState {
  title: string;
  category: DocCategory;
  description: string;
  fileBase64: string;
  fileName: string;
  fileMime: string;
}

const defaultForm: FormState = {
  title: "",
  category: "보도자료",
  description: "",
  fileBase64: "",
  fileName: "",
  fileMime: "",
};

const categoryColors: Record<string, { bg: string; color: string }> = {
  "심층리포트": { bg: "#EDE9FE", color: "#6D28D9" },
  "보도자료": { bg: "#DBEAFE", color: "#1D4ED8" },
  "카드뉴스": { bg: "#D1FAE5", color: "#065F46" },
};

export default function AdminPolicy() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);

  const utils = trpc.useUtils();

  const { data: list = [], isLoading } = trpc.policyDocs.list.useQuery({}, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const createMutation = trpc.policyDocs.create.useMutation({
    onSuccess: () => {
      toast.success("정책 자료가 등록되었습니다.");
      utils.policyDocs.list.invalidate();
      setShowForm(false);
      setForm(defaultForm);
    },
    onError: () => toast.error("등록에 실패했습니다."),
  });

  const updateMutation = trpc.admin.updatePolicyDoc.useMutation({
    onSuccess: () => {
      toast.success("수정되었습니다.");
      utils.policyDocs.list.invalidate();
      setEditId(null);
      setShowForm(false);
      setForm(defaultForm);
    },
    onError: () => toast.error("수정에 실패했습니다."),
  });

  const deleteMutation = trpc.policyDocs.delete.useMutation({
    onSuccess: () => {
      toast.success("삭제되었습니다.");
      utils.policyDocs.list.invalidate();
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("파일 크기는 10MB 이하여야 합니다."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setForm({ ...form, fileBase64: base64, fileName: file.name, fileMime: file.type });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) { toast.error("제목을 입력하세요."); return; }
    if (editId !== null) {
      updateMutation.mutate({ id: editId, title: form.title, category: form.category, description: form.description });
    } else {
      createMutation.mutate({
        title: form.title,
        category: form.category,
        description: form.description,
        ...(form.fileBase64 ? { fileBase64: form.fileBase64, fileName: form.fileName, fileMime: form.fileMime } : {}),
      });
    }
  };

  const handleEdit = (item: typeof list[0]) => {
    setEditId(item.id);
    setForm({ title: item.title, category: item.category as DocCategory, description: item.description ?? "", fileBase64: "", fileName: "", fileMime: "" });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-4 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={16} style={{ color: "#6D28D9" }} />
          <h1 className="text-base font-bold" style={{ color: "#1E3A5F" }}>정책 자료 관리</h1>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#EDE9FE", color: "#6D28D9" }}>
            {list.length}건
          </span>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(defaultForm); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white"
          style={{ background: "#6D28D9" }}
        >
          <Plus size={13} /> 자료 등록
        </button>
      </div>

      {/* 등록/수정 폼 */}
      {showForm && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: "#FAF5FF", border: "1px solid #DDD6FE" }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: "#1E3A5F" }}>
              {editId !== null ? "정책 자료 수정" : "새 정책 자료 등록"}
            </h2>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(defaultForm); }}>
              <X size={16} style={{ color: "#94A3B8" }} />
            </button>
          </div>

          {/* 제목 */}
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "#64748B" }}>제목 *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="자료 제목을 입력하세요"
              className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
              style={{ borderColor: "#DDD6FE", background: "#FFFFFF" }}
            />
          </div>

          {/* 분류 */}
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "#64748B" }}>분류</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as DocCategory })}
              className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
              style={{ borderColor: "#DDD6FE", background: "#FFFFFF" }}
            >
              <option value="심층리포트">심층리포트</option>
              <option value="보도자료">보도자료</option>
              <option value="카드뉴스">카드뉴스</option>
            </select>
          </div>

          {/* 설명 */}
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "#64748B" }}>설명</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="자료에 대한 간략한 설명 (선택)"
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none resize-none"
              style={{ borderColor: "#DDD6FE", background: "#FFFFFF" }}
            />
          </div>

          {/* 파일 첨부 */}
          {editId === null && (
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "#64748B" }}>파일 첨부 (PDF, 이미지 등, 최대 10MB)</label>
              <label
                className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed cursor-pointer text-xs"
                style={{ borderColor: "#DDD6FE", color: "#6D28D9" }}
              >
                <Upload size={14} />
                {form.fileName ? form.fileName : "파일을 선택하세요"}
                <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg,.gif,.ppt,.pptx,.doc,.docx" />
              </label>
            </div>
          )}

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
              style={{ background: "#6D28D9" }}
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
            <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: "#F1F5F9" }} />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2EAF4" }}>
          <BookOpen size={28} className="mx-auto mb-2" style={{ color: "#CBD5E1" }} />
          <p className="text-xs" style={{ color: "#94A3B8" }}>등록된 정책 자료가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((item) => {
            const cc = categoryColors[item.category] ?? { bg: "#F1F5F9", color: "#64748B" };
            const dateStr = new Date(item.createdAt).toLocaleDateString("ko-KR");
            return (
              <div
                key={item.id}
                className="rounded-xl p-3.5"
                style={{ background: "#FFFFFF", border: "1px solid #E2EAF4" }}
              >
                {/* 상단: 배지 + 날짜 + 버튼 */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: cc.bg, color: cc.color }}>
                      {item.category}
                    </span>
                    <span className="text-xs" style={{ color: "#94A3B8" }}>{dateStr}</span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => handleEdit(item)} className="p-2 rounded-lg" style={{ background: "#FAF5FF" }} title="수정">
                      <Pencil size={13} style={{ color: "#8B5CF6" }} />
                    </button>
                    <button
                      onClick={() => { if (confirm("정말 삭제하시겠습니까?")) deleteMutation.mutate({ id: item.id }); }}
                      className="p-2 rounded-lg" style={{ background: "#FEF2F2" }} title="삭제"
                    >
                      <Trash2 size={13} style={{ color: "#EF4444" }} />
                    </button>
                  </div>
                </div>

                {/* 제목 */}
                <p className="text-sm font-medium" style={{ color: "#1E3A5F" }}>{item.title}</p>
                {item.description && (
                  <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "#94A3B8" }}>{item.description}</p>
                )}

                {/* 파일 링크 */}
                {item.fileUrl && (
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 mt-2 text-xs"
                    style={{ color: "#3B82F6" }}
                  >
                    <ExternalLink size={11} />
                    {item.fileName ?? "파일 보기"}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
