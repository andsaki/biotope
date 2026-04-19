import { useCallback, useEffect, useMemo, useState } from "react";

const HINTS_STORAGE_KEY = "mizube-ux-hints-dismissed";

interface HintProgress {
  hasOpenedPanel: boolean;
  hasToggledAmbient: boolean;
  hasWaterRippled: boolean;
  hasBottleOpened: boolean;
}

const DEFAULT_PROGRESS: HintProgress = {
  hasOpenedPanel: false,
  hasToggledAmbient: false,
  hasWaterRippled: false,
  hasBottleOpened: false,
};

const readDismissedState = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(HINTS_STORAGE_KEY) === "true";
};

const writeDismissedState = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(HINTS_STORAGE_KEY, "true");
};

export const useUxHints = () => {
  const [hasDismissedHints, setHasDismissedHints] = useState(readDismissedState);
  const [showHints, setShowHints] = useState(() => !readDismissedState());
  const [progress, setProgress] = useState<HintProgress>(DEFAULT_PROGRESS);

  const markProgress = useCallback((key: keyof HintProgress) => {
    setProgress((prev) => {
      if (prev[key]) {
        return prev;
      }

      return {
        ...prev,
        [key]: true,
      };
    });
  }, []);

  const dismissHints = useCallback(() => {
    setShowHints(false);

    if (!hasDismissedHints) {
      setHasDismissedHints(true);
      writeDismissedState();
    }
  }, [hasDismissedHints]);

  const reopenHints = useCallback(() => {
    setShowHints(true);
  }, []);

  const isFullyExplored = useMemo(
    () => Object.values(progress).every(Boolean),
    [progress]
  );

  useEffect(() => {
    if (!isFullyExplored || hasDismissedHints) {
      return;
    }

    setHasDismissedHints(true);
    setShowHints(false);
    writeDismissedState();
  }, [hasDismissedHints, isFullyExplored]);

  return {
    progress,
    showHints,
    hasDismissedHints,
    shouldShowUiHint:
      showHints && (!progress.hasOpenedPanel || !progress.hasToggledAmbient),
    shouldShowBottleHint: showHints && !progress.hasBottleOpened,
    shouldShowWaterHint: showHints && !progress.hasWaterRippled,
    dismissHints,
    reopenHints,
    markPanelOpened: () => markProgress("hasOpenedPanel"),
    markAmbientToggled: () => markProgress("hasToggledAmbient"),
    markWaterRippled: () => markProgress("hasWaterRippled"),
    markBottleOpened: () => markProgress("hasBottleOpened"),
  };
};

export type { HintProgress };
