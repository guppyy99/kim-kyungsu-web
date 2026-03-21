/**
 * DailySchedule Page - 김경수의 하루
 * Design: 라이트 메인 + 블루 사이드바
 * DB 연동: 관리자가 등록한 일정 실시간 반영
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Clock, MapPin, MessageCircle, Loader2, CalendarDays } from "lucide-react";

const labelColorMap: Record<string, { color: string; bg: string }> = {
  "이동":  { color: "#92400E", bg: "#FEF3C7" },
  "행사":  { color: "#1D4ED8", bg: "#DBEAFE" },
  "현장":  { color: "#065F46", bg: "#D1FAE5" },
  "내부":  { color: "#64748B", bg: "#F1F5F9" },
  "회의":  { color: "#6D28D9", bg: "#EDE9FE" },
};

export default function DailySchedule() {
  // 오늘 날짜 (YYYY.MM.DD 형식)
  const today = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}.${m}.${day}`;
  }, []);

  // DB에서 전체 일정 조회
  const { data: allSchedules, isLoading } = trpc.schedules.list.useQuery({});

  // 날짜별로 그룹핑
  const dateGroups = useMemo(() => {
    if (!allSchedules) return {};
    const groups: Record<string, typeof allSchedules> = {};
    for (const s of allSchedules) {
      if (!groups[s.scheduleDate]) groups[s.scheduleDate] = [];
      groups[s.scheduleDate].push(s);
    }
    return groups;
  }, [allSchedules]);

  // 사용 가능한 날짜 목록 (최신순)
  const availableDates = useMemo(() => {
    return Object.keys(dateGroups).sort((a, b) => b.localeCompare(a));
  }, [dateGroups]);

  // 선택된 날짜 (기본: 오늘 or 첫 번째 날짜)
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const activeDate = selectedDate ?? (availableDates.includes(today) ? today : availableDates[0] ?? null);

  const daySchedules = activeDate ? (dateGroups[activeDate] ?? []) : [];

  // 날짜 표시 레이블
  const getDateLabel = (date: string) => {
    if (date === today) return `오늘 (${date})`;
    return date;
  };

  return (
    <div className="p-5 space-y-4">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Clock size={18} style={{ color: "#1D4ED8" }} />
          <h1 className="text-lg font-bold" style={{ color: "#1E3A5F" }}>김경수의 하루</h1>
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium live-badge"
            style={{ background: "#DBEAFE", color: "#1D4ED8", border: "1px solid #BFDBFE" }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            LIVE
          </div>
        </div>
        <p className="text-xs" style={{ color: "#64748B" }}>후보의 실시간 동선과 현장 이야기를 투명하게 공개합니다</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin" style={{ color: "#94A3B8" }} />
        </div>
      ) : availableDates.length === 0 ? (
        <div className="text-center py-12 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2EAF4" }}>
          <CalendarDays size={32} className="mx-auto mb-3" style={{ color: "#CBD5E1" }} />
          <p className="text-sm font-medium" style={{ color: "#64748B" }}>등록된 일정이 없습니다.</p>
          <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>관리자 페이지에서 일정을 등록해 주세요.</p>
        </div>
      ) : (
        <>
          {/* Date tabs */}
          <div className="flex gap-2 flex-wrap">
            {availableDates.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: activeDate === date ? "#1D4ED8" : "#F1F5F9",
                  color: activeDate === date ? "white" : "#475569",
                  border: `1px solid ${activeDate === date ? "#1D4ED8" : "#E2E8F0"}`,
                }}
              >
                {getDateLabel(date)}
              </button>
            ))}
          </div>

          {daySchedules.length === 0 ? (
            <div className="text-center py-8 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2EAF4" }}>
              <p className="text-sm" style={{ color: "#64748B" }}>이 날의 일정이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Timeline */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={14} style={{ color: "#94A3B8" }} />
                  <span className="text-xs font-semibold" style={{ color: "#475569" }}>
                    실시간 동선 · 만남 · {activeDate}
                  </span>
                </div>

                {daySchedules.map((item, idx) => {
                  const lc = labelColorMap[item.label] ?? { color: "#64748B", bg: "#F1F5F9" };
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{
                            background: item.isCurrent ? "#1D4ED8" : "#F1F5F9",
                            color: item.isCurrent ? "white" : "#64748B",
                            border: item.isCurrent ? "none" : "1px solid #E2E8F0",
                          }}
                        >
                          {idx + 1}
                        </div>
                        <div className="w-px flex-1 mt-1" style={{ background: "#E2EAF4", minHeight: "20px" }} />
                      </div>

                      <div
                        className="flex-1 rounded-xl p-3 mb-2"
                        style={{
                          background: item.isCurrent ? "#EFF6FF" : "#FFFFFF",
                          border: `1px solid ${item.isCurrent ? "#BFDBFE" : "#E2EAF4"}`,
                          boxShadow: item.isCurrent ? "0 2px 8px rgba(29,78,216,0.1)" : "0 1px 3px rgba(27,58,92,0.04)",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-xs font-mono font-bold" style={{ color: "#3B82F6" }}>{item.time}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: lc.bg, color: lc.color }}>
                            {item.label}
                          </span>
                          {item.isCurrent && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium live-badge" style={{ background: "#DBEAFE", color: "#1D4ED8", border: "1px solid #BFDBFE" }}>
                              현재 위치
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold" style={{ color: "#1E3A5F" }}>{item.title}</h3>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right column: summary */}
              <div className="space-y-4">
                <div className="rounded-xl p-3.5" style={{ background: "#FFFFFF", border: "1px solid #E2EAF4", boxShadow: "0 1px 4px rgba(27,58,92,0.05)" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <MessageCircle size={13} style={{ color: "#94A3B8" }} />
                    <span className="text-xs font-semibold" style={{ color: "#475569" }}>일정 요약</span>
                  </div>
                  <div className="space-y-2">
                    {daySchedules.map((item) => {
                      const lc = labelColorMap[item.label] ?? { color: "#64748B", bg: "#F1F5F9" };
                      return (
                        <div key={item.id} className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold w-12 shrink-0" style={{ color: "#3B82F6" }}>{item.time}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded shrink-0" style={{ background: lc.bg, color: lc.color }}>
                            {item.label}
                          </span>
                          <span className="text-xs truncate" style={{ color: item.isCurrent ? "#1D4ED8" : "#475569", fontWeight: item.isCurrent ? 600 : 400 }}>
                            {item.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl p-3.5" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: "#1E3A5F" }}>총 {daySchedules.length}개 일정</p>
                  <p className="text-xs" style={{ color: "#64748B" }}>
                    {daySchedules.filter(s => s.isCurrent).length > 0
                      ? "현재 진행 중인 일정이 있습니다."
                      : "현재 진행 중인 일정이 없습니다."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
