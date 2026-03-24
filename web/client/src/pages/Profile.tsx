/**
 * Profile Page — 김경수 후보 프로필
 * Editorial Authority: 매거진 프로필 스프레드 스타일
 * 신뢰감 있는 타이포그래피 + 임팩트 있는 통계 + 클린 타임라인
 */
import { useLocation } from "wouter";
import {
  Award,
  Briefcase,
  GraduationCap,
  Quote,
  MapPin,
  ArrowRight,
} from "lucide-react";

const PROFILE_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663275956251/2tf7d959bKmS3eN22yndrr/kimkyungsu-profile_cbc0ddef.png";
const PROFILE_IMG_FULL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663275956251/2tf7d959bKmS3eN22yndrr/kimkyungsu-profile3_a89a09df.png";

const stats = [
  { num: "3선", label: "국회의원", sub: "17·19·20대" },
  { num: "민선 7기", label: "경남도지사", sub: "2018–2021" },
  { num: "18개", label: "시·군 공약", sub: "경남 전역" },
  { num: "20년+", label: "공직 경험", sub: "행정·입법·지방" },
];

const values = [
  {
    num: "01",
    label: "현장 중심",
    desc: "매달 18개 시·군 현장을 직접 찾아 도민의 목소리를 듣겠습니다.",
  },
  {
    num: "02",
    label: "투명 행정",
    desc: "모든 정책 결정 과정을 도민에게 투명하게 공개하겠습니다.",
  },
  {
    num: "03",
    label: "협치 리더십",
    desc: "정당을 초월한 협치로 경남의 미래를 함께 만들겠습니다.",
  },
  {
    num: "04",
    label: "경남 우선",
    desc: "중앙 정치가 아닌 경남 도민만을 위한 도지사가 되겠습니다.",
  },
];

const pledgeHighlights = [
  {
    icon: "🚀",
    title: "우주항공·방산 산업 수도",
    desc: "남해안권 우주항공산업 벨트 구축, KAI·한화에어로스페이스 연계 클러스터 조성",
  },
  {
    icon: "🚄",
    title: "서부경남 KTX 조기 완공",
    desc: "남부내륙철도 이재명 대통령 임기 내 완공, 통영·거제 남해안 관광 대전환",
  },
  {
    icon: "👨‍💼",
    title: "청년 정착 지원 패키지",
    desc: "청년 주거·취업·창업 종합 지원으로 경남 인구 유출 방지",
  },
  {
    icon: "🏥",
    title: "의료 취약지 해소",
    desc: "공공의료원 확충·원격진료 시스템 구축으로 18개 시군 의료 접근성 강화",
  },
  {
    icon: "🌿",
    title: "탄소중립 경남",
    desc: "2030 탄소중립 달성, 재생에너지 확대 및 친환경 교통 체계 구축",
  },
];

const career = [
  { year: "2025", title: "더불어민주당 경남도지사 예비후보 등록", org: "더불어민주당", highlight: true },
  { year: "2023–25", title: "더불어민주당 당대표 비서실장", org: "더불어민주당", highlight: false },
  { year: "2018–21", title: "제38대 경상남도지사 (민선 7기)", org: "경상남도", highlight: true },
  { year: "2016–18", title: "제20대 국회의원 (김해을)", org: "더불어민주당", highlight: false },
  { year: "2012–16", title: "제19대 국회의원 (김해을)", org: "새정치민주연합", highlight: false },
  { year: "2004–08", title: "제17대 국회의원 (김해을)", org: "열린우리당", highlight: false },
  { year: "2002–03", title: "청와대 민정수석비서관실 행정관", org: "청와대", highlight: false },
];

const education = [
  { year: "1991", title: "경희대학교 법학과 졸업" },
  { year: "1987", title: "경남고등학교 졸업" },
];

export default function Profile() {
  const [, navigate] = useLocation();

  return (
    <div className="stagger-in">
      {/* ═══ Hero Section ═══ */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(150deg, #0C1E3A 0%, #122E52 40%, #1E40AF 100%)",
        }}
      >
        {/* Ambient light */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(ellipse at 70% 50%, rgba(59,130,246,0.4) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(37,99,235,0.2) 0%, transparent 50%)",
          }}
        />
        {/* Dot texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        />

        {/* ── Mobile hero ── */}
        <div className="sm:hidden relative z-10">
          {/* Photo */}
          <div className="relative w-full" style={{ height: "280px" }}>
            <div
              className="absolute inset-0 z-10"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 30%, rgba(12,30,58,0.7) 70%, rgba(12,30,58,1) 100%)",
              }}
            />
            <img
              src={PROFILE_IMG_FULL}
              alt="김경수 후보"
              className="w-full h-full object-cover"
              style={{ objectPosition: "top center" }}
            />
            {/* Party badge */}
            <div className="absolute top-4 left-4 z-20">
              <span
                className="text-[11px] px-3 py-1 rounded-full font-bold"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.85)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  backdropFilter: "blur(12px)",
                }}
              >
                더불어민주당
              </span>
            </div>
          </div>
          {/* Name & title */}
          <div className="px-5 pb-6 -mt-1">
            <h1
              className="text-[28px] font-extrabold text-white leading-none mb-1"
              style={{ letterSpacing: "-0.03em" }}
            >
              김경수
            </h1>
            <p className="text-[13px] font-medium" style={{ color: "rgba(147,197,253,0.6)" }}>
              경남도지사 후보
            </p>
          </div>
        </div>

        {/* ── PC hero ── */}
        <div className="hidden sm:block relative z-10">
          <div className="flex items-end justify-between gap-8 px-8 pt-10 pb-0">
            {/* Text side */}
            <div className="flex-1 min-w-0 pb-10">
              <span
                className="inline-block text-[11px] px-3 py-1 rounded-full font-bold mb-5"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "rgba(147,197,253,0.8)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                더불어민주당 경남도지사 후보
              </span>
              <h1
                className="text-[40px] font-extrabold text-white leading-none mb-2"
                style={{ letterSpacing: "-0.04em" }}
              >
                김경수
              </h1>
              <p className="text-[15px] font-medium mb-8" style={{ color: "rgba(147,197,253,0.5)" }}>
                경남 창원 · 경희대 법학과 · 3선 국회의원 · 전 경남도지사
              </p>
              {/* Mini stats in hero */}
              <div className="flex items-center gap-0">
                {stats.slice(0, 3).map((s, i) => (
                  <div key={i} className="flex items-center">
                    <div className="pr-6">
                      <div className="stat-num text-xl font-extrabold text-white leading-none">{s.num}</div>
                      <div className="text-[11px] font-medium mt-1" style={{ color: "rgba(147,197,253,0.4)" }}>
                        {s.label}
                      </div>
                    </div>
                    {i < 2 && <div className="w-px h-8 mr-6" style={{ background: "rgba(255,255,255,0.08)" }} />}
                  </div>
                ))}
              </div>
            </div>
            {/* Photo side */}
            <div className="shrink-0" style={{ marginRight: "-16px" }}>
              <img
                src={PROFILE_IMG_FULL}
                alt="김경수 후보"
                className="block"
                style={{
                  height: "280px",
                  width: "auto",
                  objectFit: "cover",
                  objectPosition: "top",
                  borderRadius: "20px 20px 0 0",
                  filter: "drop-shadow(0 -8px 40px rgba(0,0,0,0.3))",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Content ═══ */}
      <div className="p-4 md:p-6 space-y-4 md:space-y-5">

        {/* ── Bio Quote ── */}
        <div className="card-elevated p-5 md:p-6">
          <div className="flex gap-3 md:gap-4">
            <Quote
              size={24}
              className="shrink-0 mt-0.5"
              style={{ color: "#CBD5E1", transform: "scaleX(-1)" }}
            />
            <div>
              <p
                className="text-[14px] md:text-[15px] leading-[1.9] font-medium"
                style={{ color: "#334155" }}
              >
                경남 창원 출신으로 경희대 법학과를 졸업하고 청와대 행정관을 거쳐
                제17·19·20대 국회의원, 민선 7기 경상남도지사를 역임했습니다.
                도지사 재임 시절 경남형 그린뉴딜, 청년 일자리 정책, 남해안 관광
                활성화 등을 추진했으며,{" "}
                <strong className="font-extrabold" style={{ color: "#0C1E3A" }}>
                  "다시 뛰는 경남"
                </strong>
                을 슬로건으로 경남 대전환을 이끌겠습니다.
              </p>
            </div>
          </div>
        </div>

        {/* ── Stats strip (mobile) ── */}
        <div className="sm:hidden grid grid-cols-2 gap-2.5">
          {stats.map((s, i) => (
            <div key={i} className="card-elevated p-3.5 text-center">
              <div className="stat-num text-lg font-extrabold" style={{ color: "#0C1E3A" }}>
                {s.num}
              </div>
              <div className="text-[11px] font-semibold mt-0.5" style={{ color: "#64748B" }}>
                {s.label}
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: "#94A3B8" }}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>

        {/* ── Core Values ── */}
        <div className="card-elevated p-5 md:p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="text-[13px] font-extrabold tracking-tight" style={{ color: "#0C1E3A" }}>
              핵심 가치
            </span>
            <div className="flex-1 h-px" style={{ background: "#EEF2F6" }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {values.map((v) => (
              <div
                key={v.num}
                className="flex gap-3.5 p-3.5 rounded-xl transition-colors"
                style={{ background: "#F8FAFB" }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#F0F4F8")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#F8FAFB")}
              >
                <span
                  className="text-[11px] font-extrabold shrink-0 mt-0.5 stat-num"
                  style={{ color: "#2563EB" }}
                >
                  {v.num}
                </span>
                <div>
                  <div className="text-[13px] font-bold mb-0.5" style={{ color: "#0C1E3A" }}>
                    {v.label}
                  </div>
                  <div className="text-[12px] leading-relaxed" style={{ color: "#64748B" }}>
                    {v.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5대 핵심 공약 ── */}
        <div className="card-elevated p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Award size={15} style={{ color: "#2563EB" }} />
              <span className="text-[13px] font-extrabold tracking-tight" style={{ color: "#0C1E3A" }}>
                5대 핵심 공약
              </span>
            </div>
            <button
              onClick={() => navigate("/pledges")}
              className="flex items-center gap-1 text-[11px] font-bold"
              style={{ color: "#2563EB" }}
            >
              전체 공약 보기 <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {pledgeHighlights.map((p, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-3.5 rounded-xl transition-colors"
                style={{ background: "#F8FAFB" }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#F0F4F8")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#F8FAFB")}
              >
                <span className="text-lg shrink-0 mt-0.5">{p.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold mb-0.5" style={{ color: "#0C1E3A" }}>
                    {p.title}
                  </div>
                  <div className="text-[12px] leading-relaxed" style={{ color: "#64748B" }}>
                    {p.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Career Timeline ── */}
        <div className="card-elevated p-5 md:p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <Briefcase size={15} style={{ color: "#2563EB" }} />
            <span className="text-[13px] font-extrabold tracking-tight" style={{ color: "#0C1E3A" }}>
              주요 경력
            </span>
            <div className="flex-1 h-px" style={{ background: "#EEF2F6" }} />
          </div>
          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute left-[52px] top-2 bottom-2 w-px hidden sm:block"
              style={{ background: "#EEF2F6" }}
            />
            <div className="space-y-0">
              {career.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 sm:gap-4 py-3 transition-colors rounded-lg px-2 -mx-2"
                  style={{
                    borderBottom: idx < career.length - 1 ? "1px solid #F8FAFB" : "none",
                  }}
                >
                  {/* Year */}
                  <span
                    className="text-[12px] font-bold w-[52px] shrink-0 text-right pt-0.5 stat-num"
                    style={{ color: item.highlight ? "#2563EB" : "#94A3B8" }}
                  >
                    {item.year}
                  </span>
                  {/* Dot */}
                  <div className="relative shrink-0 mt-1.5 hidden sm:block">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        background: item.highlight ? "#2563EB" : "#CBD5E1",
                        boxShadow: item.highlight ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
                      }}
                    />
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-[13px] font-semibold"
                      style={{ color: item.highlight ? "#0C1E3A" : "#475569" }}
                    >
                      {item.title}
                    </div>
                    {item.org && (
                      <span
                        className="inline-block text-[10px] px-2 py-0.5 rounded-md mt-1 font-semibold"
                        style={{
                          background: item.highlight ? "#EFF6FF" : "#F8FAFB",
                          color: item.highlight ? "#1D4ED8" : "#94A3B8",
                        }}
                      >
                        {item.org}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Education ── */}
        <div className="card-elevated p-5 md:p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <GraduationCap size={15} style={{ color: "#2563EB" }} />
            <span className="text-[13px] font-extrabold tracking-tight" style={{ color: "#0C1E3A" }}>
              학력
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5">
            {education.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3.5 rounded-xl flex-1"
                style={{ background: "#F8FAFB" }}
              >
                <span
                  className="text-[12px] font-bold stat-num shrink-0"
                  style={{ color: "#2563EB" }}
                >
                  {item.year}
                </span>
                <span className="text-[13px] font-medium" style={{ color: "#334155" }}>
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div
          className="relative overflow-hidden rounded-2xl p-5 md:p-6"
          style={{
            background: "linear-gradient(135deg, #0C1E3A 0%, #1E3A5F 50%, #1E40AF 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "20px 20px",
            }}
          />
          <div className="relative flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[14px] md:text-[15px] font-bold text-white">
                18개 시·군 공약을 확인하세요
              </p>
              <p className="text-[12px] mt-0.5 font-medium" style={{ color: "rgba(147,197,253,0.5)" }}>
                경남 전역을 위한 구체적인 실행 계획
              </p>
            </div>
            <button
              onClick={() => navigate("/pledges")}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[13px] font-bold shrink-0 transition-all"
              style={{
                background: "#FFFFFF",
                color: "#1E40AF",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
              }}
            >
              <MapPin size={14} />
              공약 보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
