import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCopyToClipboard } from './useCopyToClipboard'
import * as toast from '../lib/toast'

vi.mock('../lib/toast', () => ({
  showToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('useCopyToClipboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should copy text to clipboard using modern API', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    })

    const { result } = renderHook(() => useCopyToClipboard())
    const [copyToClipboard] = result.current

    await act(async () => {
      await copyToClipboard('test text')
    })

    expect(writeTextMock).toHaveBeenCalledWith('test text')
    expect(toast.showToast.success).toHaveBeenCalledWith('Copied to clipboard')
  })

  it('should use custom success message when provided', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    })

    const { result } = renderHook(() => useCopyToClipboard())
    const [copyToClipboard] = result.current

    await act(async () => {
      await copyToClipboard('test text', 'Custom success message')
    })

    expect(toast.showToast.success).toHaveBeenCalledWith('Custom success message')
  })

  it('should return true on successful copy', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    })

    const { result } = renderHook(() => useCopyToClipboard())
    const [copyToClipboard] = result.current

    let copyResult: boolean | undefined
    await act(async () => {
      copyResult = await copyToClipboard('test text')
    })

    expect(copyResult).toBe(true)
  })

  it('should update state to success on successful copy', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    })

    const { result } = renderHook(() => useCopyToClipboard())
    const [copyToClipboard] = result.current

    await act(async () => {
      await copyToClipboard('test text')
    })

    const [, state] = result.current
    expect(state.success).toBe(true)
    expect(state.error).toBe(null)
  })

  it('should handle clipboard API errors', async () => {
    const error = new Error('Clipboard API failed')
    const writeTextMock = vi.fn().mockRejectedValue(error)
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    })

    const { result } = renderHook(() => useCopyToClipboard())
    const [copyToClipboard] = result.current

    let copyResult: boolean | undefined
    await act(async () => {
      copyResult = await copyToClipboard('test text')
    })

    expect(copyResult).toBe(false)
    expect(toast.showToast.error).toHaveBeenCalledWith('Failed to copy to clipboard')
  })

  it('should update state to error on failed copy', async () => {
    const error = new Error('Clipboard API failed')
    const writeTextMock = vi.fn().mockRejectedValue(error)
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    })

    const { result } = renderHook(() => useCopyToClipboard())
    const [copyToClipboard] = result.current

    await act(async () => {
      await copyToClipboard('test text')
    })

    const [, state] = result.current
    expect(state.success).toBe(false)
    expect(state.error).toBeInstanceOf(Error)
  })

  it('should use fallback method when clipboard API is not available', async () => {
    // Mock missing clipboard API
    Object.assign(navigator, {
      clipboard: undefined,
    })

    const execCommandMock = vi.fn().mockReturnValue(true)
    document.execCommand = execCommandMock

    const { result } = renderHook(() => useCopyToClipboard())
    const [copyToClipboard] = result.current

    await act(async () => {
      await copyToClipboard('test text')
    })

    expect(execCommandMock).toHaveBeenCalledWith('copy')
    expect(toast.showToast.success).toHaveBeenCalledWith('Copied to clipboard')
  })
})
