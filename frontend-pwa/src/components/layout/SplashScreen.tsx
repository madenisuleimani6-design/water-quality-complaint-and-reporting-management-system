import { theme } from "@/constants/theme";

export function SplashScreen() {
  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center bg-slate-900"
      style={{ minHeight: "100dvh" }}
    >
      <div
        className="mb-6 flex h-[120px] w-[120px] items-center justify-center rounded-full"
        style={{
          background: `linear-gradient(135deg, ${theme.gradientTop}, ${theme.gradientBottom})`,
          boxShadow: theme.shadow.fab,
        }}
      >
        <img
          src="/splash-icon.png"
          alt="DAWASA"
          className="h-[72px] w-[72px] object-contain"
        />
      </div>
      <div
        className="h-8 w-8 animate-spin rounded-full border-4 border-dawasa-blue border-t-transparent"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
