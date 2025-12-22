import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '../test/test-utils'
import userEvent from '@testing-library/user-event'
import { ShareSessionButtons } from './ShareSessionButtons'

// Mock the toast module
vi.mock('../lib/toast', () => ({
  showToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('ShareSessionButtons', () => {
  const mockJoinCode = '123456'
  const mockSessionName = 'Test Game Night'
  const expectedJoinUrl = 'http://localhost:3000/join/123456'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders all share buttons', () => {
    render(
      <ShareSessionButtons
        joinCode={mockJoinCode}
        sessionName={mockSessionName}
      />
    )

    expect(screen.getByText('Share Invite')).toBeInTheDocument()
    expect(screen.getByText('Copy Link')).toBeInTheDocument()
    expect(screen.getByText('WhatsApp')).toBeInTheDocument()
    expect(screen.getByText('SMS')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  describe('Copy Link Button', () => {
    it('copies link to clipboard when clicked', async () => {
      const user = userEvent.setup()
      const writeTextMock = vi.fn(() => Promise.resolve())
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
        configurable: true,
      })

      render(
        <ShareSessionButtons
          joinCode={mockJoinCode}
          sessionName={mockSessionName}
        />
      )

      const copyButton = screen.getByText('Copy Link')
      await user.click(copyButton)

      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalledWith(expectedJoinUrl)
      })
    })

    it('shows success feedback after copying', async () => {
      const user = userEvent.setup()
      const { showToast } = await import('../lib/toast')

      render(
        <ShareSessionButtons
          joinCode={mockJoinCode}
          sessionName={mockSessionName}
        />
      )

      const copyButton = screen.getByText('Copy Link')
      await user.click(copyButton)

      await waitFor(() => {
        expect(showToast.success).toHaveBeenCalledWith(
          'Link copied to clipboard!'
        )
      })
    })

    it('shows copied state temporarily', async () => {
      const user = userEvent.setup()

      render(
        <ShareSessionButtons
          joinCode={mockJoinCode}
          sessionName={mockSessionName}
        />
      )

      const copyButton = screen.getByText('Copy Link')
      await user.click(copyButton)

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument()
      })
    })

    it('handles clipboard write errors gracefully', async () => {
      const user = userEvent.setup()
      const writeTextMock = vi.fn(() =>
        Promise.reject(new Error('Clipboard error'))
      )
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
        configurable: true,
      })
      const { showToast } = await import('../lib/toast')

      render(
        <ShareSessionButtons
          joinCode={mockJoinCode}
          sessionName={mockSessionName}
        />
      )

      const copyButton = screen.getByText('Copy Link')
      await user.click(copyButton)

      await waitFor(() => {
        expect(showToast.error).toHaveBeenCalledWith('Failed to copy link')
      })
    })
  })

  describe('WhatsApp Button', () => {
    it('opens WhatsApp with correct URL', async () => {
      const user = userEvent.setup()
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

      render(
        <ShareSessionButtons
          joinCode={mockJoinCode}
          sessionName={mockSessionName}
        />
      )

      const whatsappButton = screen.getByText('WhatsApp')
      await user.click(whatsappButton)

      expect(windowOpenSpy).toHaveBeenCalled()
      const calledUrl = windowOpenSpy.mock.calls[0][0] as string
      expect(calledUrl).toContain('https://wa.me/')
      expect(decodeURIComponent(calledUrl)).toContain(mockJoinCode)
      expect(decodeURIComponent(calledUrl)).toContain(expectedJoinUrl)

      windowOpenSpy.mockRestore()
    })

    it('includes session name in WhatsApp message', async () => {
      const user = userEvent.setup()
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

      render(
        <ShareSessionButtons
          joinCode={mockJoinCode}
          sessionName="Epic Game Night"
        />
      )

      const whatsappButton = screen.getByText('WhatsApp')
      await user.click(whatsappButton)

      const calledUrl = windowOpenSpy.mock.calls[0][0] as string
      expect(decodeURIComponent(calledUrl)).toContain('Epic Game Night')

      windowOpenSpy.mockRestore()
    })
  })

  describe('SMS Button', () => {
    it('creates SMS URL for iOS devices', async () => {
      const user = userEvent.setup()
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        configurable: true,
      })

      const hrefSpy = vi.fn()
      Object.defineProperty(window.location, 'href', {
        set: hrefSpy,
        configurable: true,
      })

      render(
        <ShareSessionButtons
          joinCode={mockJoinCode}
          sessionName={mockSessionName}
        />
      )

      const smsButton = screen.getByText('SMS')
      await user.click(smsButton)

      const calledUrl = hrefSpy.mock.calls[0][0]
      expect(calledUrl).toContain('sms:&body=')
      expect(decodeURIComponent(calledUrl)).toContain(mockJoinCode)
    })

    it('creates SMS URL for Android devices', async () => {
      const user = userEvent.setup()
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 10)',
        configurable: true,
      })

      const hrefSpy = vi.fn()
      Object.defineProperty(window.location, 'href', {
        set: hrefSpy,
        configurable: true,
      })

      render(
        <ShareSessionButtons
          joinCode={mockJoinCode}
          sessionName={mockSessionName}
        />
      )

      const smsButton = screen.getByText('SMS')
      await user.click(smsButton)

      const calledUrl = hrefSpy.mock.calls[0][0]
      expect(calledUrl).toContain('sms:?body=')
      expect(decodeURIComponent(calledUrl)).toContain(mockJoinCode)
    })
  })

  describe('Email Button', () => {
    it('opens email client with correct content', async () => {
      const user = userEvent.setup()
      const hrefSpy = vi.fn()
      Object.defineProperty(window.location, 'href', {
        set: hrefSpy,
        configurable: true,
      })

      render(
        <ShareSessionButtons
          joinCode={mockJoinCode}
          sessionName={mockSessionName}
        />
      )

      const emailButton = screen.getByText('Email')
      await user.click(emailButton)

      const calledUrl = hrefSpy.mock.calls[0][0]
      expect(calledUrl).toContain('mailto:?')
      expect(decodeURIComponent(calledUrl)).toContain(mockSessionName)
      expect(decodeURIComponent(calledUrl)).toContain(mockJoinCode)
      expect(decodeURIComponent(calledUrl)).toContain(expectedJoinUrl)
    })

    it('includes formatted email body', async () => {
      const user = userEvent.setup()
      const hrefSpy = vi.fn()
      Object.defineProperty(window.location, 'href', {
        set: hrefSpy,
        configurable: true,
      })

      render(
        <ShareSessionButtons
          joinCode={mockJoinCode}
          sessionName={mockSessionName}
        />
      )

      const emailButton = screen.getByText('Email')
      await user.click(emailButton)

      const calledUrl = decodeURIComponent(hrefSpy.mock.calls[0][0])
      expect(calledUrl).toContain('Session Code:')
      expect(calledUrl).toContain('Quick Join Link:')
    })
  })

  describe('Accessibility', () => {
    it('has proper button semantics', () => {
      render(
        <ShareSessionButtons
          joinCode={mockJoinCode}
          sessionName={mockSessionName}
        />
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(4)
    })

    it('buttons can be clicked', async () => {
      const user = userEvent.setup()
      const writeTextMock = vi.fn(() => Promise.resolve())
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
        configurable: true,
      })

      render(
        <ShareSessionButtons
          joinCode={mockJoinCode}
          sessionName={mockSessionName}
        />
      )

      const copyButton = screen.getByText('Copy Link')
      await user.click(copyButton)

      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalled()
      })
    })
  })
})
