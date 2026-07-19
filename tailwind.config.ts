import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "320px",
      sm: "480px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "1920px",
      "4k": "2560px",
    },
    extend: {
      colors: {
        bg: "var(--veraz-color-bg)",
        surface: {
          DEFAULT: "var(--veraz-color-surface)",
          muted: "var(--veraz-color-surface-muted)",
          elevated: "var(--veraz-color-surface-elevated)",
        },
        ink: {
          DEFAULT: "var(--veraz-color-ink)",
          secondary: "var(--veraz-color-ink-secondary)",
          muted: "var(--veraz-color-ink-muted)",
          disabled: "var(--veraz-color-ink-disabled)",
          inverse: "var(--veraz-color-ink-inverse)",
        },
        border: {
          DEFAULT: "var(--veraz-color-border)",
          strong: "var(--veraz-color-border-strong)",
          focus: "var(--veraz-color-border-focus)",
        },
        accent: {
          DEFAULT: "var(--veraz-color-accent)",
          hover: "var(--veraz-color-accent-hover)",
          active: "var(--veraz-color-accent-active)",
          subtle: "var(--veraz-color-accent-subtle)",
          foreground: "var(--veraz-color-accent-foreground)",
        },
        success: {
          DEFAULT: "var(--veraz-color-success)",
          subtle: "var(--veraz-color-success-subtle)",
        },
        warning: {
          DEFAULT: "var(--veraz-color-warning)",
          subtle: "var(--veraz-color-warning-subtle)",
        },
        danger: {
          DEFAULT: "var(--veraz-color-danger)",
          subtle: "var(--veraz-color-danger-subtle)",
        },
        info: {
          DEFAULT: "var(--veraz-color-info)",
          subtle: "var(--veraz-color-info-subtle)",
        },
      },
      fontFamily: {
        display: "var(--veraz-font-display)",
        body: "var(--veraz-font-body)",
        mono: "var(--veraz-font-mono)",
      },
      fontSize: {
        display: "var(--veraz-text-display)",
        h1: "var(--veraz-text-h1)",
        h2: "var(--veraz-text-h2)",
        h3: "var(--veraz-text-h3)",
        h4: "var(--veraz-text-h4)",
        "body-lg": "var(--veraz-text-body-lg)",
        body: "var(--veraz-text-body)",
        small: "var(--veraz-text-small)",
        caption: "var(--veraz-text-caption)",
        label: "var(--veraz-text-label)",
      },
      spacing: {
        "0.5": "var(--veraz-space-0-5)",
        "1": "var(--veraz-space-1)",
        "1.5": "var(--veraz-space-1-5)",
        "2": "var(--veraz-space-2)",
        "2.5": "var(--veraz-space-2-5)",
        "3": "var(--veraz-space-3)",
        "4": "var(--veraz-space-4)",
        "5": "var(--veraz-space-5)",
        "6": "var(--veraz-space-6)",
        "8": "var(--veraz-space-8)",
        "10": "var(--veraz-space-10)",
        "12": "var(--veraz-space-12)",
        "16": "var(--veraz-space-16)",
        "20": "var(--veraz-space-20)",
        "24": "var(--veraz-space-24)",
        header: "var(--veraz-header-height)",
        sidebar: "var(--veraz-sidebar-width)",
      },
      borderRadius: {
        sm: "var(--veraz-radius-sm)",
        md: "var(--veraz-radius-md)",
        lg: "var(--veraz-radius-lg)",
        xl: "var(--veraz-radius-xl)",
        "2xl": "var(--veraz-radius-2xl)",
      },
      boxShadow: {
        xs: "var(--veraz-shadow-xs)",
        sm: "var(--veraz-shadow-sm)",
        md: "var(--veraz-shadow-md)",
        lg: "var(--veraz-shadow-lg)",
        focus: "var(--veraz-shadow-focus)",
      },
      maxWidth: {
        "container-sm": "var(--veraz-container-sm)",
        "container-md": "var(--veraz-container-md)",
        "container-lg": "var(--veraz-container-lg)",
        "container-xl": "var(--veraz-container-xl)",
        "container-2xl": "var(--veraz-container-2xl)",
      },
      zIndex: {
        dropdown: "var(--veraz-z-dropdown)",
        sticky: "var(--veraz-z-sticky)",
        overlay: "var(--veraz-z-overlay)",
        modal: "var(--veraz-z-modal)",
        toast: "var(--veraz-z-toast)",
        tooltip: "var(--veraz-z-tooltip)",
      },
      transitionDuration: {
        fast: "var(--veraz-duration-fast)",
        normal: "var(--veraz-duration-normal)",
        slow: "var(--veraz-duration-slow)",
      },
      transitionTimingFunction: {
        standard: "var(--veraz-ease-standard)",
        emphasized: "var(--veraz-ease-emphasized)",
      },
    },
  },
  plugins: [],
};

export default config;
