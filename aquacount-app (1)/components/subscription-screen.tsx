"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Check, Crown } from "lucide-react"
import { WaterDropletBuddy } from "@/components/water-droplet-buddy"

interface SubscriptionScreenProps {
  user: any
  onBack: () => void
}

export function SubscriptionScreen({ user, onBack }: SubscriptionScreenProps) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly" | null>(null)

  const handleUpgrade = (plan: "monthly" | "yearly") => {
    // In a real app, this would integrate with payment processing
    alert(`Upgrading to ${plan} plan! This would integrate with payment processing.`)
  }

  const getDaysRemaining = () => {
    if (user.subscription.plan !== "free") return null
    const endDate = new Date(user.subscription.endDate)
    const now = new Date()
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  return (
    <div className="min-h-screen p-6 text-white">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-white">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold ml-4">Subscription</h1>
      </div>

      <div className="flex justify-center mb-8">
        <WaterDropletBuddy size="large" expression="excited" animate />
      </div>

      {/* Current Plan */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Crown className="h-5 w-5 mr-2" />
                Current Plan
              </h3>
              <p className="text-white/80 capitalize">{user.subscription.plan} Plan</p>
            </div>
            <div className="text-right">
              {user.subscription.plan === "free" && (
                <p className="text-yellow-300 font-semibold">{getDaysRemaining()} days left</p>
              )}
            </div>
          </div>

          {user.subscription.plan === "free" && (
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-300 text-sm">
                🎉 You're currently on a 7-day free trial. Upgrade to unlock premium features!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Premium Plans */}
      <div className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Choose Your Plan</h2>

        {/* Monthly Plan */}
        <Card
          className={`bg-white/10 backdrop-blur-sm border-white/20 cursor-pointer transition-all ${
            selectedPlan === "monthly" ? "ring-2 ring-white/50" : ""
          }`}
          onClick={() => setSelectedPlan("monthly")}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Monthly Premium</h3>
                <p className="text-white/80">Perfect for trying premium features</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">$2.00</p>
                <p className="text-white/60 text-sm">per month</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-white/80">
                <Check className="h-4 w-4 mr-2 text-green-400" />
                <span>Unlimited water logging</span>
              </div>
              <div className="flex items-center text-white/80">
                <Check className="h-4 w-4 mr-2 text-green-400" />
                <span>Advanced wellness tips</span>
              </div>
              <div className="flex items-center text-white/80">
                <Check className="h-4 w-4 mr-2 text-green-400" />
                <span>Export water history</span>
              </div>
              <div className="flex items-center text-white/80">
                <Check className="h-4 w-4 mr-2 text-green-400" />
                <span>Premium buddy animations</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Yearly Plan */}
        <Card
          className={`bg-white/10 backdrop-blur-sm border-white/20 cursor-pointer transition-all relative ${
            selectedPlan === "yearly" ? "ring-2 ring-white/50" : ""
          }`}
          onClick={() => setSelectedPlan("yearly")}
        >
          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            Save 58%
          </div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Yearly Premium</h3>
                <p className="text-white/80">Best value for committed users</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">$9.99</p>
                <p className="text-white/60 text-sm">per year</p>
                <p className="text-green-400 text-xs">Only $0.83/month</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-white/80">
                <Check className="h-4 w-4 mr-2 text-green-400" />
                <span>Everything in Monthly</span>
              </div>
              <div className="flex items-center text-white/80">
                <Check className="h-4 w-4 mr-2 text-green-400" />
                <span>Priority customer support</span>
              </div>
              <div className="flex items-center text-white/80">
                <Check className="h-4 w-4 mr-2 text-green-400" />
                <span>Exclusive buddy themes</span>
              </div>
              <div className="flex items-center text-white/80">
                <Check className="h-4 w-4 mr-2 text-green-400" />
                <span>Advanced analytics</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Button */}
      {selectedPlan && (
        <Button
          onClick={() => handleUpgrade(selectedPlan)}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-4 rounded-2xl text-lg"
        >
          Upgrade to {selectedPlan === "monthly" ? "Monthly" : "Yearly"} Premium
        </Button>
      )}

      <p className="text-white/60 text-xs text-center mt-4">
        Cancel anytime. No hidden fees. 30-day money-back guarantee.
      </p>
    </div>
  )
}
