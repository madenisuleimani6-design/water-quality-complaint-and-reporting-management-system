import { ViewStyle } from "react-native";

export const theme = {
  gradientTop: "#007AFF",
  gradientBottom: "#4FACFE",
  textOnPrimary: "#FFFFFF",
  textMutedOnPrimary: "rgba(255,255,255,0.72)",
  surface: "#F4F8FC",
  card: "#FFFFFF",
  ctaPrimary: "#007AFF",
  ctaSecondary: "#FFFFFF",
  ctaDark: "#0F172A",
  accentCyan: "#22D3EE",
  tabActive: "#007AFF",
  tabInactive: "#94A3B8",
  border: "#E2E8F0",
  placeholder: "#94A3B8",
  textMuted: "#64748B",
  status: {
    new: "#007AFF",
    assigned: "#F59E0B",
    investigating: "#F97316",
    resolved: "#10B981",
  },
  statusBadge: {
    new: { bg: "#E0F2FE", text: "#075985" },
    assigned: { bg: "#FEF3C7", text: "#92400E" },
    investigating: { bg: "#FFEDD5", text: "#9A3412" },
    resolved: { bg: "#D1FAE5", text: "#065F46" },
  },
  feedback: {
    info: { bg: "#EFF6FF", border: "#BFDBFE", text: "#1E40AF" },
    success: { bg: "#ECFDF5", border: "#A7F3D0", text: "#065F46" },
    warning: { bg: "#FFFBEB", border: "#FCD34D", text: "#92400E" },
    error: { bg: "#FEF2F2", border: "#FECACA", text: "#B91C1C" },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  shadow: {
    card: {
      elevation: 2,
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    } satisfies ViewStyle,
    cardSubtle: {
      elevation: 1,
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
    } satisfies ViewStyle,
    fab: {
      elevation: 8,
      shadowColor: "#007AFF",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
    } satisfies ViewStyle,
    composer: {
      elevation: 4,
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    } satisfies ViewStyle,
  },
} as const;

export const gradientColors = [theme.gradientTop, theme.gradientBottom] as const;

export type ComplaintStatusKey = keyof typeof theme.status;
