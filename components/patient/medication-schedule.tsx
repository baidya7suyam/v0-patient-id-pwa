"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Clock, Pill, CheckCircle, AlertCircle, Calendar } from "lucide-react"

interface MedicationDose {
  id: string
  scheduled_time: string
  taken: boolean
  taken_at: string | null
  notes: string | null
  prescriptions: {
    medication_name: string
    dosage: string
    instructions: string
  }
}

interface MedicationScheduleProps {
  onStatsUpdate: () => void
}

export function MedicationSchedule({ onStatsUpdate }: MedicationScheduleProps) {
  const [todayDoses, setTodayDoses] = useState<MedicationDose[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadTodaySchedule()
  }, [])

  const loadTodaySchedule = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Get patient ID
      const { data: patient } = await supabase.from("patients").select("id").eq("user_id", user.id).single()
      if (!patient) return

      const today = new Date().toISOString().split("T")[0]
      const { data, error } = await supabase
        .from("medication_logs")
        .select(`
          *,
          prescriptions (
            medication_name,
            dosage,
            instructions
          )
        `)
        .eq("patient_id", patient.id)
        .gte("scheduled_time", today)
        .lt("scheduled_time", `${today}T23:59:59`)
        .order("scheduled_time", { ascending: true })

      if (error) throw error
      setTodayDoses(data || [])
    } catch (error) {
      console.error("Error loading today's schedule:", error)
    } finally {
      setLoading(false)
    }
  }

  const markDoseTaken = async (doseId: string, taken: boolean) => {
    try {
      const updateData = {
        taken,
        taken_at: taken ? new Date().toISOString() : null,
      }

      const { error } = await supabase.from("medication_logs").update(updateData).eq("id", doseId)

      if (error) throw error

      // Refresh the schedule and stats
      loadTodaySchedule()
      onStatsUpdate()
    } catch (error) {
      console.error("Error updating dose:", error)
    }
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const isOverdue = (scheduledTime: string, taken: boolean) => {
    if (taken) return false
    const now = new Date()
    const scheduled = new Date(scheduledTime)
    return now > scheduled
  }

  const getStatusColor = (dose: MedicationDose) => {
    if (dose.taken) return "bg-green-100 text-green-800"
    if (isOverdue(dose.scheduled_time, dose.taken)) return "bg-red-100 text-red-800"
    return "bg-yellow-100 text-yellow-800"
  }

  const getStatusText = (dose: MedicationDose) => {
    if (dose.taken) return "Taken"
    if (isOverdue(dose.scheduled_time, dose.taken)) return "Overdue"
    return "Pending"
  }

  const getStatusIcon = (dose: MedicationDose) => {
    if (dose.taken) return <CheckCircle className="h-4 w-4" />
    if (isOverdue(dose.scheduled_time, dose.taken)) return <AlertCircle className="h-4 w-4" />
    return <Clock className="h-4 w-4" />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Today's Medication Schedule</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {todayDoses.filter((d) => d.taken).length} of {todayDoses.length} completed
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading today's schedule...</div>
        ) : todayDoses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No medications scheduled for today. Great job staying healthy!
          </div>
        ) : (
          <div className="space-y-4">
            {todayDoses.map((dose) => (
              <Card key={dose.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Checkbox
                        checked={dose.taken}
                        onCheckedChange={(checked) => markDoseTaken(dose.id, checked as boolean)}
                        className="h-5 w-5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg">{dose.prescriptions.medication_name}</h3>
                          <Badge className={getStatusColor(dose)} variant="secondary">
                            {getStatusIcon(dose)}
                            <span className="ml-1">{getStatusText(dose)}</span>
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(dose.scheduled_time)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Pill className="h-4 w-4" />
                            <span>{dose.prescriptions.dosage}</span>
                          </div>
                        </div>

                        {dose.prescriptions.instructions && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Instructions: </span>
                            {dose.prescriptions.instructions}
                          </p>
                        )}

                        {dose.taken && dose.taken_at && (
                          <p className="text-sm text-green-600 mt-2">
                            <CheckCircle className="h-4 w-4 inline mr-1" />
                            Taken at {formatTime(dose.taken_at)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {!dose.taken && (
                        <Button size="sm" onClick={() => markDoseTaken(dose.id, true)}>
                          Mark as Taken
                        </Button>
                      )}
                      {dose.taken && (
                        <Button variant="outline" size="sm" onClick={() => markDoseTaken(dose.id, false)}>
                          Undo
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
