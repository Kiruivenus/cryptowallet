"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Gift, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

const promos = [
  {
    id: 1,
    icon: Gift,
    title: "First Deposit Bonus",
    description: "Get 30% extra USDC on your first deposit above $10!",
    gradient: "from-primary/20 to-accent/20",
    link: "/instructions/first-deposit",
  },
  {
    id: 2,
    icon: DollarSign,
    title: "Referral Rewards",
    description: "Earn $2 USDC reward every time your referral deposits over $10!",
    gradient: "from-accent/20 to-success/20",
    link: "/referrals",
  },
]

export function PromoBanner() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promos.length)
    }, 20000)

    return () => clearInterval(interval)
  }, [])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + promos.length) % promos.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % promos.length)
  }

  const handlePromoClick = () => {
    router.push(promos[currentIndex].link)
  }

  const currentPromo = promos[currentIndex]
  const Icon = currentPromo.icon

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-r p-[1px]">
      <div className={cn("relative overflow-hidden rounded-2xl bg-gradient-to-r p-4", currentPromo.gradient)}>
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrev}
            className="flex-shrink-0 rounded-full bg-black/30 p-2 backdrop-blur-sm transition-all hover:bg-black/50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            onClick={handlePromoClick}
            className="flex flex-1 items-center gap-3 text-left transition-transform hover:scale-[1.02]"
          >
            <div className="flex-shrink-0 rounded-full bg-black/30 p-3 backdrop-blur-sm">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">{currentPromo.title}</h3>
              <p className="text-xs text-muted-foreground">{currentPromo.description}</p>
            </div>
          </button>

          <button
            onClick={handleNext}
            className="flex-shrink-0 rounded-full bg-black/30 p-2 backdrop-blur-sm transition-all hover:bg-black/50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex justify-center gap-1.5">
          {promos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === currentIndex ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
