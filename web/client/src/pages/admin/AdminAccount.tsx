/**
 * 관리자 계정 설정 페이지 - 아이디/비밀번호/표시이름 변경
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Shield, Eye, EyeOff, Save, Loader2, User } from "lucide-react";

export default function AdminAccount() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const updateMutation = trpc.auth.updateAdminAccount.useMutation({
    onSuccess: () => {
      toast.success("계정 정보가 수정되었습니다.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      utils.auth.me.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "수정에 실패했습니다.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim()) {
      toast.error("현재 비밀번호를 입력해 주세요.");
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    if (newPassword && newPassword.length < 6) {
      toast.error("새 비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    if (!newUsername && !newPassword && !newDisplayName) {
      toast.error("변경할 항목을 하나 이상 입력해 주세요.");
      return;
    }
    updateMutation.mutate({
      currentPassword,
      newUsername: newUsername.trim() || undefined,
      newPassword: newPassword || undefined,
      newDisplayName: newDisplayName.trim() || undefined,
    });
  };

  // 현재 아이디 추출 (openId = "admin:username")
  const currentUsername = user?.openId?.startsWith("admin:")
    ? user.openId.slice(6)
    : user?.name ?? "관리자";

  return (
    <div className="p-6 max-w-lg">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#1B3A5C" }}>
          <Shield size={16} style={{ color: "#7DD3FC" }} />
        </div>
        <div>
          <h1 className="text-lg font-bold" style={{ color: "#1E3A5F" }}>계정 설정</h1>
          <p className="text-xs" style={{ color: "#94A3B8" }}>관리자 아이디, 비밀번호, 표시 이름을 변경할 수 있습니다.</p>
        </div>
      </div>

      {/* 현재 계정 정보 */}
      <div
        className="rounded-xl p-4 mb-6 flex items-center gap-3"
        style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#DBEAFE" }}>
          <User size={18} style={{ color: "#1D4ED8" }} />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "#1E3A5F" }}>{user?.name ?? "관리자"}</p>
          <p className="text-xs" style={{ color: "#64748B" }}>아이디: {currentUsername}</p>
        </div>
      </div>

      {/* 수정 폼 */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 현재 비밀번호 (필수) */}
        <div
          className="rounded-xl p-4 space-y-4"
          style={{ background: "#FFFFFF", border: "1px solid #E2EAF4" }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#94A3B8" }}>인증</p>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#475569" }}>
              현재 비밀번호 <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="현재 비밀번호 입력"
                className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm outline-none"
                style={{ background: "#F8FAFC", border: "1px solid #E2EAF4", color: "#1E3A5F" }}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "#94A3B8" }}
              >
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        </div>

        {/* 변경 항목 */}
        <div
          className="rounded-xl p-4 space-y-4"
          style={{ background: "#FFFFFF", border: "1px solid #E2EAF4" }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#94A3B8" }}>변경할 정보 (선택)</p>

          {/* 표시 이름 */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#475569" }}>표시 이름</label>
            <input
              type="text"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              placeholder={user?.name ?? "관리자"}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: "#F8FAFC", border: "1px solid #E2EAF4", color: "#1E3A5F" }}
            />
          </div>

          {/* 새 아이디 */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#475569" }}>새 아이디 (3자 이상)</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder={currentUsername}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: "#F8FAFC", border: "1px solid #E2EAF4", color: "#1E3A5F" }}
            />
          </div>

          {/* 새 비밀번호 */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#475569" }}>새 비밀번호 (6자 이상)</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호"
                className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm outline-none"
                style={{ background: "#F8FAFC", border: "1px solid #E2EAF4", color: "#1E3A5F" }}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "#94A3B8" }}
              >
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* 비밀번호 확인 */}
          {newPassword && (
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#475569" }}>새 비밀번호 확인</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="새 비밀번호 재입력"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{
                  background: "#F8FAFC",
                  border: `1px solid ${confirmPassword && confirmPassword !== newPassword ? "#FCA5A5" : "#E2EAF4"}`,
                  color: "#1E3A5F",
                }}
              />
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-xs mt-1" style={{ color: "#DC2626" }}>비밀번호가 일치하지 않습니다.</p>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          style={{ background: "#1D4ED8", color: "white", opacity: updateMutation.isPending ? 0.7 : 1 }}
        >
          {updateMutation.isPending ? (
            <><Loader2 size={16} className="animate-spin" /> 저장 중...</>
          ) : (
            <><Save size={16} /> 변경사항 저장</>
          )}
        </button>
      </form>
    </div>
  );
}
