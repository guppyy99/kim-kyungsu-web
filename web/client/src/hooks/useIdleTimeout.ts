/**
 * useIdleTimeout
 * 지정된 시간(ms) 동안 마우스/키보드/터치 활동이 없으면 onIdle 콜백을 호출합니다.
 * 만료 1분 전에 onWarn 콜백을 호출하여 경고를 표시할 수 있습니다.
 */
import { useEffect, useRef, useCallback } from "react";

interface UseIdleTimeoutOptions {
  /** 비활동 허용 시간 (ms). 기본값: 10분 */
  timeout?: number;
  /** 만료 전 경고 시간 (ms). 기본값: 1분 */
  warnBefore?: number;
  /** 타임아웃 만료 시 호출 */
  onIdle: () => void;
  /** 만료 warnBefore ms 전에 호출 (경고 표시용) */
  onWarn?: () => void;
  /** 활동 감지 시 호출 (경고 해제용) */
  onActive?: () => void;
  /** 훅 활성화 여부 */
  enabled?: boolean;
}

const IDLE_EVENTS: (keyof WindowEventMap)[] = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "touchmove",
  "scroll",
  "wheel",
  "click",
  "focus",
];

export function useIdleTimeout({
  timeout = 10 * 60 * 1000, // 10분
  warnBefore = 60 * 1000,   // 1분 전 경고
  onIdle,
  onWarn,
  onActive,
  enabled = true,
}: UseIdleTimeoutOptions) {
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isWarnedRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
  }, []);

  const resetTimers = useCallback(() => {
    clearTimers();

    // 경고 상태였다면 onActive 호출
    if (isWarnedRef.current) {
      isWarnedRef.current = false;
      onActive?.();
    }

    // 경고 타이머 설정 (만료 warnBefore ms 전)
    if (onWarn && timeout > warnBefore) {
      warnTimerRef.current = setTimeout(() => {
        isWarnedRef.current = true;
        onWarn();
      }, timeout - warnBefore);
    }

    // 로그아웃 타이머 설정
    idleTimerRef.current = setTimeout(() => {
      onIdle();
    }, timeout);
  }, [clearTimers, timeout, warnBefore, onIdle, onWarn, onActive]);

  useEffect(() => {
    if (!enabled) {
      clearTimers();
      return;
    }

    // 초기 타이머 시작
    resetTimers();

    // 이벤트 리스너 등록
    const handleActivity = () => resetTimers();
    IDLE_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      clearTimers();
      IDLE_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [enabled, resetTimers, clearTimers]);
}
