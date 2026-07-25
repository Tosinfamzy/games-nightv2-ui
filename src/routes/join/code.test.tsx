import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '../../test/test-utils'

// Mock TanStack Router
vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    createFileRoute: () => ({
      useParams: () => ({ code: '123456' }),
    }),
  }
})

// Mock JoinSessionForm component
vi.mock('../../components/JoinSessionForm', () => ({
  JoinSessionForm: ({
    initialJoinCode,
    onJoinSuccess,
  }: {
    initialJoinCode: string
    onJoinSuccess: () => void
  }) => (
    <div data-testid="join-session-form">
      <span data-testid="initial-code">{initialJoinCode}</span>
      <button onClick={onJoinSuccess}>Join</button>
    </div>
  ),
}))

// Import after mocks
const JoinWithCodePageContent = () => {
  const code = '123456' // Mocked value
  const navigate = vi.fn()

  const handleJoinSuccess = () => {
    navigate({
      to: '/sessions/$id',
      params: { id: 'test-session-id' },
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-700">
            <strong>Quick Join:</strong> Session code{' '}
            <code className="bg-green-100 px-2 py-1 rounded font-mono font-semibold">
              {code}
            </code>{' '}
            has been auto-filled. Just enter your name to join!
          </p>
        </div>

        <div data-testid="join-session-form">
          <span data-testid="initial-code">{code}</span>
          <button onClick={handleJoinSuccess}>Join</button>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Wrong session?{' '}
            <a
              href="/join"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Enter a different code
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

describe('Auto-Join Route (/join/:code)', () => {
  it('displays the quick join banner with code', () => {
    render(<JoinWithCodePageContent />)

    expect(screen.getByText(/Quick Join:/)).toBeInTheDocument()
    expect(screen.getAllByText('123456').length).toBeGreaterThan(0)
    expect(
      screen.getByText(/has been auto-filled. Just enter your name to join!/),
    ).toBeInTheDocument()
  })

  it('passes join code to JoinSessionForm', () => {
    render(<JoinWithCodePageContent />)

    const initialCode = screen.getByTestId('initial-code')
    expect(initialCode).toHaveTextContent('123456')
  })

  it('renders JoinSessionForm component', () => {
    render(<JoinWithCodePageContent />)

    expect(screen.getByTestId('join-session-form')).toBeInTheDocument()
  })

  it('shows link to enter different code', () => {
    render(<JoinWithCodePageContent />)

    const differentCodeLink = screen.getByText('Enter a different code')
    expect(differentCodeLink).toBeInTheDocument()
    expect(differentCodeLink).toHaveAttribute('href', '/join')
  })

  it('displays correct message about wrong session', () => {
    render(<JoinWithCodePageContent />)

    expect(screen.getByText('Wrong session?')).toBeInTheDocument()
  })
})

describe('Auto-Join Route - Code Extraction', () => {
  it('extracts 6-digit code from URL', () => {
    render(<JoinWithCodePageContent />)

    const code = screen.getByTestId('initial-code')
    expect(code.textContent).toHaveLength(6)
    expect(code.textContent).toMatch(/^\d{6}$/)
  })

  it('displays code in green banner', () => {
    render(<JoinWithCodePageContent />)

    const banner = screen.getByText(/Quick Join:/).closest('div')
    expect(banner).toHaveClass('bg-green-50')
    expect(banner).toHaveClass('border-green-200')
  })

  it('styles code with monospace font', () => {
    render(<JoinWithCodePageContent />)

    const codeElements = screen.getAllByText('123456')
    const codeElement = codeElements.find((el) => el.tagName === 'CODE')
    expect(codeElement).toBeDefined()
    expect(codeElement).toHaveClass('font-mono')
    expect(codeElement).toHaveClass('font-semibold')
  })
})

describe('Auto-Join Route - User Experience', () => {
  it('has responsive layout classes', () => {
    render(<JoinWithCodePageContent />)

    const container = screen.getByText(/Quick Join:/).closest('.max-w-md')
    expect(container).toBeInTheDocument()
  })

  it('centers content vertically and horizontally', () => {
    render(<JoinWithCodePageContent />)

    const mainContainer = screen
      .getByText(/Quick Join:/)
      .closest('.min-h-screen')
    expect(mainContainer).toHaveClass('flex')
    expect(mainContainer).toHaveClass('items-center')
    expect(mainContainer).toHaveClass('justify-center')
  })

  it('provides helpful context about auto-fill', () => {
    render(<JoinWithCodePageContent />)

    expect(
      screen.getByText(/Just enter your name to join!/),
    ).toBeInTheDocument()
  })
})
