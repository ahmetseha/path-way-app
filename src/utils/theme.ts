export const theme = {
  colors: {
    // Primary colors
    primary: "#00B4D8", // Turkuaz - Ana renk
    primaryLight: "#90E0EF", // Açık turkuaz
    primaryDark: "#0077B6", // Koyu turkuaz

    // Secondary colors
    secondary: "#FFD700", // Altın - Vurgu rengi
    secondaryLight: "#FFE55C", // Açık altın
    secondaryDark: "#FFC107", // Koyu altın

    // Background colors
    background: "#FFFFFF", // Ana arka plan
    backgroundLight: "#F8F9FA", // Açık arka plan
    backgroundDark: "#E9ECEF", // Koyu arka plan

    // Text colors
    textPrimary: "#2C3E50", // Ana metin
    textSecondary: "#6C757D", // İkincil metin
    textLight: "#ADB5BD", // Açık metin
    textWhite: "#FFFFFF", // Beyaz metin

    // Status colors
    success: "#28A745", // Başarı
    warning: "#FFC107", // Uyarı
    error: "#DC3545", // Hata
    info: "#17A2B8", // Bilgi

    // Card colors
    cardBackground: "#FFFFFF",
    cardBorder: "#E9ECEF",
    cardShadow: "rgba(0, 0, 0, 0.1)",

    // Gradient colors
    gradientStart: "#00B4D8",
    gradientEnd: "#90E0EF",
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 50,
  },

  shadows: {
    small: {
      shadowColor: "rgba(0, 0, 0, 0.1)",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    medium: {
      shadowColor: "rgba(0, 0, 0, 0.1)",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    large: {
      shadowColor: "rgba(0, 0, 0, 0.1)",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 12,
    },
  },

  typography: {
    h1: {
      fontSize: 32,
      fontWeight: "bold" as const,
      lineHeight: 40,
    },
    h2: {
      fontSize: 28,
      fontWeight: "bold" as const,
      lineHeight: 36,
    },
    h3: {
      fontSize: 24,
      fontWeight: "600" as const,
      lineHeight: 32,
    },
    h4: {
      fontSize: 20,
      fontWeight: "600" as const,
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: "normal" as const,
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: "normal" as const,
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: "normal" as const,
      lineHeight: 16,
    },
  },

  // Animation durations
  animation: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
};

export type Theme = typeof theme;
