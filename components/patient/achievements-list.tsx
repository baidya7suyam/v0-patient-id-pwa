"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Lock, Star } from "lucide-react"

interface Achievement {
  id: string
  title: string
  description: string
  points: number
  badge_icon: string
  category: string
  requirement_type: string
  requirement_value: number
  earned: boolean
  earned_at?: string
  progress?: number
}

export function AchievementsList() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadAchievements()
  }, [])

  const loadAchievements = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Get patient ID
      const { data: patient } = await supabase.from("patients").select("id").eq("user_id", user.id).single()
      if (!patient) return

      // Get all achievements with earned status
      const { data: allAchievements } = await supabase
        .from("achievements")
        .select("*")
        .order("points", { ascending: true })

      const { data: earnedAchievements } = await supabase
        .from("patient_achievements")
        .select("achievement_id, earned_at")
        .eq("patient_id", patient.id)

      // Calculate progress for each achievement
      const achievementsWithProgress = await Promise.all(
        (allAchievements || []).map(async (achievement) => {
          const earned = earnedAchievements?.find((ea) => ea.achievement_id === achievement.id)
          let progress = 0

          if (!earned) {
            // Calculate progress based on requirement type
            switch (achievement.requirement_type) {
              case "medication_streak":
                const { data: rewardsData } = await supabase
                  .from("patient_rewards")
                  .select("current_streak")
                  .eq("patient_id", patient.id)
                  .single()
                progress = Math.min((rewardsData?.current_streak || 0) / achievement.requirement_value, 1) * 100
                break

              case "total_points":
                const { data: pointsData } = await supabase
                  .from("patient_rewards")
                  .select("total_points")
                  .eq("patient_id", patient.id)
                  .single()
                progress = Math.min((pointsData?.total_points || 0) / achievement.requirement_value, 1) * 100
                break

              case "adherence_rate":
                // Calculate 30-day adherence rate
                const thirtyDaysAgo = new Date()
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

                const { data: logs } = await supabase
                  .from("medication_logs")
                  .select("taken")
                  .eq("patient_id", patient.id)
                  .gte("scheduled_time", thirtyDaysAgo.toISOString())

                const adherenceRate = logs?.length ? (logs.filter((log) => log.taken).length / logs.length) * 100 : 0

                progress = Math.min(adherenceRate / achievement.requirement_value, 1) * 100
                break

              default:
                progress = 0
            }
          }

          return {
            ...achievement,
            earned: !!earned,
            earned_at: earned?.earned_at,
            progress: earned ? 100 : progress,
          }
        }),
      )

      setAchievements(achievementsWithProgress)
    } catch (error) {
      console.error("Error loading achievements:", error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "medication":
        return "bg-blue-100 text-blue-800"
      case "streak":
        return "bg-green-100 text-green-800"
      case "milestone":
        return "bg-purple-100 text-purple-800"
      case "special":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const groupedAchievements = achievements.reduce(
    (groups, achievement) => {
      const category = achievement.category
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(achievement)
      return groups
    },
    {} as Record<string, Achievement[]>,
  )

  return (
    <div className="space-y-8">
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading achievements...</div>
      ) : (
        Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
          <div key={category}>
            <h3 className="text-xl font-semibold mb-4 capitalize">
              {category} Achievements ({categoryAchievements.filter((a) => a.earned).length}/
              {categoryAchievements.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryAchievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`hover:shadow-md transition-shadow ${
                    achievement.earned ? "border-green-200 bg-green-50" : ""
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="text-3xl">{achievement.badge_icon}</div>
                      <div className="flex items-center space-x-2">
                        {achievement.earned ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Lock className="h-5 w-5 text-gray-400" />
                        )}
                        <Badge className={getCategoryColor(achievement.category)} variant="secondary">
                          {achievement.category}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className={`text-lg ${achievement.earned ? "text-green-800" : ""}`}>
                      {achievement.title}
                    </CardTitle>
                    <CardDescription>{achievement.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Reward:</span>
                        <Badge variant="outline">
                          <Star className="h-3 w-3 mr-1" />
                          {achievement.points} points
                        </Badge>
                      </div>

                      {achievement.earned ? (
                        <div className="text-sm text-green-600">
                          <CheckCircle className="h-4 w-4 inline mr-1" />
                          Earned on {new Date(achievement.earned_at!).toLocaleDateString()}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress:</span>
                            <span>{Math.round(achievement.progress || 0)}%</span>
                          </div>
                          <Progress value={achievement.progress || 0} className="h-2" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
