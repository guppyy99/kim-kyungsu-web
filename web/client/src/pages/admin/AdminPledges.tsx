/**
 * 관리자 - 공약 관리 페이지 (모바일 반응형)
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { MapPin, Plus, Pencil, Trash2, X, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const CITIES = ["창원", "진주", "통영", "사천", "김해", "밀양", "거제", "양산", "의령", "함안", "창녕", "고성", "남해", "하동", "산청", "함양", "거창", "합천"];
const CATEGORIES = ["경제·일자리", "교육·청년", "복지·의료", "교통·인프라", "우주항공·방산", "환경·관광", "농림·수산", "문화·체육"];

interface FormState {
  region: string;
  category: string;
  title: string;
  description: string;
  progress: number;
}

const defaultForm: FormState = {
  region: "창원",
  category: "경제·일자리",
  title: "",
  description: "",
  progress: 0,
};

export default function AdminPledges() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [filterRegion, setFilterRegion] = useState("전체");
  const [filterCategory, setFilterCategory] = useState("전체");

  const utils = trpc.useUtils();

  const { data: list = [], isLoading } = trpc.pledges.list.useQuery(
    { region: filterRegion !== "전체" ? filterRegion : undefined, category: filterCategory !== "전체" ? filterCategory : undefined },
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const createMutation = trpc.pledges.create.useMutation({
    onSuccess: () => {
      toast.success("공약이 등록되었습니다.");
      utils.pledges.list.invalidate();
      setShowForm(false);
      setForm(defaultForm);
    },
    onError: () => toast.error("등록에 실패했습니다."),
  });

  const updateMutation = trpc.pledges.update.useMutation({
    onSuccess: () => {
      toast.success("수정되었습니다.");
      utils.pledges.list.invalidate();
      setEditId(null);
      setShowForm(false);
      setForm(defaultForm);
    },
    onError: () => toast.error("수정에 실패했습니다."),
  });

  const deleteMutation = trpc.pledges.delete.useMutation({
    onSuccess: () => {
      toast.success("삭제되었습니다.");
      utils.pledges.list.invalidate();
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
    if (!form.title.trim()) { toast.error("공약 제목을 입력하세요."); return; }
    if (editId !== null) {
      updateMutation.mutate({ id: editId, region: form.region, category: form.category, title: form.title, description: form.description, progress: form.progress });
    } else {
      createMutation.mutate({ region: form.region, category: form.category, title: form.title, description: form.description, progress: form.progress });
    }
  };

  const handleEdit = (item: typeof list[0]) => {
    setEditId(item.id);
    setForm({ region: item.region, category: item.category, title: item.title, description: item.description ?? "", progress: item.progress });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-4 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin size={16} style={{ color: "#1D4ED8" }} />
          <h1 className="text-base font-bold" style={{ color: "#1E3A5F" }}>공약 관리</h1>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#DBEAFE", color: "#1D4ED8" }}>
            {list.length}건
          </span>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(defaultForm); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white"
          style={{ background: "#1D4ED8" }}
        >
          <Plus size={13} /> 공약 추가
        </button>
      </div>

      {/* 지역 필터 - 가로 스크롤 */}
      <div>
        <p className="text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>지역</p>
        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {["전체", ...CITIES].map((r) => (
            <button
              key={r}
              onClick={() => setFilterRegion(r)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium shrink-0"
              style={{ background: filterRegion === r ? "#1D4ED8" : "#F1F5F9", color: filterRegion === r ? "white" : "#64748B" }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* 분야 필터 - 가로 스크롤 */}
      <div>
        <p className="text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>분야</p>
        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {["전체", ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setFilterCategory(c)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium shrink-0"
              style={{ background: filterCategory === c ? "#6D28D9" : "#F1F5F9", color: filterCategory === c ? "white" : "#64748B" }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* 등록/수정 폼 */}
      {showForm && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: "#1E3A5F" }}>
              {editId !== null ? "공약 수정" : "새 공약 등록"}
            </h2>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(defaultForm); }}>
              <X size={16} style={{ color: "#94A3B8" }} />
            </button>
          </div>

          {/* 지역 + 분야 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "#64748B" }}>지역</label>
              <select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none" style={{ borderColor: "#BFDBFE", background: "#FFFFFF" }}>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "#64748B" }}>분야</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none" style={{ borderColor: "#BFDBFE", background: "#FFFFFF" }}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* 진행률 */}
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "#64748B" }}>이행 진행률 ({form.progress}%)</label>
            <input type="range" min={0} max={100} value={form.progress}
              onChange={(e) => setForm({ ...form, progress: parseInt(e.target.value) })}
              className="w-full" />
          </div>

          {/* 제목 */}
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "#64748B" }}>공약 제목 *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="공약 제목을 입력하세요"
              className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none" style={{ borderColor: "#BFDBFE", background: "#FFFFFF" }} />
          </div>

          {/* 세부 내용 */}
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "#64748B" }}>세부 내용</label>
            <textarea
              placeholder="공약 세부 내용 (선택)" rows={3}
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none resize-none" style={{ borderColor: "#BFDBFE", background: "#FFFFFF" }} />
          </div>

          {/* 버튼 */}
          <div className="flex gap-2">
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(defaultForm); }}
              className="flex-1 py-2.5 rounded-lg text-xs font-medium border" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>
              취소
            </button>
            <button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold text-white disabled:opacity-60"
              style={{ background: "#1D4ED8" }}>
              <Check size={13} /> {editId !== null ? "수정 완료" : "등록"}
            </button>
          </div>
        </div>
      )}

      {/* 목록 - 카드 형태 */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: "#F1F5F9" }} />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2EAF4" }}>
          <MapPin size={28} className="mx-auto mb-2" style={{ color: "#CBD5E1" }} />
          <p className="text-xs" style={{ color: "#94A3B8" }}>등록된 공약이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((item) => (
            <div
              key={item.id}
              className="rounded-xl p-3.5"
              style={{ background: "#FFFFFF", border: "1px solid #E2EAF4" }}
            >
              {/* 상단: 배지 + 버튼 */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex gap-1.5 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: "#DBEAFE", color: "#1D4ED8" }}>{item.region}</span>
                  <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: "#EDE9FE", color: "#6D28D9" }}>{item.category}</span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleEdit(item)} className="p-2 rounded-lg" style={{ background: "#EFF6FF" }} title="수정">
                    <Pencil size={13} style={{ color: "#3B82F6" }} />
                  </button>
                  <button onClick={() => { if (confirm("정말 삭제하시겠습니까?")) deleteMutation.mutate({ id: item.id }); }}
                    className="p-2 rounded-lg" style={{ background: "#FEF2F2" }} title="삭제">
                    <Trash2 size={13} style={{ color: "#EF4444" }} />
                  </button>
                </div>
              </div>

              {/* 제목 */}
              <p className="text-sm font-medium mb-0.5" style={{ color: "#1E3A5F" }}>{item.title}</p>
              {item.description && (
                <p className="text-xs line-clamp-1 mb-2" style={{ color: "#94A3B8" }}>{item.description}</p>
              )}

              {/* 진행률 바 */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 rounded-full" style={{ background: "#E2E8F0" }}>
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: `${item.progress}%`,
                      background: item.progress >= 80 ? "#10B981" : item.progress >= 40 ? "#F59E0B" : "#3B82F6"
                    }}
                  />
                </div>
                <span className="text-xs font-mono font-bold w-8 text-right" style={{ color: "#475569" }}>{item.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
