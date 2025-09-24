import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import MainPage from './MainPage'
import { useDiagnostics } from '../store/useDiagnostics'
import { useSettings } from '../store/useSettings'

// Mock the hooks
vi.mock('../store/useDiagnostics')
vi.mock('../store/useSettings')

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

// Mock i18next with proper English translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string>) => {
      const translations: Record<string, string> = {
        'internet.full': 'Internet available.',
        'internet.partial': 'Internet partially available.',
        'internet.down': 'Internet unavailable.',
        'speed.label': 'Speed: {{speed}}',
        'speed.value': '{{down}}/{{up}} Mbps',
        'status.error_prefix': 'Error',
        'updated_at': 'Updated',
        'dash': '—',
        'unknown': 'unknown',
        'nodes.computer.name': 'Computer',
        'nodes.computer.name_field': 'Name',
        'nodes.computer.model_field': 'Model',
        'nodes.computer.adapter_field': 'Network adapter',
        'nodes.computer.local_ip_field': 'Local IP',
        'nodes.network.name': 'Network',
        'nodes.network.type_wifi': 'Wi-Fi',
        'nodes.network.signal_field': 'Signal',
        'nodes.network.signal_excellent': 'Signal: excellent',
        'nodes.router.name': 'Router/Access Point',
        'nodes.router.local_ip_field': 'LAN IP',
        'nodes.internet.name': 'Internet',
        'nodes.internet.ip_field': 'IP',
        'buttons.refresh': 'Refresh',
        'buttons.settings': 'Settings',
        'status.waiting': 'Refreshing…',
      }
      
      let translation = translations[key] || key
      
      // Handle interpolation
      if (options) {
        Object.keys(options).forEach(prop => {
          translation = translation.replace(new RegExp(`\\{\\{${prop}\\}\\}`, 'g'), options[prop])
        })
      }
      
      return translation
    },
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
}))

const mockUseDiagnostics = vi.mocked(useDiagnostics)
const mockUseSettings = vi.mocked(useSettings)

describe('MainPage i18n', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock implementations
    mockUseDiagnostics.mockReturnValue({
      snapshot: {
        overall: 'ok',
        computer: {
          hostname: 'DESKTOP-TEST',
          model: 'Test Computer',
          adapter: 'Test Adapter',
          local_ip: '192.168.1.100'
        },
        network: {
          type: 'wifi',
          signal: {
            dbm: -45,
            level: 'excellent'
          }
        },
        router: {
          brand: 'Test Router',
          model: 'Test Model',
          localIp: '192.168.1.1'
        },
        internet: {
          provider: 'Test Provider',
          publicIp: '1.2.3.4',
          country: 'Test Country',
          city: 'Test City'
        },
        speed: {
          down: 10,
          up: 2
        },
        updatedAt: '2024-01-15T10:30:00Z'
      },
      isLoading: false,
      refresh: vi.fn(),
      error: null
    })
    
    mockUseSettings.mockReturnValue({
      geoEnabled: true
    })
  })

  it('should render MainPage without Cyrillic characters', () => {
    render(<MainPage />)
    
    // Get all text content from the DOM
    const allText = document.body.textContent || ''
    
    // Check that no Cyrillic characters are present
    const cyrillicRegex = /[А-Яа-яЁё]/
    expect(cyrillicRegex.test(allText)).toBe(false)
  })

  it('should display speed with correct English formatting', () => {
    render(<MainPage />)
    
    // Check that speed is displayed correctly in English
    expect(screen.getByText(/Speed: 10\/2 Mbps/)).toBeInTheDocument()
  })

  it('should use i18n for all text elements', () => {
    render(<MainPage />)
    
    // Check that key UI elements are translated
    expect(screen.getByText('Internet available.')).toBeInTheDocument()
    expect(screen.getByText('Computer')).toBeInTheDocument()
    expect(screen.getByText('Network')).toBeInTheDocument()
    expect(screen.getByText('Router/Access Point')).toBeInTheDocument()
    expect(screen.getByText('Internet')).toBeInTheDocument()
    expect(screen.getByText('Refresh')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('should handle missing speed data with dash', () => {
    mockUseDiagnostics.mockReturnValue({
      snapshot: {
        overall: 'ok',
        computer: {},
        network: {},
        router: {},
        internet: {},
        speed: null,
        updatedAt: '2024-01-15T10:30:00Z'
      },
      isLoading: false,
      refresh: vi.fn(),
      error: null
    })
    
    render(<MainPage />)
    
    // Should show dash for missing speed
    expect(screen.getByText(/Speed: —/)).toBeInTheDocument()
  })

  it('should display error messages in English', () => {
    mockUseDiagnostics.mockReturnValue({
      snapshot: null,
      isLoading: false,
      refresh: vi.fn(),
      error: 'Test error message'
    })
    
    render(<MainPage />)
    
    // Error should be prefixed with English text
    expect(screen.getByText(/Error Test error message/)).toBeInTheDocument()
  })

  it('should display updated time with English prefix', () => {
    render(<MainPage />)
    
    // Should show "Updated" prefix in English
    expect(screen.getByText(/Updated/)).toBeInTheDocument()
  })
})
