import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ShareSessionModal from './ShareSessionModal'

// Mock the toast module
vi.mock('../lib/toast', () => ({
  showToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  toastHelpers: {
    operationError: vi.fn(),
    copied: vi.fn(),
  },
}))

// Mock the copy hook
vi.mock('../hooks/useCopyToClipboard', () => ({
  useCopyToClipboard: () => [vi.fn().mockResolvedValue(true), { success: true, error: null }],
}))

// Mock react-qr-code
vi.mock('react-qr-code', () => ({
  default: ({ value }: { value: string }) => <div data-testid="qr-code">{value}</div>,
}))

describe('ShareSessionModal', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
  })

  const defaultProps = {
    sessionId: 'test-session-id',
    joinCode: '123456',
    sessionName: 'Test Session',
    isOpen: true,
    onClose: vi.fn(),
    isHost: false,
  }

  const renderModal = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ShareSessionModal {...defaultProps} {...props} />
      </QueryClientProvider>
    )
  }

  it('should render modal when isOpen is true', () => {
    renderModal()
    expect(screen.getByText('Share Session')).toBeInTheDocument()
  })

  it('should not render modal when isOpen is false', () => {
    renderModal({ isOpen: false })
    expect(screen.queryByText('Share Session')).not.toBeInTheDocument()
  })

  it('should display session name', () => {
    renderModal()
    expect(screen.getByText('Test Session')).toBeInTheDocument()
  })

  it('should display join code', () => {
    renderModal()
    expect(screen.getByDisplayValue('123456')).toBeInTheDocument()
  })

  it('should display QR code with join link', () => {
    renderModal()
    const qrCode = screen.getByTestId('qr-code')
    expect(qrCode).toBeInTheDocument()
    expect(qrCode).toHaveTextContent('http://localhost:3000/join/123456')
  })

  it('should display share link', () => {
    renderModal()
    expect(screen.getByDisplayValue(/join\/123456/)).toBeInTheDocument()
  })

  it('should have copy button for join code', () => {
    renderModal()
    const copyButtons = screen.getAllByRole('button', { name: /copy/i })
    expect(copyButtons.length).toBeGreaterThan(0)
  })

  it('should have copy link button for share link', () => {
    renderModal()
    // There are now multiple copy link buttons (original + social share buttons)
    const copyLinkButtons = screen.getAllByRole('button', { name: /copy link/i })
    expect(copyLinkButtons.length).toBeGreaterThan(0)
  })

  it('should call onClose when close button is clicked', async () => {
    const onClose = vi.fn()
    renderModal({ onClose })

    const closeButton = screen.getByRole('button', { name: 'Close' })
    await userEvent.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when X button is clicked', async () => {
    const onClose = vi.fn()
    renderModal({ onClose })

    const xButton = screen.getByRole('button', { name: /close share session modal/i })
    await userEvent.click(xButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should show regenerate button when user is host', () => {
    renderModal({ isHost: true })
    expect(screen.getByText(/regenerate join code/i)).toBeInTheDocument()
  })

  it('should not show regenerate button when user is not host', () => {
    renderModal({ isHost: false })
    expect(screen.queryByText(/regenerate join code/i)).not.toBeInTheDocument()
  })

  it('should show warning message for regenerate button', () => {
    renderModal({ isHost: true })
    expect(screen.getByText(/this will invalidate the old join code/i)).toBeInTheDocument()
  })
})
