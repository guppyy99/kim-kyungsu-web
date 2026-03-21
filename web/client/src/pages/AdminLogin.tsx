/**
 * 관리자 로그인 페이지 - 아이디/비밀번호 방식
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [setupKey, setSetupKey] = useState("");
  const [displayName, setDisplayName] = useState("");

  const utils = trpc.useUtils();

  const { data: hasAdmin, isLoading: checkingAdmin } = trpc.auth.hasAdmin.useQuery();

  const loginMutation = trpc.auth.adminLogin.useMutation({
    onSuccess: () => {
      toast.success("로그인 성공! 관리자 페이지로 이동합니다.");
      utils.auth.me.invalidate();
      setTimeout(() => navigate("/admin"), 300);
    },
    onError: (err) => {
      toast.error(err.message || "로그인에 실패했습니다.");
    },
  });

  const setupMutation = trpc.auth.setupAdmin.useMutation({
    onSuccess: () => {
      toast.success("관리자 계정이 생성되었습니다. 로그인해 주세요.");
      setIsSetupMode(false);
      setSetupKey("");
      setDisplayName("");
    },
    onError: (err) => {
      toast.error(err.message || "계정 생성에 실패했습니다.");
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("아이디와 비밀번호를 입력해 주세요.");
      return;
    }
    loginMutation.mutate({ username: username.trim(), password });
  };

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !setupKey.trim()) {
      toast.error("모든 필드를 입력해 주세요.");
      return;
    }
    setupMutation.mutate({
      username: username.trim(),
      password,
      displayName: displayName.trim() || undefined,
      setupKey: setupKey.trim(),
    });
  };

  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0F2744" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "#60A5FA" }} />
      </div>
    );
  }

  const showSetup = isSetupMode || hasAdmin === false;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #0F2744 0%, #1B3A5C 100%)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}
      >
        {/* 헤더 */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "#DC2626" }}
          >
            <Shield size={28} style={{ color: "white" }} />
          </div>
          <h1 className="text-xl font-bold" style={{ color: "white" }}>관리자 로그인</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(180,210,240,0.6)" }}>
            {showSetup ? "최초 관리자 계정 설정" : "김경수 디지털 상황실"}
          </p>
        </div>

        {/* 로그인 폼 */}
        {!showSetup ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(180,210,240,0.8)" }}>
                아이디
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="관리자 아이디"
                autoComplete="username"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "white",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(96,165,250,0.6)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(180,210,240,0.8)" }}>
                비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "white",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(96,165,250,0.6)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "rgba(180,210,240,0.5)" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              style={{ background: "#1D4ED8", color: "white", opacity: loginMutation.isPending ? 0.7 : 1 }}
            >
              {loginMutation.isPending ? (
                <><Loader2 size={16} className="animate-spin" /> 로그인 중...</>
              ) : "로그인"}
            </button>
          </form>
        ) : (
          /* 최초 계정 설정 폼 */
          <form onSubmit={handleSetup} className="space-y-4">
            <div
              className="p-3 rounded-xl text-xs"
              style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", color: "rgba(251,191,36,0.9)" }}
            >
              최초 관리자 계정을 설정합니다. 설정 키가 필요합니다.
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(180,210,240,0.8)" }}>아이디 *</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="사용할 아이디 (3자 이상)"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "white" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(180,210,240,0.8)" }}>표시 이름</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="관리자 (선택)"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "white" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(180,210,240,0.8)" }}>비밀번호 * (6자 이상)</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 (6자 이상)"
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "white" }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(180,210,240,0.5)" }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(180,210,240,0.8)" }}>설정 키 *</label>
              <input
                type="password"
                value={setupKey}
                onChange={(e) => setSetupKey(e.target.value)}
                placeholder="설정 키 입력"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "white" }}
              />
              <p className="text-xs mt-1" style={{ color: "rgba(180,210,240,0.4)" }}>
                기본 설정 키: kimkyungsu2026! (환경변수 ADMIN_SETUP_KEY로 변경 가능)
              </p>
            </div>
            <button
              type="submit"
              disabled={setupMutation.isPending}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              style={{ background: "#065F46", color: "white", opacity: setupMutation.isPending ? 0.7 : 1 }}
            >
              {setupMutation.isPending ? <><Loader2 size={16} className="animate-spin" /> 생성 중...</> : "계정 생성"}
            </button>
            {hasAdmin !== false && (
              <button
                type="button"
                onClick={() => setIsSetupMode(false)}
                className="w-full py-2 text-xs"
                style={{ color: "rgba(180,210,240,0.5)" }}
              >
                ← 로그인으로 돌아가기
              </button>
            )}
          </form>
        )}

        {/* 하단 링크 */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-xs"
            style={{ color: "rgba(180,210,240,0.4)" }}
          >
            ← 메인 사이트로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
