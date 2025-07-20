"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Crown, Star, ArrowLeft } from "lucide-react"
import { PremiumBuddy } from "@/components/premium-buddy"
import { useSound } from "@/hooks/use-sound"

interface UpgradeScreenProps {
  user: any
  onBack: () => void
  onUpgrade: (plan: string) => void
  theme: "light" | "dark"
}

export function UpgradeScreen({ user, onBack, onUpgrade, theme }: UpgradeScreenProps) {
  const { playClickSound } = useSound()

  const handleUpgrade = (plan: string, stripeLink: string) => {
    playClickSound()
    // Redirect to Stripe for payment
    window.location.href = stripeLink
    // In a real application, you would handle the subscription update
    // after a successful payment webhook from Stripe.
    // For this demo, we'll assume success after redirect.
    // The onUpgrade callback will be triggered by app/page.tsx after the redirect.
  }

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
          onClick={onBack}
          className={`${theme === "dark" ? "text-white" : "text-blue-600"}`}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold ml-4">Upgrade to Premium</h1>
      </div>

      <div className="flex justify-center mb-8">
        <PremiumBuddy size="large" expression="excited" activity="celebrating" waterLevel={100} isDraggable={false} />
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Upgrade to Premium</h1>
        <p className="opacity-80">Unlock all features and continue your hydration journey</p>
      </div>

      {/* Monthly Plan */}
      <Card className={`${cardClasses} mb-4 shadow-lg`}>
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <Crown className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="text-xl font-bold">Monthly Premium</h3>
            <div className="text-2xl font-bold text-blue-600 mt-2">
              $2.00<span className="text-lg">/month</span>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center">
              <Check className="h-5 w-5 mr-3 text-green-500" />
              <span>Unlimited water tracking</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 mr-3 text-green-500" />
              <span>Real-time weather integration</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 mr-3 text-green-500" />
              <span>Disease condition adjustments</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 mr-3 text-green-500" />
              <span>Profile editing capabilities</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 mr-3 text-green-500" />
              <span>Golden premium buddy</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 mr-3 text-green-500" />
              <span>Draggable buddy animations</span>
            </div>
          </div>

          <Button
            onClick={() => handleUpgrade("monthly", "https://buy.stripe.com/test_9B66ozduEd7lbcU2OO7EQ00")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl text-lg"
          >
            Choose Monthly Plan
          </Button>
        </CardContent>
      </Card>

      {/* Yearly Plan */}
      <Card className={`${cardClasses} mb-4 shadow-lg relative`}>
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">Save 37%</div>
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <h3 className="text-xl font-bold">Yearly Premium</h3>
            <div className="text-2xl font-bold text-blue-600 mt-2">
              $9.99<span className="text-lg">/year</span>
            </div>
            <p className="text-green-600 text-sm">Only $0.83/month</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center">
              <Check className="h-5 w-5 mr-3 text-green-500" />
              <span>Everything in Monthly</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 mr-3 text-green-500" />
              <span>Priority customer support</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 mr-3 text-green-500" />
              <span>Advanced analytics</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 mr-3 text-green-500" />
              <span>Export your data</span>
            </div>
          </div>

          <Button
            onClick={() => handleUpgrade("yearly", "https://buy.stripe.com/test_4gM7sDgGQ0kz0yg0GG7EQ03")}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 rounded-2xl text-lg"
          >
            Choose Yearly Plan
          </Button>
        </CardContent>
      </Card>

      {/* Lifetime Plan */}
      <Card className={`${cardClasses} mb-6 shadow-lg relative border-2 border-yellow-400`}>
        <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
          Best Value
        </div>
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center mb-2">
              <Crown className="h-8 w-8 text-yellow-500 mr-2" />
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
            <h3 className="text-xl font-bold">Lifetime Premium</h3>
            <div className="text-2xl font-bold text-yellow-600 mt-2">
              $200.00<span className="text-lg"> once</span>
            </div>
            <p className="text-yellow-600 text-sm">Never pay again!</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center">
              <Check className="h-5 w-5 mr-3 text-green-500" />
              <span>All Premium features forever</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 mr-3 text-green-500" />
              <span>Lifetime updates</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 mr-3 text-green-500" />
              <span>VIP support</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 mr-3 text-green-500" />
              <span>Exclusive lifetime badge</span>
            </div>
          </div>

          <Button
            onClick={() => handleUpgrade("lifetime", "https://buy.stripe.com/test_dRm14faisd7lbcU2OO7EQ02")}
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold py-4 rounded-2xl text-lg"
          >
            Choose Lifetime Plan
          </Button>
        </CardContent>
      </Card>

      <p className="text-sm opacity-70 text-center">Cancel anytime. No hidden fees. 30-day money-back guarantee.</p>
    </div>
  )
}
