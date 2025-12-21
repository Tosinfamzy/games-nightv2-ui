import { useEffect, useState } from 'react'

interface ReadyCelebrationProps {
  isReady: boolean
  trigger: boolean // External trigger to show celebration
}

export function ReadyCelebration({
  isReady,
  trigger,
}: ReadyCelebrationProps) {
  const [show, setShow] = useState(false)
  const [confetti, setConfetti] = useState<Array<{ id: number; left: string }>>([])

  useEffect(() => {
    if (isReady && trigger) {
      setShow(true)

      // Generate confetti
      const newConfetti = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
      }))
      setConfetti(newConfetti)

      // Hide after animation
      const timer = setTimeout(() => {
        setShow(false)
        setConfetti([])
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isReady, trigger])

  if (!show) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Confetti */}
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute -top-10 w-2 h-2 bg-yellow-400 animate-confetti"
          style={{
            left: piece.left,
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${2 + Math.random()}s`,
          }}
        />
      ))}

      {/* Success message overlay */}
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="animate-bounce-in bg-white rounded-lg shadow-2xl p-8 border-4 border-green-500">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-spin-slow">🎉</div>
            <h2 className="text-3xl font-bold text-green-600 mb-2">
              All Players Ready!
            </h2>
            <p className="text-gray-600 text-lg">
              The session can now begin!
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotateZ(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotateZ(720deg);
            opacity: 0;
          }
        }
        @keyframes bounce-in {
          0% {
            transform: scale(0) translateX(-50%) translateY(-50%);
            opacity: 0;
          }
          50% {
            transform: scale(1.1) translateX(-50%) translateY(-50%);
          }
          100% {
            transform: scale(1) translateX(-50%) translateY(-50%);
            opacity: 1;
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-confetti {
          animation: confetti forwards;
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out forwards;
        }
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
      `}</style>
    </div>
  )
}
