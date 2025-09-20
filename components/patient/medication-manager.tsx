"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PatientHeader } from "./patient-header"
import { MedicationList } from "./medication-list"
import { MedicationSchedule } from "./medication-schedule"
import { MedicationHistory } from "./medication-history"
import { Pill, Clock, Calendar, CheckCircle } from "lucide-react"

interface MedicationStats {
  totalMedications: number
  todayDoses: number
  completedToday: number
  adherenceRate: number
}

export function MedicationManager() {
  const [stats, setStats] = useState<MedicationStats>({
    totalMedications: 0,
    todayDoses: 0,
    completedToday: 0,
    adherenceRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadMedicationStats()
  }, [])

  const loadMedicationStats = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Get patient ID
      const { data: patient } = await supabase.from("patients").select("id").eq("user_id", user.id).single()
      if (!patient) return

      // Get total active medications
      const { count: totalMeds } = await supabase
        .from("prescriptions")
        .select("*", { count: "exact", head: true })
        .eq("patient_id", patient.id)
        .eq("status", "active")

      // Get today's medication logs
      const today = new Date().toISOString().split("T")[0]
      const { data: todayLogs } = await supabase
        .from("medication_logs")
        .select("*")
        .eq("patient_id", patient.id)
        .gte("scheduled_time", today)
        .lt("scheduled_time", `${today}T23:59:59`)

      const todayDoses = todayLogs?.length || 0
      const completedToday = todayLogs?.filter((log) => log.taken).length || 0
      const adherenceRate = todayDoses > 0 ? Math.round((completedToday / todayDoses) * 100) : 0

      setStats({
        totalMedications: totalMeds || 0,
        todayDoses,
        completedToday,
        adherenceRate,
      })
    } catch (error) {
      console.error("Error loading medication stats:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <PatientHeader />

      <main className="container mx-auto px-4 py-6">
        {/* Medication Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Medications</CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.totalMedications}</div>
              <p className="text-xs text-muted-foreground">Currently prescribed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Doses</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.todayDoses}</div>
              <p className="text-xs text-muted-foreground">Scheduled for today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.completedToday}</div>
              <p className="text-xs text-muted-foreground">Doses taken</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Adherence Rate</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : `${stats.adherenceRate}%`}</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
        </div>

        {/* Medication Management Tabs */}
        <Tabs defaultValue="schedule" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="schedule">Today's Schedule</TabsTrigger>
            <TabsTrigger value="medications">My Medications</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-6">
            <MedicationSchedule onStatsUpdate={loadMedicationStats} />
          </TabsContent>

          <TabsContent value="medications" className="space-y-6">
            <MedicationList />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <MedicationHistory />
          </TabsContent>

          <TabsContent value="reminders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reminder Settings</CardTitle>
                <CardDescription>Configure how you want to be reminded about your medications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">Reminder settings interface coming soon</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
