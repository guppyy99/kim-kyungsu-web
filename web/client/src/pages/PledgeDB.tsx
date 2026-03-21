/**
 * PledgeDB Page - 18개 시·군 공약DB
 * Design: 라이트 메인 + 블루 사이드바
 * DB 연동: 관리자가 등록한 공약 실시간 반영
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Search, MapPin, Loader2 } from "lucide-react";

const regions = [
  "전체", "창원", "김해", "양산", "진주", "통영", "사천",
  "밀양", "거제", "고성", "남해", "하동", "산청", "함양",
  "거창", "합천", "창녕", "함안", "의령",
];

const categories = [
  "전체", "경제·일자리", "교육·청년", "복지·의료", "교통·인프라",
  "우주항공·방산", "환경·관광", "농림·수산", "문화·체육",
];

const categoryColorMap: Record<string, { color: string; bg: string; border: string }> = {
  "경제·일자리":  { color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
  "교육·청년":    { color: "#6D28D9", bg: "#F5F3FF", border: "#DDD6FE" },
  "복지·의료":    { color: "#065F46", bg: "#ECFDF5", border: "#A7F3D0" },
  "교통·인프라":  { color: "#92400E", bg: "#FFFBEB", border: "#FDE68A" },
  "우주항공·방산":{ color: "#1E40AF", bg: "#EFF6FF", border: "#93C5FD" },
  "환경·관광":    { color: "#14532D", bg: "#F0FDF4", border: "#86EFAC" },
  "농림·수산":    { color: "#166534", bg: "#F0FDF4", border: "#86EFAC" },
  "문화·체육":    { color: "#9A3412", bg: "#FFF7ED", border: "#FDBA74" },
};

const statusColorMap: Record<string, { color: string; bg: string }> = {
  "공약":   { color: "#64748B", bg: "#F1F5F9" },
  "추진중": { color: "#1D4ED8", bg: "#DBEAFE" },
  "완료":   { color: "#065F46", bg: "#D1FAE5" },
  "보류":   { color: "#DC2626", bg: "#FEE2E2" },
};

export default function PledgeDB() {
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // DB에서 공약 데이터 조회
  const { data: pledgesData, isLoading } = trpc.pledges.list.useQuery({});

  const pledges = pledgesData ?? [];

  const filtered = pledges.filter((p) => {
    const matchRegion = selectedRegion === "전체" || p.region === selectedRegion;
    const matchCat = selectedCategory === "전체" || p.category === selectedCategory;
    const matchSearch = !searchQuery ||
      p.title.includes(searchQuery) ||
      p.region.includes(searchQuery) ||
      p.category.includes(searchQuery) ||
      (p.description ?? "").includes(searchQuery);
    return matchRegion && matchCat && matchSearch;
  });

  return (
    <div className="p-5 space-y-4">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={18} style={{ color: "#1D4ED8" }} />
            <h1 className="text-lg font-bold" style={{ color: "#1E3A5F" }}>18개 시·군 공약DB</h1>
          </div>
          <p className="text-xs" style={{ color: "#64748B" }}>경남 18개 시·군 지역별 공약을 한눈에 확인하세요</p>
        </div>
        <div className="px-3 py-2 rounded-xl text-center" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
          <div className="text-xl font-bold" style={{ color: "#1D4ED8" }}>{filtered.length}</div>
          <div className="text-xs" style={{ color: "#64748B" }}>공약 수</div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "#FFFFFF", border: "1px solid #E2EAF4" }}>
        <Search size={14} style={{ color: "#94A3B8" }} />
        <input
          type="text"
          placeholder="공약 검색 (지역명, 키워드)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: "#334155" }}
        />
      </div>

      {/* Region filter */}
      <div className="flex flex-wrap gap-1.5">
        {regions.map((r) => (
          <button
            key={r}
            onClick={() => setSelectedRegion(r)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
            style={{
              background: selectedRegion === r ? "#1D4ED8" : "#F1F5F9",
              color: selectedRegion === r ? "white" : "#475569",
              border: `1px solid ${selectedRegion === r ? "#1D4ED8" : "#E2E8F0"}`,
            }}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
            style={{
              background: selectedCategory === c ? "#EFF6FF" : "transparent",
              color: selectedCategory === c ? "#1D4ED8" : "#64748B",
              border: `1px solid ${selectedCategory === c ? "#BFDBFE" : "#E2E8F0"}`,
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin" style={{ color: "#94A3B8" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2EAF4" }}>
          <MapPin size={32} className="mx-auto mb-3" style={{ color: "#CBD5E1" }} />
          <p className="text-sm font-medium" style={{ color: "#64748B" }}>
            {pledges.length === 0 ? "등록된 공약이 없습니다." : "조건에 맞는 공약이 없습니다."}
          </p>
          <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
            {pledges.length === 0 ? "관리자 페이지에서 공약을 등록해 주세요." : "다른 지역이나 분야를 선택해 보세요."}
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs" style={{ color: "#94A3B8" }}>{filtered.length}개 공약</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((pledge) => {
              const cs = categoryColorMap[pledge.category] || { color: "#64748B", bg: "#F1F5F9", border: "#E2E8F0" };
              const ss = statusColorMap[pledge.status] || { color: "#64748B", bg: "#F1F5F9" };
              const isExpanded = expandedId === pledge.id;

              return (
                <div
                  key={pledge.id}
                  className="rounded-xl p-4 notion-card"
                  style={{ background: "#FFFFFF", border: "1px solid #E2EAF4", boxShadow: "0 1px 4px rgba(27,58,92,0.05)" }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: cs.bg, color: cs.color, border: `1px solid ${cs.border}` }}>
                        {pledge.region}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: cs.bg, color: cs.color, border: `1px solid ${cs.border}` }}>
                        {pledge.category}
                      </span>
                    </div>
                    <span className="text-xs px-1.5 py-0.5 rounded shrink-0" style={{ background: ss.bg, color: ss.color, fontSize: "10px" }}>
                      {pledge.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold mb-1.5" style={{ color: "#1E3A5F" }}>{pledge.title}</h3>
                  {pledge.description && (
                    <p className="text-xs mb-3" style={{ color: "#64748B", lineHeight: "1.7" }}>{pledge.description}</p>
                  )}

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1" style={{ color: "#94A3B8" }}>
                      <span>이행 진행률</span>
                      <span>{pledge.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ background: "#F1F5F9" }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(pledge.progress, 2)}%`,
                          background: "linear-gradient(90deg, #3B82F6, #1D4ED8)",
                        }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : pledge.id)}
                    className="text-xs flex items-center gap-1"
                    style={{ color: "#3B82F6" }}
                  >
                    상세 이행계획 {isExpanded ? "▲" : "▼"}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 p-3 rounded-lg text-xs" style={{ background: "#F8FAFC", color: "#64748B", lineHeight: "1.8", border: "1px solid #E2EAF4" }}>
                      {pledge.description ?? "상세 이행계획은 공약집 발표 후 업데이트 예정입니다. 도민 제안함을 통해 의견을 남겨주세요."}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
