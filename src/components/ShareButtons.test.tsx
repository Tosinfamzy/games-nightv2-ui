import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ShareButtons } from './ShareButtons'

vi.mock('../lib/toast', () => ({
  showToast: { success: vi.fn(), error: vi.fn() },
  toastHelpers: { copied: vi.fn() },
}))

const URL = 'https://app.test/rsvp/tok-123'
const MESSAGE = "You're invited! 🎲"

describe('ShareButtons', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // No native share by default so the explicit channels always render.
    Object.assign(navigator, { share: undefined })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('prepends the host message to the link in the WhatsApp share text', () => {
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null)
    render(<ShareButtons url={URL} message={MESSAGE} />)

    fireEvent.click(screen.getByText('WhatsApp'))

    const called = openSpy.mock.calls[0][0] as string
    expect(called).toContain('https://wa.me/?text=')
    const text = decodeURIComponent(called.split('text=')[1])
    expect(text).toBe(`${MESSAGE}\n\n${URL}`)
  })

  it('shares only the bare URL when no message is given', () => {
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null)
    render(<ShareButtons url={URL} />)

    fireEvent.click(screen.getByText('WhatsApp'))

    const text = decodeURIComponent(
      (openSpy.mock.calls[0][0] as string).split('text=')[1],
    )
    expect(text).toBe(URL)
  })

  it('copies just the URL (not the message) to the clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    render(<ShareButtons url={URL} message={MESSAGE} />)

    fireEvent.click(screen.getByText('Copy link'))
    // Await the post-copy "Copied!" re-render so the state update settles in act.
    await screen.findByText('Copied!')
    expect(writeText).toHaveBeenCalledWith(URL)
  })

  it('shows the native Share button only when the Web Share API exists', () => {
    const { rerender } = render(<ShareButtons url={URL} />)
    expect(screen.queryByText('Share')).toBeNull()

    Object.assign(navigator, { share: vi.fn().mockResolvedValue(undefined) })
    rerender(<ShareButtons url={URL} message={MESSAGE} key="with-share" />)
    expect(screen.getByText('Share')).toBeInTheDocument()
  })
})
