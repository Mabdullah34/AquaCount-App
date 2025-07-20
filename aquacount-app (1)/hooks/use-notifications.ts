"use client"

import { useState, useEffect, useCallback } from "react"

export function useNotifications(user: any, waterIntake: number, onUpdateUser: (user: any) => void) {
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [nextReminderTime, setNextReminderTime] = useState<Date | null>(null)
  const [reminderInterval, setReminderInterval] = useState<NodeJS.Timeout | null>(null)

  // Initialize notification state
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPermission(Notification.permission)
      const enabled = user?.notificationSettings?.enabled && Notification.permission === "granted"
      setNotificationsEnabled(enabled)
    }
  }, [user])

  // Set up notification intervals
  useEffect(() => {
    if (notificationsEnabled && user?.notificationSettings) {
      setupNotificationSchedule()
    } else {
      clearNotificationSchedule()
    }

    return () => clearNotificationSchedule()
  }, [notificationsEnabled, user?.notificationSettings])

  const requestPermission = async () => {
    if (typeof window === "undefined") return

    try {
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === "granted") {
        // Enable notifications and update user settings
        const updatedUser = {
          ...user,
          notificationSettings: {
            ...user?.notificationSettings,
            enabled: true,
          },
        }
        onUpdateUser(updatedUser)
        setNotificationsEnabled(true)

        // Show welcome notification
        showNotification("🎉 Notifications enabled!", "You'll now receive water intake reminders")
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error)
    }
  }

  const toggleNotifications = () => {
    const newEnabled = !notificationsEnabled
    setNotificationsEnabled(newEnabled)

    const updatedUser = {
      ...user,
      notificationSettings: {
        ...user?.notificationSettings,
        enabled: newEnabled,
      },
    }
    onUpdateUser(updatedUser)
  }

  const setupNotificationSchedule = useCallback(() => {
    if (!user?.notificationSettings) return

    const { frequency, startTime, endTime } = user.notificationSettings
    const frequencyMs = Number.parseInt(frequency) * 60 * 1000 // Convert minutes to milliseconds

    const scheduleNextNotification = () => {
      const now = new Date()
      const [startHour, startMinute] = startTime.split(":").map(Number)
      const [endHour, endMinute] = endTime.split(":").map(Number)

      const startToday = new Date(now)
      startToday.setHours(startHour, startMinute, 0, 0)

      const endToday = new Date(now)
      endToday.setHours(endHour, endMinute, 0, 0)

      // If current time is outside active hours, schedule for next active period
      if (now < startToday) {
        setNextReminderTime(startToday)
        const timeUntilStart = startToday.getTime() - now.getTime()
        setTimeout(() => {
          scheduleNextNotification()
        }, timeUntilStart)
        return
      }

      if (now > endToday) {
        // Schedule for tomorrow's start time
        const startTomorrow = new Date(startToday)
        startTomorrow.setDate(startTomorrow.getDate() + 1)
        setNextReminderTime(startTomorrow)
        const timeUntilTomorrow = startTomorrow.getTime() - now.getTime()
        setTimeout(() => {
          scheduleNextNotification()
        }, timeUntilTomorrow)
        return
      }

      // We're in active hours, schedule next reminder
      const nextReminder = new Date(now.getTime() + frequencyMs)

      // Don't schedule past end time
      if (nextReminder > endToday) {
        const startTomorrow = new Date(startToday)
        startTomorrow.setDate(startTomorrow.getDate() + 1)
        setNextReminderTime(startTomorrow)
        const timeUntilTomorrow = startTomorrow.getTime() - now.getTime()
        setTimeout(() => {
          scheduleNextNotification()
        }, timeUntilTomorrow)
        return
      }

      setNextReminderTime(nextReminder)

      const interval = setTimeout(() => {
        sendWaterReminder()
        scheduleNextNotification()
      }, frequencyMs)

      setReminderInterval(interval)
    }

    scheduleNextNotification()
  }, [user?.notificationSettings, waterIntake])

  const clearNotificationSchedule = () => {
    if (reminderInterval) {
      clearTimeout(reminderInterval)
      setReminderInterval(null)
    }
    setNextReminderTime(null)
  }

  const sendWaterReminder = () => {
    if (!notificationsEnabled || Notification.permission !== "granted") return

    const messages = [
      "Time to hydrate! 💧",
      "Your body needs water! 🌊",
      "Stay hydrated, stay healthy! 💪",
      "Water break time! 🥤",
      "Don't forget to drink water! 💙",
      "Hydration checkpoint! ✨",
      "Your water buddy reminds you to drink! 🐧",
      "Keep the good habit going! 🎯",
    ]

    const progressMessages = [
      `You've had ${waterIntake} glasses today. Keep it up!`,
      `Great progress! ${waterIntake} glasses down.`,
      `You're doing amazing! ${waterIntake} glasses so far.`,
    ]

    const useMotivational = user?.notificationSettings?.motivationalMessages !== false
    const messagePool = useMotivational ? [...messages, ...progressMessages] : progressMessages
    const randomMessage = messagePool[Math.floor(Math.random() * messagePool.length)]

    showNotification("AquaCount Reminder", randomMessage)
  }

  const showNotification = (title: string, body: string) => {
    if (Notification.permission !== "granted") return

    const notification = new Notification(title, {
      body,
      icon: "/favicon.ico", // You can add a custom icon
      badge: "/favicon.ico",
      tag: "water-reminder", // Prevents duplicate notifications
      requireInteraction: false,
      silent: !user?.notificationSettings?.sound,
    })

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close()
    }, 5000)

    // Handle notification click
    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  }

  return {
    permission,
    notificationsEnabled,
    nextReminderTime,
    requestPermission,
    toggleNotifications,
    showNotification,
  }
}
