import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { isWeb } from "../utils/platform";

function readCssSafeAreaInset(edge: "top" | "bottom"): number {
  if (typeof document === "undefined") {
    return 0;
  }

  const probe = document.createElement("div");
  probe.style.position = "fixed";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  probe.style.paddingTop =
    edge === "top" ? "env(safe-area-inset-top)" : "env(safe-area-inset-bottom)";
  document.body.appendChild(probe);
  const style = window.getComputedStyle(probe);
  const value = parseFloat(
    edge === "top" ? style.paddingTop : style.paddingBottom,
  );
  document.body.removeChild(probe);
  return Number.isFinite(value) ? value : 0;
}

export function useEffectiveSafeArea() {
  const insets = useSafeAreaInsets();
  const [cssInsets, setCssInsets] = useState({ top: 0, bottom: 0 });

  useEffect(() => {
    if (!isWeb) {
      return;
    }

    const refresh = () => {
      setCssInsets({
        top: readCssSafeAreaInset("top"),
        bottom: readCssSafeAreaInset("bottom"),
      });
    };

    refresh();
    window.addEventListener("resize", refresh);
    window.visualViewport?.addEventListener("resize", refresh);
    return () => {
      window.removeEventListener("resize", refresh);
      window.visualViewport?.removeEventListener("resize", refresh);
    };
  }, []);

  return {
    top: Math.max(insets.top, cssInsets.top),
    bottom: Math.max(insets.bottom, cssInsets.bottom),
    left: Math.max(insets.left, 0),
    right: Math.max(insets.right, 0),
  };
}
