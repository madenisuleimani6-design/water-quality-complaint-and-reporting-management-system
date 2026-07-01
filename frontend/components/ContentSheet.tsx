import { ReactNode } from "react";
import { View } from "react-native";

import { BottomSafeArea } from "./BottomSafeArea";
import { isWeb } from "../utils/platform";

type ContentSheetProps = {
  children: ReactNode;
  className?: string;
  /** Adds bottom safe inset for screens without a tab bar (auth, report). */
  withBottomSafeArea?: boolean;
  flush?: boolean;
};

export function ContentSheet({
  children,
  className = "",
  withBottomSafeArea = false,
  flush = false,
}: ContentSheetProps) {
  const horizontalClass = flush ? "px-0" : "px-4";

  const sheet = (
    <View
      className={`flex-1 bg-dawasa-surface pt-4 ${horizontalClass} ${className}`}
    >
      {children}
    </View>
  );

  if (!withBottomSafeArea) {
    return sheet;
  }

  return (
    <BottomSafeArea className="flex-1" style={{ flex: 1 }}>
      {sheet}
    </BottomSafeArea>
  );
}
