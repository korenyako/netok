import '@testing-library/jest-dom'

// Mock @tauri-apps/api
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}))

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      // Simple mock that returns the key or interpolated values
      if (options) {
        return key.replace(/\{\{(\w+)\}\}/g, (match, prop) => options[prop] || match)
      }
      return key
    },
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
}))
