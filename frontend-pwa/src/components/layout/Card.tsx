import type { ReactNode, CSSProperties } from "react";

import { theme } from "@/constants/theme";
import { cn } from "@/lib/utils";

type CardProps = {
  children: ReactNode;
  className?: string;
  accentColor?: string;
  onPress?: () => void;
  style?: CSSProperties;
  subtle?: boolean;
};

export function Card({
  children,
  className = "",
  accentColor,
  onPress,
  style,
  subtle = false,
}: CardProps) {
  const shadowStyle = subtle ? theme.shadow.cardSubtle : theme.shadow.card;

  const inner = (
    <div
      className={cn("overflow-hidden rounded-2xl bg-white", className)}
      style={{ boxShadow: shadowStyle, ...style }}
    >
      {accentColor ? (
        <div className="flex">
          <div style={{ width: 4, backgroundColor: accentColor }} />
          <div className="flex-1">{children}</div>
        </div>
      ) : (
        children
      )}
    </div>
  );

  if (onPress) {
    return (
      <button type="button" className="w-full text-left" onClick={onPress}>
        {inner}
      </button>
    );
  }

  return inner;
}
