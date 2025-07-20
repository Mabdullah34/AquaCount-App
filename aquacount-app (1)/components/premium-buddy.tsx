"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"

interface PremiumBuddyProps {
  size?: "small" | "medium" | "large"
  expression?: "happy" | "sleepy" | "excited" | "wink" | "love" | "thirsty" | "confused" | "determined" | "sad"
  activity?: "idle" | "dancing" | "jumping" | "floating" | "celebrating" | "wiggling" | "flying" | "spinning" | "waving"
  waterLevel?: number
  isDraggable?: boolean
  onPositionChange?: (x: number, y: number) => void
  onClick?: () => void // New prop for click interaction (external)
  onBuddyClick?: () => void // New prop to notify parent of click (for sound)
}

export function PremiumBuddy({
  size = "medium",
  expression = "happy",
  activity = "idle",
  waterLevel = 50,
  isDraggable = true,
  onPositionChange,
  onClick,
  onBuddyClick,
}: PremiumBuddyProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  // Internal states for temporary overrides (e.g., on click)
  const [clickActivityOverride, setClickActivityOverride] = useState<string | null>(null)
  const [clickExpressionOverride, setClickExpressionOverride] = useState<string | null>(null)
  const [eyeBlink, setEyeBlink] = useState(false)
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])
  const buddyRef = useRef<HTMLDivElement>(null) // For draggable

  const sizeClasses = {
    small: "w-16 h-20",
    medium: "w-24 h-30",
    large: "w-32 h-40",
  }

  const expressionsMap = {
    happy: "✨",
    sleepy: "😴",
    excited: "🌟",
    wink: "😉",
    love: "💛",
    thirsty: "💧",
    confused: "🌀",
    determined: "🚀",
    sad: "💔",
  }

  // Generate golden sparkles
  useEffect(() => {
    const newSparkles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 120,
      y: Math.random() * 120,
      delay: Math.random() * 3,
    }))
    setSparkles(newSparkles)

    const interval = setInterval(() => {
      setSparkles((prev) =>
        prev.map((sparkle) => ({
          ...sparkle,
          x: Math.random() * 120,
          y: Math.random() * 120,
          delay: Math.random() * 3,
        })),
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Random blinking
  useEffect(() => {
    const blinkInterval = setInterval(
      () => {
        setEyeBlink(true)
        setTimeout(() => setEyeBlink(false), 150)
      },
      2000 + Math.random() * 2000,
    )
    return () => clearInterval(blinkInterval)
  }, [])

  // Determine the current activity and expression, prioritizing click overrides
  const currentActivity = clickActivityOverride || activity
  const currentExpression = clickExpressionOverride || expression

  const getAnimationClass = () => {
    if (!currentActivity) return "" // No animation if activity is null
    switch (currentActivity) {
      case "dancing":
        return "animate-bounce"
      case "jumping":
        return "animate-bounce"
      case "floating":
        return "animate-float"
      case "celebrating":
        return "animate-bounce"
      case "wiggling":
        return "animate-wiggle"
      case "flying":
        return "animate-pulse"
      case "spinning":
        return "animate-spin-slow"
      case "waving":
        return "animate-float" // Main body still floats, arms will wave
      default:
        return "animate-float"
    }
  }

  const getBuddyColor = () => {
    const fillPercentage = Math.min(waterLevel, 100)
    // Golden gradient for premium
    if (fillPercentage > 80) return "from-yellow-200 to-yellow-400"
    if (fillPercentage > 50) return "from-yellow-100 to-yellow-300"
    if (fillPercentage > 20) return "from-yellow-50 to-yellow-200"
    return "from-gray-100 to-yellow-100"
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDraggable || !buddyRef.current) return
    setIsDragging(true)
    const rect = buddyRef.current.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - offsetX
      const newY = e.clientY - offsetY
      setPosition({ x: newX, y: newY })
      onPositionChange?.(newX, newY)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  // Click interaction
  const handleClick = () => {
    if (onClick) onClick() // Call external click handler if provided
    if (onBuddyClick) onBuddyClick() // Notify parent for sound/other effects

    // Trigger a temporary animation/expression
    setClickActivityOverride("flying")
    setClickExpressionOverride("love")

    setTimeout(() => {
      setClickActivityOverride(null) // Revert temporary override
      setClickExpressionOverride(null) // Revert temporary override
    }, 800) // Animation duration
  }

  return (
    <div
      ref={buddyRef}
      className={`relative ${sizeClasses[size]} ${getAnimationClass()} ${isDraggable ? "cursor-grab" : ""} transition-all duration-300`}
      style={{
        transform: isDraggable ? `translate(${position.x}px, ${position.y}px)` : undefined,
        zIndex: isDragging ? 50 : 10,
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      {/* Golden sparkles for premium */}
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping opacity-75"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            animationDelay: `${sparkle.delay}s`,
          }}
        />
      ))}

      {/* Premium golden aura */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 to-yellow-500/20 rounded-full blur-lg animate-pulse"></div>

      {/* Main buddy body with golden theme */}
      <div
        className={`w-full h-full bg-gradient-to-b ${getBuddyColor()} relative transition-all duration-500 border-2 border-yellow-300 shadow-lg shadow-yellow-200/50`}
        style={{
          borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
          transform: currentActivity === "dancing" ? "rotate(5deg)" : "rotate(0deg)",
        }}
      >
        {/* Water level indicator with golden tint */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-yellow-400 to-yellow-200 transition-all duration-1000"
          style={{
            height: `${waterLevel}%`,
            borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
          }}
        />

        {/* Enhanced shine effects */}
        <div className="absolute top-2 left-2 w-4 h-4 bg-white/80 rounded-full blur-sm animate-pulse"></div>
        <div className="absolute top-4 right-3 w-2 h-2 bg-yellow-200/80 rounded-full blur-sm"></div>
        <div className="absolute top-6 left-4 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>

        {/* Premium crown */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-t-lg border border-yellow-500"></div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-300 rounded-full"></div>
          <div className="absolute top-1 left-0 w-1 h-1 bg-yellow-500 rounded-full"></div>
          <div className="absolute top-1 right-0 w-1 h-1 bg-yellow-500 rounded-full"></div>
        </div>

        {/* Face with premium expressions */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          {/* Enhanced eyes with golden pupils */}
          <div className="flex space-x-2 mb-2">
            <div
              className={`w-4 h-4 bg-white rounded-full border-2 border-yellow-400 flex items-center justify-center transition-all duration-150 ${eyeBlink ? "h-1" : "h-4"}`}
            >
              {!eyeBlink && <div className="w-2 h-2 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full"></div>}
            </div>
            <div
              className={`w-4 h-4 bg-white rounded-full border-2 border-yellow-400 flex items-center justify-center transition-all duration-150 ${eyeBlink ? "h-1" : "h-4"}`}
            >
              {!eyeBlink && <div className="w-2 h-2 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full"></div>}
            </div>
          </div>

          {/* Premium mouth expressions */}
          <div className="text-sm font-bold text-yellow-700 transition-all duration-300">
            {expressionsMap[currentExpression]}
          </div>
        </div>

        {/* Premium animated arms with golden color */}
        <div
          className={`absolute -left-3 top-1/2 w-6 h-2 bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-full transition-transform duration-500 border border-yellow-500 ${
            currentActivity === "dancing"
              ? "rotate-45 scale-110"
              : currentActivity === "flying"
                ? "rotate-12"
                : "-rotate-45"
          }`}
        ></div>
        <div
          className={`absolute -right-3 top-1/2 w-6 h-2 bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-full transition-transform duration-500 border border-yellow-500 ${
            currentActivity === "dancing"
              ? "-rotate-45 scale-110"
              : currentActivity === "flying"
                ? "-rotate-12"
                : currentActivity === "waving"
                  ? "animate-wave"
                  : "rotate-45"
          }`}
        ></div>

        {/* Premium legs */}
        <div className="absolute -bottom-2 left-1/3 w-2 h-4 bg-gradient-to-b from-yellow-300 to-yellow-400 rounded-full border border-yellow-500"></div>
        <div className="absolute -bottom-2 right-1/3 w-2 h-4 bg-gradient-to-b from-yellow-300 to-yellow-400 rounded-full border border-yellow-500"></div>
      </div>

      {/* Premium floating elements */}
      <div className="absolute -top-6 left-4 animate-ping">
        <div className="w-2 h-2 bg-yellow-400 rounded-full opacity-75"></div>
      </div>
      <div className="absolute -top-8 right-2 animate-ping delay-300">
        <div className="w-1 h-1 bg-yellow-500 rounded-full opacity-75"></div>
      </div>

      {/* Premium speech bubble */}
      {currentActivity === "celebrating" && (
        <div className="absolute -top-10 -right-8 bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400 text-yellow-800 text-xs px-3 py-2 rounded-lg animate-bounce shadow-lg">
          Premium! ✨
        </div>
      )}
      {currentExpression === "confused" && (
        <div className="absolute -top-10 -right-8 bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400 text-yellow-800 text-xs px-3 py-2 rounded-lg animate-bounce shadow-lg">
          ❓
        </div>
      )}
      {currentExpression === "sad" && (
        <div
          className="absolute top-1/2 left-1/4 w-3 h-3 bg-yellow-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.5s" }}
        ></div>
      )}
    </div>
  )
}
