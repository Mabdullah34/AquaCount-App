"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { FunnyBuddy } from "@/components/funny-buddy"
import { PremiumBuddy } from "@/components/premium-buddy"
import { useSound } from "@/hooks/use-sound"

interface BuddyGameScreenProps {
  user: any
  onBack: () => void
  theme: "light" | "dark"
}

interface Droplet {
  id: number
  x: number
  y: number
  radius: number
  color: string
}

const GAME_WIDTH = 320 // Matches max-w-md in app/page.tsx for consistent sizing
const GAME_HEIGHT = 480 // Aspect ratio for the game area
const DROPLET_RADIUS = 12
const BUDDY_BASKET_WIDTH = 80 // Width of the catching area
const BUDDY_BASKET_HEIGHT = 20 // Height of the catching area
const DROPLET_FALL_SPEED = 2 // Pixels per frame
const DROPLET_SPAWN_INTERVAL = 1000 // Milliseconds between new droplets
const MAX_MISSED_DROPS = 5

export function BuddyGameScreen({ user, onBack, theme }: BuddyGameScreenProps) {
  const [droplets, setDroplets] = useState<Droplet[]>([])
  const [buddyX, setBuddyX] = useState(GAME_WIDTH / 2) // Only horizontal movement
  const [score, setScore] = useState(0)
  const [missedDrops, setMissedDrops] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const lastSpawnTimeRef = useRef(0)
  const { playClickSound, playSuccessSound } = useSound()

  const isPremium = user?.subscription?.plan !== "free"

  const generateDropletColor = () => {
    const colors = [
      "hsl(200, 80%, 70%)", // Light blue
      "hsl(220, 70%, 60%)", // Medium blue
      "hsl(240, 60%, 50%)", // Darker blue
      "hsl(180, 70%, 65%)", // Cyan
      "hsl(260, 70%, 70%)", // Purple-ish
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const resetGame = useCallback(() => {
    setDroplets([])
    setScore(0)
    setMissedDrops(0)
    setGameOver(false)
    lastSpawnTimeRef.current = 0
    playClickSound()
  }, [playClickSound])

  // Game loop
  const animate = useCallback(
    (currentTime: DOMHighResTimeStamp) => {
      if (gameOver) return

      // Spawn new droplet
      if (currentTime - lastSpawnTimeRef.current > DROPLET_SPAWN_INTERVAL) {
        setDroplets((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            x: Math.random() * (GAME_WIDTH - DROPLET_RADIUS * 2) + DROPLET_RADIUS,
            y: -DROPLET_RADIUS, // Start above the screen
            radius: DROPLET_RADIUS,
            color: generateDropletColor(),
          },
        ])
        lastSpawnTimeRef.current = currentTime
      }

      setDroplets((prevDroplets) => {
        return prevDroplets
          .map((droplet) => {
            let { x, y } = droplet
            y += DROPLET_FALL_SPEED

            // Check for collision with buddy's basket
            const buddyBasketLeft = buddyX - BUDDY_BASKET_WIDTH / 2
            const buddyBasketRight = buddyX + BUDDY_BASKET_WIDTH / 2
            const buddyBasketTop = GAME_HEIGHT - BUDDY_BASKET_HEIGHT // Buddy is at the bottom

            const isColliding =
              y + droplet.radius > buddyBasketTop && // Droplet bottom is below basket top
              y - droplet.radius < GAME_HEIGHT && // Droplet top is above game bottom
              x + droplet.radius > buddyBasketLeft && // Droplet right is past basket left
              x - droplet.radius < buddyBasketRight // Droplet left is before basket right

            if (isColliding && droplet.y < buddyBasketTop) {
              // Only count as caught if it just entered the basket area
              setScore((s) => s + 1)
              playSuccessSound()
              return null // Remove droplet
            }

            // Check if droplet missed the basket and hit the bottom
            if (y + droplet.radius > GAME_HEIGHT) {
              setMissedDrops((m) => {
                const newMissed = m + 1
                if (newMissed >= MAX_MISSED_DROPS) {
                  setGameOver(true)
                }
                return newMissed
              })
              return null // Remove droplet
            }

            return { ...droplet, x, y }
          })
          .filter(Boolean) as Droplet[] // Filter out caught/missed droplets
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    },
    [buddyX, gameOver, playSuccessSound],
  )

  useEffect(() => {
    if (!gameOver) {
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [animate, gameOver])

  // Mouse/Touch movement for buddy (horizontal only)
  const handleMouseMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!gameAreaRef.current || gameOver) return

      const rect = gameAreaRef.current.getBoundingClientRect()
      let clientX

      if ("touches" in e) {
        clientX = e.touches[0].clientX
      } else {
        clientX = e.clientX
      }

      const newX = clientX - rect.left

      // Clamp buddy position within game area
      const clampedX = Math.max(BUDDY_BASKET_WIDTH / 2, Math.min(newX, GAME_WIDTH - BUDDY_BASKET_WIDTH / 2))
      setBuddyX(clampedX)
    },
    [gameOver],
  )

  const themeClasses =
    theme === "dark"
      ? "bg-gradient-to-br from-gray-800 via-blue-900 to-blue-800 text-white"
      : "bg-gradient-to-br from-white via-blue-50 to-blue-100 text-blue-900"

  const cardClasses =
    theme === "dark" ? "bg-gray-800/80 border-blue-700 text-white" : "bg-white border-blue-200 text-blue-900"

  return (
    <div className={`min-h-screen p-6 ${themeClasses}`}>
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            playClickSound()
            onBack()
          }}
          className={`${theme === "dark" ? "text-white" : "text-blue-600"}`}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold ml-4">Buddy Catch!</h1>
      </div>

      <Card className={`${cardClasses} shadow-lg mb-6`}>
        <CardContent className="p-4 flex justify-between items-center">
          <p className="text-lg font-semibold">Score: {score}</p>
          <p className="text-sm opacity-80">
            Missed: {missedDrops} / {MAX_MISSED_DROPS}
          </p>
        </CardContent>
      </Card>

      <div
        ref={gameAreaRef}
        className="relative border-2 border-blue-400 rounded-lg overflow-hidden mx-auto"
        style={{
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          backgroundColor: theme === "dark" ? "#1f2937" : "#e0f2fe", // Sky/water background
          cursor: gameOver ? "default" : "none", // Hide cursor during game
        }}
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
      >
        {/* Render falling droplets */}
        {droplets.map((droplet) => (
          <div
            key={droplet.id}
            className="absolute rounded-full"
            style={{
              width: droplet.radius * 2,
              height: droplet.radius * 2,
              background: `radial-gradient(circle at 30% 30%, white, ${droplet.color})`,
              boxShadow: `0 0 8px ${droplet.color}`,
              left: droplet.x - droplet.radius,
              top: droplet.y - droplet.radius,
            }}
          />
        ))}

        {/* Render buddy and its basket */}
        <div
          className="absolute bottom-0"
          style={{
            left: buddyX - (isPremium ? 24 : 20), // Adjust for buddy component width (medium size)
            transform: `translateX(-50%)`, // Center buddy based on its own width
          }}
        >
          {isPremium ? (
            <PremiumBuddy
              size="medium"
              expression="determined"
              activity="waving" // Waving arms for catching
              waterLevel={100}
              isDraggable={false}
            />
          ) : (
            <FunnyBuddy
              size="medium"
              expression="determined"
              activity="waving" // Waving arms for catching
              waterLevel={100}
              isDraggable={false}
            />
          )}
          {/* Buddy's Catching Basket */}
          <div
            className="absolute bg-blue-600/50 border-2 border-blue-700 rounded-b-full"
            style={{
              width: BUDDY_BASKET_WIDTH,
              height: BUDDY_BASKET_HEIGHT,
              left: "50%",
              bottom: -BUDDY_BASKET_HEIGHT / 2, // Position below buddy
              transform: "translateX(-50%)",
              zIndex: -1, // Behind buddy
            }}
          />
        </div>

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white z-20">
            <h2 className="text-4xl font-bold mb-4">Game Over!</h2>
            <p className="text-xl mb-6">Final Score: {score}</p>
            <Button
              onClick={resetGame}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl text-lg"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Play Again
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
