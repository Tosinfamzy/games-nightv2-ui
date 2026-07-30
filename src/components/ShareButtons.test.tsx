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
    // No native share by default so "Share invite" falls back to copy.
    Object.assign(navigator, { share: undefined })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('includes the host message with the link in the WhatsApp text', () => {
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null)
    render(<ShareButtons url={URL} message={MESSAGE} />)

    fireEvent.click(screen.getByText('WhatsApp'))

    const called = openSpy.mock.calls[0][0] as string
    expect(called).toContain('https://wa.me/?text=')
    const text = decodeURIComponent(called.split('text=')[1])
    expect(text).toBe(`${MESSAGE}\n\n${URL}`)
  })

  it('copies the message AND link (not a bare url)', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    render(<ShareButtons url={URL} message={MESSAGE} />)

    fireEvent.click(screen.getByText('Copy invite'))
    await screen.findByText('Copied!')
    expect(writeText).toHaveBeenCalledWith(`${MESSAGE}\n\n${URL}`)
  })

  it('"Share invite" falls back to copying the full invite without a share sheet', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText }, share: undefined })
    render(<ShareButtons url={URL} message={MESSAGE} />)

    fireEvent.click(screen.getByText('Share invite'))
    await screen.findByText('Copied!')
    expect(writeText).toHaveBeenCalledWith(`${MESSAGE}\n\n${URL}`)
  })

  it('"Share invite" uses the native share sheet with message + link when available', () => {
    const share = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { share })
    render(<ShareButtons url={URL} message={MESSAGE} />)

    fireEvent.click(screen.getByText('Share invite'))
    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({ text: `${MESSAGE}\n\n${URL}` }),
    )
  })
})
