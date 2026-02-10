export const theme = {
    colors: {
      // Primary — Forest Green
      primary: "#2E7D32",
      primaryDark: "#1B5E20",
      primaryLight: "#E8F5E9",
      primaryMuted: "#ECFDF5",

      // Secondary — Emerald (accent actions, CTAs, toggles)
      secondary: "#10B981",
      secondaryDark: "#059669",
      secondaryLight: "#D1FAE5",

      // Background
      background: "#F3F4F6",
      backgroundCard: "#FFFFFF",
      backgroundElevated: "#F9FAFB",

      // Text
      textPrimary: "#1A1A1A",
      textSecondary: "#6B7280",
      textTertiary: "#9CA3AF",

      // Accent (alias for secondary, kept for backward compat)
      accent: "#10B981",
      accentDark: "#059669",

      // Status
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      info: "#3B82F6",

      // UI
      border: "#E5E7EB",
      borderDark: "#D1D5DB",
      divider: "#F3F4F6",
      shadow: "#000000",

      // Favorites
      favorite: "#EF4444",
      favoriteLight: "#FEE2E2",

      white: "#FFFFFF",
      black: "#000000",
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
      xl: 20,
      full: 9999,
    },

    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },

    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
    },

    shadows: {
      sm: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      },
      md: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
      lg: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
      },
    },

    components: {
      card: {
        background: "#FFFFFF",
        border: "#E5E7EB",
        borderRadius: 12,
        padding: 16,
        shadow: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        },
      },
      modal: {
        overlay: "rgba(0,0,0,0.5)",
        background: "#FFFFFF",
        borderRadius: 24,
        handleColor: "#E5E7EB",
      },
      button: {
        primaryBg: "#2E7D32",
        primaryText: "#FFFFFF",
        dangerBg: "#EF4444",
        dangerText: "#FFFFFF",
        cancelBorder: "#D1D5DB",
        cancelText: "#374151",
        disabledOpacity: 0.4,
      },
      input: {
        background: "#F9FAFB",
        border: "#D1D5DB",
        borderRadius: 8,
        fontSize: 15,
        padding: 12,
      },
    },
  };
