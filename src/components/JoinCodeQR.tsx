import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface JoinCodeQRProps {
  joinCode: string
  sessionName?: string
}

/**
 * QR Code component for easy mobile joining
 */
export default function JoinCodeQR({ joinCode, sessionName }: JoinCodeQRProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      // Generate QR code with join URL
      const joinUrl = `${window.location.origin}/join?code=${joinCode}`

      QRCode.toCanvas(
        canvasRef.current,
        joinUrl,
        {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        },
        (error) => {
          if (error) console.error('QR Code generation error:', error)
        },
      )
    }
  }, [joinCode])

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg">
      <div className="text-center">
        <h4 className="font-semibold text-gray-900">Scan to Join</h4>
        {sessionName && (
          <p className="text-sm text-gray-600 mt-1">{sessionName}</p>
        )}
      </div>

      <canvas ref={canvasRef} className="border border-gray-100 rounded" />

      <div className="text-center">
        <p className="text-xs text-gray-500">
          Or use code:{' '}
          <span className="font-mono font-semibold text-gray-900">
            {joinCode}
          </span>
        </p>
      </div>
    </div>
  )
}
