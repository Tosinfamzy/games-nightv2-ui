import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '../test/test-utils'
import userEvent from '@testing-library/user-event'
import JoinCodeQR from './JoinCodeQR'

// Mock QRCode library
vi.mock('qrcode', () => ({
  default: {
    toCanvas: vi.fn((canvas, url, options, callback) => {
      setTimeout(() => callback(null), 0)
    }),
  },
}))

// Mock toast module
vi.mock('../lib/toast', () => ({
  showToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('JoinCodeQR', () => {
  const mockJoinCode = '123456'
  const mockSessionName = 'Test Game Night'
  const expectedJoinUrl = 'http://localhost:3000/join/123456'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders with join code and session name', async () => {
    render(
      <JoinCodeQR joinCode={mockJoinCode} sessionName={mockSessionName} />
    )

    expect(screen.getByText('Scan to Join')).toBeInTheDocument()
    expect(screen.getByText(mockSessionName)).toBeInTheDocument()
    expect(screen.getByText(mockJoinCode)).toBeInTheDocument()
  })

  it('displays join URL', async () => {
    render(<JoinCodeQR joinCode={mockJoinCode} />)

    await waitFor(() => {
      expect(screen.getByText(expectedJoinUrl)).toBeInTheDocument()
    })
  })

  it('renders without session name', () => {
    render(<JoinCodeQR joinCode={mockJoinCode} />)

    expect(screen.getByText('Scan to Join')).toBeInTheDocument()
    expect(screen.queryByText(mockSessionName)).not.toBeInTheDocument()
  })

  describe('QR Code Generation', () => {
    it('generates QR code with correct URL', async () => {
      const QRCode = await import('qrcode')

      render(<JoinCodeQR joinCode={mockJoinCode} />)

      await waitFor(() => {
        expect(QRCode.default.toCanvas).toHaveBeenCalled()
      })

      const call = (QRCode.default.toCanvas as any).mock.calls[0]
      expect(call[1]).toBe(expectedJoinUrl)
    })

    it('uses default size of 256px', async () => {
      const QRCode = await import('qrcode')

      render(<JoinCodeQR joinCode={mockJoinCode} />)

      await waitFor(() => {
        expect(QRCode.default.toCanvas).toHaveBeenCalled()
      })

      const call = (QRCode.default.toCanvas as any).mock.calls[0]
      const options = call[2]
      expect(options.width).toBe(256)
    })

    it('uses custom size when provided', async () => {
      const QRCode = await import('qrcode')

      render(<JoinCodeQR joinCode={mockJoinCode} size={300} />)

      await waitFor(() => {
        expect(QRCode.default.toCanvas).toHaveBeenCalled()
      })

      const call = (QRCode.default.toCanvas as any).mock.calls[0]
      const options = call[2]
      expect(options.width).toBe(300)
    })

    it('shows loading state while generating', () => {
      render(<JoinCodeQR joinCode={mockJoinCode} />)

      expect(screen.getByText('Generating...')).toBeInTheDocument()
    })

    it('handles QR generation errors', async () => {
      const QRCode = await import('qrcode')
      const { showToast } = await import('../lib/toast')

      ;(QRCode.default.toCanvas as any).mockImplementation(
        (canvas: any, url: string, options: any, callback: any) => {
          callback(new Error('QR generation failed'))
        }
      )

      render(<JoinCodeQR joinCode={mockJoinCode} />)

      await waitFor(() => {
        expect(showToast.error).toHaveBeenCalledWith('Failed to generate QR code')
      })
    })
  })

  describe('Download Functionality', () => {
    it('renders download button', () => {
      render(<JoinCodeQR joinCode={mockJoinCode} />)

      expect(screen.getByText('Download QR Code')).toBeInTheDocument()
    })

    it('download button is disabled while generating', () => {
      render(<JoinCodeQR joinCode={mockJoinCode} />)

      const downloadButton = screen.getByText('Download QR Code')
      expect(downloadButton).toBeDisabled()
    })

    it('downloads QR code as PNG when clicked', async () => {
      const user = userEvent.setup()
      const { showToast } = await import('../lib/toast')

      const mockBlob = new Blob(['mock'], { type: 'image/png' })
      const mockToBlob = vi.fn((callback) => callback(mockBlob))
      const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
      const mockRevokeObjectURL = vi.fn()

      HTMLCanvasElement.prototype.toBlob = mockToBlob
      global.URL.createObjectURL = mockCreateObjectURL
      global.URL.revokeObjectURL = mockRevokeObjectURL

      const mockClick = vi.fn()
      HTMLAnchorElement.prototype.click = mockClick

      render(<JoinCodeQR joinCode={mockJoinCode} />)

      await waitFor(() => {
        expect(screen.queryByText('Generating...')).not.toBeInTheDocument()
      })

      const downloadButton = screen.getByText('Download QR Code')
      await user.click(downloadButton)

      await waitFor(() => {
        expect(mockToBlob).toHaveBeenCalled()
        expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob)
        expect(mockClick).toHaveBeenCalled()
        expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
        expect(showToast.success).toHaveBeenCalledWith('QR code downloaded!')
      })
    })

    it('handles download errors gracefully', async () => {
      const user = userEvent.setup()
      const { showToast } = await import('../lib/toast')

      const mockToBlob = vi.fn((callback) => callback(null))
      HTMLCanvasElement.prototype.toBlob = mockToBlob

      render(<JoinCodeQR joinCode={mockJoinCode} />)

      await waitFor(() => {
        expect(screen.queryByText('Generating...')).not.toBeInTheDocument()
      })

      const downloadButton = screen.getByText('Download QR Code')
      await user.click(downloadButton)

      await waitFor(() => {
        expect(showToast.error).toHaveBeenCalledWith(
          'Failed to generate QR code image'
        )
      })
    })

    it('downloads with correct filename', async () => {
      const user = userEvent.setup()

      const mockBlob = new Blob(['mock'], { type: 'image/png' })
      const mockToBlob = vi.fn((callback) => callback(mockBlob))
      global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')

      const createdLinks: HTMLAnchorElement[] = []
      const originalCreateElement = document.createElement.bind(document)
      document.createElement = vi.fn((tagName: string) => {
        const element = originalCreateElement(tagName)
        if (tagName === 'a') {
          createdLinks.push(element as HTMLAnchorElement)
        }
        return element
      })

      HTMLCanvasElement.prototype.toBlob = mockToBlob

      render(<JoinCodeQR joinCode={mockJoinCode} />)

      await waitFor(() => {
        expect(screen.queryByText('Generating...')).not.toBeInTheDocument()
      })

      const downloadButton = screen.getByText('Download QR Code')
      await user.click(downloadButton)

      await waitFor(() => {
        expect(createdLinks.length).toBeGreaterThan(0)
        const link = createdLinks[0]
        expect(link.download).toBe(`session-${mockJoinCode}-qr.png`)
      })

      document.createElement = originalCreateElement
    })
  })

  describe('Styling and Layout', () => {
    it('has proper container styling', () => {
      const { container } = render(<JoinCodeQR joinCode={mockJoinCode} />)

      const mainDiv = container.firstChild as HTMLElement
      expect(mainDiv).toHaveClass('flex')
      expect(mainDiv).toHaveClass('flex-col')
      expect(mainDiv).toHaveClass('items-center')
      expect(mainDiv).toHaveClass('bg-white')
      expect(mainDiv).toHaveClass('rounded-lg')
    })

    it('displays code with monospace font', () => {
      render(<JoinCodeQR joinCode={mockJoinCode} />)

      const codeElement = screen.getByText(mockJoinCode)
      expect(codeElement).toHaveClass('font-mono')
      expect(codeElement).toHaveClass('font-bold')
    })

    it('canvas has proper styling', async () => {
      const { container } = render(<JoinCodeQR joinCode={mockJoinCode} />)

      const canvas = container.querySelector('canvas')
      expect(canvas).toBeInTheDocument()
      expect(canvas).toHaveClass('border-2')
      expect(canvas).toHaveClass('rounded-lg')
    })
  })

  describe('Accessibility', () => {
    it('download button has proper semantics', () => {
      render(<JoinCodeQR joinCode={mockJoinCode} />)

      const button = screen.getByRole('button', { name: 'Download QR Code' })
      expect(button).toBeInTheDocument()
    })

    it('heading has proper structure', () => {
      render(<JoinCodeQR joinCode={mockJoinCode} />)

      const heading = screen.getByText('Scan to Join')
      expect(heading.tagName).toBe('H4')
    })
  })
})
