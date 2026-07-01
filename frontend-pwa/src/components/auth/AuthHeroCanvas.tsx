import type { ReactNode, CSSProperties } from "react";

export const AUTH_HERO_WIDTH = 300;

type AuthHeroCanvasProps = {
  height: number;
  children: ReactNode;
  style?: CSSProperties;
};

export function AuthHeroCanvas({ height, children, style }: AuthHeroCanvasProps) {
  return (
    <div className="mb-2 flex w-full items-center justify-center">
      <div
        className="relative"
        style={{ width: AUTH_HERO_WIDTH, height, maxWidth: "100%", ...style }}
      >
        {children}
      </div>
    </div>
  );
}
