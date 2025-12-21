import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { showToast } from '../lib/toast'

interface JoinCodeQRProps {
  joinCode: string
  sessionName?: string
  size?: number
}

/**
 * Enhanced QR Code component with download capability
 */
export default function JoinCodeQR({
  joinCode,
  sessionName,
  size = 256,
}: JoinCodeQRProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isGenerating, setIsGenerating] = useState(true)

  // Generate join URL using the auto-join route
  const joinUrl = `${window.location.origin}/join/${joinCode}`

  useEffect(() => {
    if (canvasRef.current) {
      setIsGenerating(true)
      QRCode.toCanvas(
        canvasRef.current,
        joinUrl,
        {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        },
        (error) => {
          setIsGenerating(false)
          if (error) {
            console.error('QR Code generation error:', error)
            showToast.error('Failed to generate QR code')
          }
        },
      )
    }
  }, [joinCode, joinUrl, size])

  const handleDownload = () => {
    if (!canvasRef.current) return

    try {
      // Convert canvas to blob and download
      canvasRef.current.toBlob((blob) => {
        if (!blob) {
          showToast.error('Failed to generate QR code image')
          return
        }

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = `session-${joinCode}-qr.png`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
        showToast.success('QR code downloaded!')
      })
    } catch (error) {
      console.error('Download error:', error)
      showToast.error('Failed to download QR code')
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="text-center">
        <h4 className="text-lg font-semibold text-gray-900">Scan to Join</h4>
        {sessionName && (
          <p className="text-sm text-gray-600 mt-1">{sessionName}</p>
        )}
      </div>

      <div className="relative">
        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="text-sm text-gray-500">Generating...</div>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="border-2 border-gray-200 rounded-lg shadow-sm"
        />
      </div>

      <div className="text-center space-y-2 w-full">
        <p className="text-sm text-gray-600">
          Or use code:{' '}
          <span className="font-mono font-bold text-lg text-gray-900 tracking-wider">
            {joinCode}
          </span>
        </p>
        <p className="text-xs text-gray-500 break-all">{joinUrl}</p>
      </div>

      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-sm transition-colors"
      >
        Download QR Code
      </button>
    </div>
  )
}
