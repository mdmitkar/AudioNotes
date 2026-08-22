export const Colors = {
  // Primary palette
  background: "#111827",
  surface: "#1F2937",
  surfaceElevated: "#374151",
  border: "#374151",
  
  // Accent
  primary: "#10B981",
  primaryLight: "#34D399",
  primaryDark: "#059669",
  primaryMuted: "rgba(16, 185, 129, 0.15)",
  
  // Text
  textPrimary: "#F9FAFB",
  textSecondary: "#9CA3AF",
  textMuted: "#6B7280",
  textInverse: "#111827",
  
  // Status
  premium: "#F59E0B",
  premiumLight: "#FCD34D",
  premiumMuted: "rgba(245, 158, 11, 0.15)",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
  
  // Exam colors
  gateCS: "#6366F1",
  upsc: "#F59E0B",
  sscCGL: "#10B981",
  cat: "#EF4444",
  
  // Misc
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
  overlay: "rgba(0,0,0,0.7)",
  overlayLight: "rgba(0,0,0,0.4)",
};

export const Typography = {
  fontFamily: {
    regular: undefined, // System font
    medium: undefined,
    semiBold: undefined,
    bold: undefined,
  },
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 28,
    "4xl": 32,
    "5xl": 36,
  },
  weight: {
    normal: "400" as const,
    medium: "500" as const,
    semiBold: "600" as const,
    bold: "700" as const,
    extraBold: "800" as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 48,
  "5xl": 64,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  "2xl": 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  lg: {
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
};

export const Layout = {
  screenPadding: 16,
  tabBarHeight: 64,
  miniPlayerHeight: 68,
};
