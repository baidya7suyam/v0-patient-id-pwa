"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface RewardsOverviewProps {
  rewards: any
}

export function RewardsOverview({ rewards }: RewardsOverviewProps) {
  const currentPoints = rewards?.points || 0
  const currentLevel = rewards?.level || 1
  const streakDays = rewards?.streak_days || 0
  const badges = rewards?.badges || []

  // Calculate progress to next level (100 points per level)
  const pointsForNextLevel = currentLevel * 100
  const progressPercentage = ((currentPoints % 100) / 100) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg className="w-5 h-5 text-chart-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
          </svg>
          Health Rewards
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Level and Points */}
        <div className="text-center">
          <div className="text-3xl font-bold text-primary mb-2">{currentPoints}</div>
          <p className="text-sm text-muted-foreground">Total Points</p>
          <Badge variant="secondary" className="mt-2">
            Level {currentLevel}
          </Badge>
        </div>

        {/* Progress to Next Level */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Progress to Level {currentLevel + 1}</span>
            <span>{currentPoints % 100}/100</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Streak */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-chart-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
              />
            </svg>
            <span className="font-medium">Streak</span>
          </div>
          <Badge variant="outline">{streakDays} days</Badge>
        </div>

        {/* Recent Badges */}
        {badges.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Recent Badges</h4>
            <div className="space-y-2">
              {badges.slice(0, 3).map((badge: any, index: number) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                  <div className="w-6 h-6 bg-chart-1 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
