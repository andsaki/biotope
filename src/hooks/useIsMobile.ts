import { useEffect, useState } from "react";

const getWindowMatch = (breakpoint: number) => {
  if (typeof window === "undefined") return false;
  return window.innerWidth <= breakpoint;
};

/**
 * ビューポート幅に応じてモバイル判定を返すフック
 * requestAnimationFrameでリサイズイベントを間引き、再レンダリングを抑制
 */
export const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(() => getWindowMatch(breakpoint));

  useEffect(() => {
    if (typeof window === "undefined") return;

    let frameId: number | null = null;
    const handleResize = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        setIsMobile(getWindowMatch(breakpoint));
      });
    };

    window.addEventListener("resize", handleResize);
    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [breakpoint]);

  return isMobile;
};
