"use client"

import { useEffect, useState } from "react"

interface WaterDropletBuddyProps {
  size?: "small" | "medium" | "large"
  animate?: boolean
  expression?: "happy" | "sleepy" | "excited"
}

export function WaterDropletBuddy({ size = "medium", animate = false, expression = "happy" }: WaterDropletBuddyProps) {
  const [bounce, setBounce] = useState(false)

  useEffect(() => {
    if (animate) {
      const interval = setInterval(() => {
        setBounce(true)
        setTimeout(() => setBounce(false), 600)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [animate])

  const sizeClasses = {
    small: "w-16 h-20",
    medium: "w-24 h-30",
    large: "w-32 h-40",
  }

  const eyeExpressions = {
    happy: "😊",
    sleepy: "😴",
    excited: "🤩",
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${bounce ? "animate-bounce" : ""}`}>
      {/* Water droplet body */}
      <div
        className="w-full h-full bg-gradient-to-b from-blue-300 to-blue-500 rounded-full relative"
        style={{
          borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
          transform: "rotate(0deg)",
        }}
      >
        {/* Shine effect */}
        <div className="absolute top-2 left-2 w-4 h-4 bg-white/40 rounded-full blur-sm"></div>

        {/* Face */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Eyes */}
          <div className="flex space-x-2 mb-1">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>

          {/* Expression */}
          <div className="text-xs">
            {expression === "happy" && "😊"}
            {expression === "sleepy" && "😴"}
            {expression === "excited" && "🤩"}
          </div>
        </div>

        {/* Arms */}
        <div className="absolute -left-2 top-1/2 w-4 h-1 bg-blue-400 rounded-full transform -rotate-45"></div>
        <div className="absolute -right-2 top-1/2 w-4 h-1 bg-blue-400 rounded-full transform rotate-45"></div>

        {/* Legs */}
        <div className="absolute -bottom-1 left-1/3 w-1 h-3 bg-blue-400 rounded-full"></div>
        <div className="absolute -bottom-1 right-1/3 w-1 h-3 bg-blue-400 rounded-full"></div>
      </div>

      {/* Floating water drops */}
      {animate && (
        <>
          <div className="absolute -top-8 left-4 animate-ping">
            <div className="w-2 h-2 bg-blue-300 rounded-full opacity-75"></div>
          </div>
          <div className="absolute -top-6 right-2 animate-ping delay-300">
            <div className="w-1 h-1 bg-blue-400 rounded-full opacity-75"></div>
          </div>
        </>
      )}
    </div>
  )
}
