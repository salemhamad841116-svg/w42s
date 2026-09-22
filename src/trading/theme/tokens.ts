export const TRADING_TOKENS = {
  surface: {
    primary: '#0B0E14',
    secondary: '#151924',
    tertiary: '#1C2030',
    hover: '#1E2336',
    active: '#252A3A',
  },
  borders: {
    default: '#262B3D',
    subtle: '#1E2336',
    strong: '#3A4158',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#8F9CAE',
    tertiary: '#5E6A7E',
  },
  sentiment: {
    bullish: {
      default: '#00C087',
      hover: '#00D99A',
      muted: 'rgba(0,192,135,0.15)',
    },
    bearish: {
      default: '#F23645',
      hover: '#FF4D5C',
      muted: 'rgba(242,54,69,0.15)',
    },
  },
  accent: {
    blue: '#2962FF',
    yellow: '#F7931A',
    orange: '#FF6D00',
    purple: '#7B61FF',
  },
  spacing: {
    headerHeight: '56px',
    panelGap: '1px',
    borderRadius: '6px',
  },
} as const;
