"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"

interface FunnyBuddyProps {
  size?: "small" | "medium" | "large"
  expression?: "happy" | "sleepy" | "excited" | "wink" | "love" | "thirsty" | "confused" | "determined" | "sad"
  activity?: "idle" | "dancing" | "jumping" | "floating" | "celebrating" | "wiggling" | "spinning" | "waving"
  waterLevel?: number // 0-100 for filling effect
  isDraggable?: boolean // New prop for draggable
  onPositionChange?: (x: number, y: number) => void // New prop for draggable
  onClick?: () => void // New prop for click interaction (external)
  onBuddyClick?: () => void // New prop to notify parent of click (for sound)
}

export function FunnyBuddy({
  size = "medium",
  expression = "happy",
  activity = "idle",
  waterLevel = 50,
  isDraggable = false,
  onPositionChange,
  onClick,
  onBuddyClick,
}: FunnyBuddyProps) {
  // Internal states for temporary overrides (e.g., on click)
  const [clickActivityOverride, setClickActivityOverride] = useState<string | null>(null)
  const [clickExpressionOverride, setClickExpressionOverride] = useState<string | null>(null)
  const [eyeBlink, setEyeBlink] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 }) // For draggable
  const [isDragging, setIsDragging] = useState(false) // For draggable
  const buddyRef = useRef<HTMLDivElement>(null) // For draggable

  const sizeClasses = {
    small: "w-12 h-16",
    medium: "w-20 h-26",
    large: "w-32 h-40",
  }

  const expressionsMap = {
    happy: { eyes: "😊", mouth: "^_^" },
    sleepy: { eyes: "😴", mouth: "zzz" },
    excited: { eyes: "✨", mouth: "WOW!" },
    wink: { eyes: "😉", mouth: "~" },
    love: { eyes: "♥", mouth: "♥" },
    thirsty: { eyes: "🥺", mouth: "H2O?" },
    confused: { eyes: " perplexed", mouth: "?" },
    determined: { eyes: "💪", mouth: "!" },
    sad: { eyes: "😢", mouth: "o.o" },
  }

  // Random blinking
  useEffect(() => {
    const blinkInterval = setInterval(
      () => {
        setEyeBlink(true)
        setTimeout(() => setEyeBlink(false), 150)
      },
      3000 + Math.random() * 2000,
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
    if (fillPercentage > 80) return "from-blue-200 to-blue-400"
    if (fillPercentage > 50) return "from-blue-100 to-blue-300"
    if (fillPercentage > 20) return "from-blue-50 to-blue-200"
    return "from-gray-100 to-blue-100"
  }

  // Draggable logic
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
    setClickActivityOverride("jumping")
    setClickExpressionOverride("excited")

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
      {/* Celebration particles */}
      {currentActivity === "celebrating" && (
        <>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full animate-ping opacity-75"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${10 + Math.random() * 80}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </>
      )}

      {/* Main buddy body */}
      <div
        className={`w-full h-full bg-gradient-to-b ${getBuddyColor()} relative transition-all duration-500 border-2 border-blue-200 shadow-lg`}
        style={{
          borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
          transform: currentActivity === "dancing" ? "rotate(5deg)" : "rotate(0deg)",
        }}
      >
        {/* Water level indicator */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-400 to-blue-200 transition-all duration-1000"
          style={{
            height: `${waterLevel}%`,
            borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
          }}
        />

        {/* Shine effects */}
        <div className="absolute top-2 left-2 w-3 h-3 bg-white/70 rounded-full blur-sm animate-pulse"></div>
        <div className="absolute top-4 right-3 w-2 h-2 bg-blue-100/80 rounded-full blur-sm"></div>

        {/* Face */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          {/* Eyes with blinking */}
          <div className="flex space-x-2 mb-2">
            <div
              className={`w-3 h-3 bg-white rounded-full border border-blue-300 flex items-center justify-center transition-all duration-150 ${eyeBlink ? "h-1" : "h-3"}`}
            >
              {!eyeBlink && <div className="w-1 h-1 bg-blue-600 rounded-full"></div>}
            </div>
            <div
              className={`w-3 h-3 bg-white rounded-full border border-blue-300 flex items-center justify-center transition-all duration-150 ${eyeBlink ? "h-1" : "h-3"}`}
            >
              {!eyeBlink && <div className="w-1 h-1 bg-blue-600 rounded-full"></div>}
            </div>
          </div>

          {/* Mouth/Expression */}
          <div
            className={`text-xs font-bold text-blue-600 transition-all duration-300 ${currentActivity === "dancing" ? "animate-bounce" : ""}`}
          >
            {expressionsMap[currentExpression].mouth}
          </div>
        </div>

        {/* Funny arms with gestures */}
        <div
          className={`absolute -left-3 top-1/2 w-6 h-2 bg-blue-300 rounded-full transition-transform duration-500 border border-blue-400 ${
            currentActivity === "dancing"
              ? "rotate-45 scale-110"
              : currentActivity === "celebrating"
                ? "rotate-12"
                : "-rotate-45"
          }`}
        ></div>
        <div
          className={`absolute -right-3 top-1/2 w-6 h-2 bg-blue-300 rounded-full transition-transform duration-500 border border-blue-400 ${
            currentActivity === "dancing"
              ? "-rotate-45 scale-110"
              : currentActivity === "celebrating"
                ? "-rotate-12"
                : currentActivity === "waving"
                  ? "animate-wave"
                  : "rotate-45"
          }`}
        ></div>

        {/* Funny legs */}
        <div
          className={`absolute -bottom-2 left-1/3 w-2 h-4 bg-blue-300 rounded-full border border-blue-400 transition-transform duration-300 ${
            currentActivity === "jumping" ? "scale-y-75" : "scale-y-100"
          }`}
        ></div>
        <div
          className={`absolute -bottom-2 right-1/3 w-2 h-4 bg-blue-300 rounded-full border border-blue-400 transition-transform duration-300 ${
            currentActivity === "jumping" ? "scale-y-75" : "scale-y-100"
          }`}
        ></div>

        {/* Funny hat for celebrations */}
        {currentActivity === "celebrating" && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="w-6 h-4 bg-blue-500 rounded-t-full border-2 border-blue-600"></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full absolute -top-1 left-1/2 transform -translate-x-1/2"></div>
          </div>
        )}
      </div>

      {/* Floating drops */}
      <div className="absolute -top-6 left-4 animate-ping">
        <div className="w-2 h-2 bg-blue-300 rounded-full opacity-75"></div>
      </div>
      <div className="absolute -top-8 right-2 animate-ping delay-300">
        <div className="w-1 h-1 bg-blue-400 rounded-full opacity-75"></div>
      </div>

      {/* Speech bubble for special states */}
      {currentExpression === "thirsty" && (
        <div className="absolute -top-8 -right-6 bg-white border-2 border-blue-300 text-blue-600 text-xs px-2 py-1 rounded-lg animate-bounce shadow-lg">
          Drink up! 💧
        </div>
      )}
      {currentActivity === "celebrating" && (
        <div className="absolute -top-8 -right-6 bg-white border-2 border-blue-300 text-blue-600 text-xs px-2 py-1 rounded-lg animate-bounce shadow-lg">
          Awesome! 🎉
        </div>
      )}
      {currentExpression === "confused" && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white/90 text-blue-600 text-xs px-2 py-1 rounded-lg animate-pulse">
          🤔
        </div>
      )}
      {currentExpression === "sad" && (
        <div
          className="absolute top-1/2 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.5s" }}
        ></div>
      )}
    </div>
  )
}
