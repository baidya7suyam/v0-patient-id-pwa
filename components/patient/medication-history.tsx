"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, CheckCircle, XCircle, Pill } from "lucide-react"

interface MedicationLog {
  id: string
  scheduled_time: string
  taken: boolean
  taken_at: string | null
  notes: string | null
  prescriptions: {
    medication_name: string
    dosage: string
  }
}

export function MedicationHistory() {
  const [history, setHistory] = useState<MedicationLog[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadMedicationHistory()
  }, [])

  const loadMedicationHistory = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Get patient ID
      const { data: patient } = await supabase.from("patients").select("id").eq("user_id", user.id).single()
      if (!patient) return

      // Get last 30 days of medication logs
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data, error } = await supabase
        .from("medication_logs")
        .select(`
          *,
          prescriptions (
            medication_name,
            dosage
          )
        `)
        .eq("patient_id", patient.id)
        .gte("scheduled_time", thirtyDaysAgo.toISOString())
        .order("scheduled_time", { ascending: false })
        .limit(50)

      if (error) throw error
      setHistory(data || [])
    } catch (error) {
      console.error("Error loading medication history:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const groupByDate = (logs: MedicationLog[]) => {
    const groups: { [key: string]: MedicationLog[] } = {}
    logs.forEach((log) => {
      const date = log.scheduled_time.split("T")[0]
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(log)
    })
    return groups
  }

  const groupedHistory = groupByDate(history)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medication History</CardTitle>
        <CardDescription>Your medication adherence over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading medication history...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No medication history available yet.</div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedHistory).map(([date, logs]) => (
              <div key={date}>
                <div className="flex items-center space-x-2 mb-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-lg">{formatDate(date)}</h3>
                  <Badge variant="outline">
                    {logs.filter((log) => log.taken).length} of {logs.length} taken
                  </Badge>
                </div>

                <div className="space-y-2 ml-6">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        {log.taken ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <p className="font-medium">{log.prescriptions.medication_name}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Pill className="h-3 w-3" />
                              <span>{log.prescriptions.dosage}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>Scheduled: {formatDateTime(log.scheduled_time)}</span>
                            </div>
                            {log.taken && log.taken_at && (
                              <div className="flex items-center space-x-1">
                                <CheckCircle className="h-3 w-3" />
                                <span>Taken: {formatDateTime(log.taken_at)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <Badge className={log.taken ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {log.taken ? "Taken" : "Missed"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
