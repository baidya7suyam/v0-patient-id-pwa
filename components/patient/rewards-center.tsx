"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PatientHeader } from "./patient-header"
import { AchievementsList } from "./achievements-list"
import { RewardsHistory } from "./rewards-history"
import { Trophy, Star, Target, Gift, TrendingUp, Award } from "lucide-react"

interface RewardsStats {
  totalPoints: number
  currentStreak: number
  longestStreak: number
  totalBadges: number
  adherenceRate: number
  level: number
  pointsToNextLevel: number
}

interface RecentAchievement {
  id: string
  title: string
  description: string
  points: number
  badge_icon: string
  earned_at: string
}

export function RewardsCenter() {
  const [stats, setStats] = useState<RewardsStats>({
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalBadges: 0,
    adherenceRate: 0,
    level: 1,
    pointsToNextLevel: 100,
  })
  const [recentAchievements, setRecentAchievements] = useState<RecentAchievement[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadRewardsData()
  }, [])

  const loadRewardsData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Get patient ID
      const { data: patient } = await supabase.from("patients").select("id").eq("user_id", user.id).single()
      if (!patient) return

      // Get rewards data
      const { data: rewardsData } = await supabase
        .from("patient_rewards")
        .select("*")
        .eq("patient_id", patient.id)
        .single()

      // Get recent achievements
      const { data: achievements } = await supabase
        .from("patient_achievements")
        .select(`
          *,
          achievements (
            title,
            description,
            points,
            badge_icon
          )
        `)
        .eq("patient_id", patient.id)
        .order("earned_at", { ascending: false })
        .limit(5)

      // Calculate adherence rate from medication logs
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: recentLogs } = await supabase
        .from("medication_logs")
        .select("taken")
        .eq("patient_id", patient.id)
        .gte("scheduled_time", sevenDaysAgo.toISOString())

      const adherenceRate = recentLogs?.length
        ? Math.round((recentLogs.filter((log) => log.taken).length / recentLogs.length) * 100)
        : 0

      // Calculate level and points to next level
      const totalPoints = rewardsData?.total_points || 0
      const level = Math.floor(totalPoints / 100) + 1
      const pointsToNextLevel = level * 100 - totalPoints

      setStats({
        totalPoints,
        currentStreak: rewardsData?.current_streak || 0,
        longestStreak: rewardsData?.longest_streak || 0,
        totalBadges: achievements?.length || 0,
        adherenceRate,
        level,
        pointsToNextLevel,
      })

      // Format recent achievements
      const formattedAchievements =
        achievements?.map((achievement) => ({
          id: achievement.id,
          title: achievement.achievements.title,
          description: achievement.achievements.description,
          points: achievement.achievements.points,
          badge_icon: achievement.achievements.badge_icon,
          earned_at: achievement.earned_at,
        })) || []

      setRecentAchievements(formattedAchievements)
    } catch (error) {
      console.error("Error loading rewards data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getLevelColor = (level: number) => {
    if (level >= 10) return "bg-purple-100 text-purple-800"
    if (level >= 5) return "bg-blue-100 text-blue-800"
    return "bg-green-100 text-green-800"
  }

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return "bg-purple-100 text-purple-800"
    if (streak >= 14) return "bg-blue-100 text-blue-800"
    if (streak >= 7) return "bg-green-100 text-green-800"
    return "bg-gray-100 text-gray-800"
  }

  return (
    <div className="min-h-screen bg-background">
      <PatientHeader />

      <main className="container mx-auto px-4 py-6">
        {/* Rewards Overview */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <Trophy className="h-8 w-8 text-yellow-600" />
            <div>
              <h1 className="text-3xl font-bold">Rewards Center</h1>
              <p className="text-muted-foreground">Track your progress and earn rewards for healthy habits</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                <Star className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : stats.totalPoints.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Lifetime earned</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Level</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <Badge className={getLevelColor(stats.level)} variant="secondary">
                    Level {loading ? "..." : stats.level}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? "..." : stats.pointsToNextLevel} points to next level
                </p>
                {!loading && (
                  <Progress
                    value={((stats.level * 100 - stats.pointsToNextLevel) / (stats.level * 100)) * 100}
                    className="mt-2"
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                <Target className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <Badge className={getStreakColor(stats.currentStreak)} variant="secondary">
                    {loading ? "..." : stats.currentStreak} days
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Best: {loading ? "..." : stats.longestStreak} days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
                <Award className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : stats.totalBadges}</div>
                <p className="text-xs text-muted-foreground">
                  {loading ? "..." : stats.adherenceRate}% adherence this week
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Achievements */}
          {recentAchievements.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gift className="h-5 w-5 text-yellow-600" />
                  <span>Recent Achievements</span>
                </CardTitle>
                <CardDescription>Your latest accomplishments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentAchievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-4 p-3 rounded-lg border">
                      <div className="text-2xl">{achievement.badge_icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Earned {new Date(achievement.earned_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary">+{achievement.points} pts</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Rewards Tabs */}
        <Tabs defaultValue="achievements" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="achievements">All Achievements</TabsTrigger>
            <TabsTrigger value="history">Points History</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="space-y-6">
            <AchievementsList />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <RewardsHistory />
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Community Leaderboard</CardTitle>
                <CardDescription>See how you rank among other patients (anonymous)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">Leaderboard feature coming soon</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
