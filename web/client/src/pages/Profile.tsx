/**
 * Profile Page - 김경수 후보 프로필
 * Design: 라이트 메인 + 블루 사이드바
 */
import { User, Award, Briefcase, BookOpen, Heart, ChevronRight } from "lucide-react";

const PROFILE_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663275956251/2tf7d959bKmS3eN22yndrr/kimkyungsu-profile_cbc0ddef.png";

const career = [
  { year: "2025", title: "더불어민주당 경남도지사 예비후보 등록", org: "더불어민주당" },
  { year: "2023–2025", title: "더불어민주당 당대표 비서실장", org: "더불어민주당" },
  { year: "2021–2023", title: "복역 후 정치 활동 재개", org: "" },
  { year: "2018–2021", title: "제38대 경상남도지사 (민선 7기)", org: "경상남도" },
  { year: "2016–2018", title: "제20대 국회의원 (김해을)", org: "더불어민주당" },
  { year: "2012–2016", title: "제19대 국회의원 (김해을)", org: "민주통합당 / 새정치민주연합" },
  { year: "2004–2008", title: "제17대 국회의원 (김해을)", org: "열린우리당" },
  { year: "2002–2003", title: "청와대 민정수석비서관실 행정관", org: "청와대" },
];

const education = [
  { year: "1991", title: "경희대학교 법학과 졸업", org: "경희대학교" },
  { year: "1987", title: "경남고등학교 졸업", org: "경남고등학교" },
  { year: "1984", title: "창원 중앙초등학교 졸업", org: "창원 중앙초등학교" },
];

const pledgeHighlights = [
  { icon: "🚀", title: "우주항공·방산 산업 수도", desc: "남해안권 우주항공산업 벨트 구축, KAI·한화에어로스페이스 연계 클러스터 조성" },
  { icon: "🚄", title: "서부경남 KTX 조기 완공", desc: "남부내륙철도 이재명 대통령 임기 내 완공, 통영·거제 남해안 관광 대전환" },
  { icon: "👨‍💼", title: "청년 정착 지원 패키지", desc: "청년 주거·취업·창업 종합 지원으로 경남 인구 유출 방지" },
  { icon: "🏥", title: "의료 취약지 해소", desc: "공공의료원 확충·원격진료 시스템 구축으로 18개 시군 의료 접근성 강화" },
  { icon: "🌿", title: "탄소중립 경남", desc: "2030 탄소중립 달성, 재생에너지 확대 및 친환경 교통 체계 구축" },
];

const values = [
  { label: "현장 중심", desc: "매달 18개 시·군 현장을 직접 찾아 도민의 목소리를 듣겠습니다." },
  { label: "투명 행정", desc: "모든 정책 결정 과정을 도민에게 투명하게 공개하겠습니다." },
  { label: "협치 리더십", desc: "정당을 초월한 협치로 경남의 미래를 함께 만들겠습니다." },
  { label: "경남 우선", desc: "중앙 정치가 아닌 경남 도민만을 위한 도지사가 되겠습니다." },
];

export default function Profile() {
  return (
    <div className="p-5 space-y-5">
      {/* Hero card */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "#FFFFFF", border: "1px solid #E2EAF4", boxShadow: "0 2px 12px rgba(27,58,92,0.08)" }}
      >
        {/* Banner + Avatar combined */}
        <div
          className="relative"
          style={{ background: "linear-gradient(135deg, #1B3A5C 0%, #1E4080 50%, #1B5E9E 100%)", paddingBottom: "20px" }}
        >
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle at 20% 50%, rgba(125,211,252,0.6) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59,130,246,0.4) 0%, transparent 40%)",
            }}
          />
          {/* Party badge */}
          <div className="absolute top-3 right-4">
            <span
              className="text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{ background: "rgba(255,255,255,0.15)", color: "rgba(220,240,255,0.9)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              더불어민주당
            </span>
          </div>
          {/* Avatar inside banner */}
          <div className="flex items-end gap-4 px-5 pt-6">
            <div
              className="w-20 h-20 rounded-2xl overflow-hidden shrink-0"
              style={{ border: "3px solid rgba(255,255,255,0.9)", boxShadow: "0 4px 12px rgba(0,0,0,0.25)" }}
            >
              <img
                src={PROFILE_IMG}
                alt="김경수 후보"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="pb-1">
              <h1 className="text-xl font-bold" style={{ color: "#FFFFFF" }}>김경수</h1>
              <p className="text-sm" style={{ color: "rgba(200,225,255,0.85)" }}>경남도지사 후보 · 더불어민주당</p>
            </div>
          </div>
        </div>

        {/* Profile info */}
        <div className="px-5 pb-5 pt-4">
          {/* Bio */}
          <div
            className="p-4 rounded-xl text-sm leading-relaxed mb-4"
            style={{ background: "#F5F8FD", color: "#475569", borderLeft: "4px solid #3B82F6" }}
          >
            경남 창원 출신으로 경희대 법학과를 졸업하고 청와대 행정관을 거쳐 제17·19·20대 국회의원, 민선 7기 경상남도지사를 역임했습니다.
            도지사 재임 시절 경남형 그린뉴딜, 청년 일자리 정책, 남해안 관광 활성화 등을 추진했으며,
            <strong style={{ color: "#1D4ED8" }}> "다시 뛰는 경남"</strong>을 슬로건으로 경남 대전환을 이끌겠습니다.
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { num: "3선", label: "국회의원", color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
              { num: "민선 7기", label: "경남도지사", color: "#065F46", bg: "#ECFDF5", border: "#A7F3D0" },
              { num: "18개", label: "시·군 공약", color: "#6D28D9", bg: "#F5F3FF", border: "#DDD6FE" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <div className="text-base font-bold" style={{ color: s.color }}>{s.num}</div>
                <div className="text-xs" style={{ color: "#64748B" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Core values */}
      <div
        className="rounded-xl p-4"
        style={{ background: "#FFFFFF", border: "1px solid #E2EAF4", boxShadow: "0 1px 6px rgba(27,58,92,0.05)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Heart size={15} style={{ color: "#3B82F6" }} />
          <h2 className="text-sm font-bold" style={{ color: "#1E3A5F" }}>핵심 가치</h2>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {values.map((v) => (
            <div key={v.label} className="rounded-xl p-3" style={{ background: "#F5F8FD", border: "1px solid #E2EAF4" }}>
              <div className="text-xs font-bold mb-1" style={{ color: "#1D4ED8" }}>{v.label}</div>
              <div className="text-xs leading-relaxed" style={{ color: "#64748B" }}>{v.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pledge highlights */}
      <div
        className="rounded-xl p-4"
        style={{ background: "#FFFFFF", border: "1px solid #E2EAF4", boxShadow: "0 1px 6px rgba(27,58,92,0.05)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Award size={15} style={{ color: "#3B82F6" }} />
          <h2 className="text-sm font-bold" style={{ color: "#1E3A5F" }}>5대 핵심 공약</h2>
        </div>
        <div className="space-y-2">
          {pledgeHighlights.map((p, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-xl notion-card"
              style={{ background: "#F5F8FD", border: "1px solid #E2EAF4" }}
            >
              <span className="text-xl shrink-0">{p.icon}</span>
              <div>
                <div className="text-xs font-bold mb-0.5" style={{ color: "#1E3A5F" }}>{p.title}</div>
                <div className="text-xs leading-relaxed" style={{ color: "#64748B" }}>{p.desc}</div>
              </div>
              <ChevronRight size={13} className="shrink-0 mt-0.5 ml-auto" style={{ color: "#CBD5E1" }} />
            </div>
          ))}
        </div>
      </div>

      {/* Career */}
      <div
        className="rounded-xl p-4"
        style={{ background: "#FFFFFF", border: "1px solid #E2EAF4", boxShadow: "0 1px 6px rgba(27,58,92,0.05)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Briefcase size={15} style={{ color: "#3B82F6" }} />
          <h2 className="text-sm font-bold" style={{ color: "#1E3A5F" }}>주요 경력</h2>
        </div>
        <div className="space-y-0">
          {career.map((item, idx) => (
            <div key={idx} className="flex gap-3 pb-3">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: "#3B82F6" }} />
                {idx < career.length - 1 && (
                  <div className="w-px flex-1 mt-1" style={{ background: "#E2EAF4", minHeight: "16px" }} />
                )}
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold shrink-0" style={{ color: "#3B82F6" }}>{item.year}</span>
                  {item.org && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full shrink-0" style={{ background: "#EFF6FF", color: "#1D4ED8", fontSize: "10px" }}>
                      {item.org}
                    </span>
                  )}
                </div>
                <p className="text-xs mt-0.5" style={{ color: "#334155" }}>{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div
        className="rounded-xl p-4"
        style={{ background: "#FFFFFF", border: "1px solid #E2EAF4", boxShadow: "0 1px 6px rgba(27,58,92,0.05)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={15} style={{ color: "#3B82F6" }} />
          <h2 className="text-sm font-bold" style={{ color: "#1E3A5F" }}>학력</h2>
        </div>
        <div className="space-y-2">
          {education.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 py-2 border-b last:border-b-0" style={{ borderColor: "#F1F5F9" }}>
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "#93C5FD" }} />
              <span className="text-xs font-mono font-bold w-10 shrink-0" style={{ color: "#3B82F6" }}>{item.year}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full shrink-0" style={{ background: "#EFF6FF", color: "#1D4ED8", fontSize: "10px" }}>{item.org}</span>
              <span className="text-xs" style={{ color: "#334155" }}>{item.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
