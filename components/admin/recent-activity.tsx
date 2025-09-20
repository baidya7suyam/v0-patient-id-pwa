"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, User, FileText, Calendar, Clock } from "lucide-react"

interface ActivityItem {
  id: string
  type: "patient_registered" | "appointment_scheduled" | "record_created" | "prescription_added"
  description: string
  created_at: string
  patient_name?: string
  staff_name?: string
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadRecentActivity()
  }, [])

  const loadRecentActivity = async () => {
    try {
      // This is a simplified version - in a real app, you'd have an activity log table
      // For now, we'll simulate recent activity from various tables
      const activities: ActivityItem[] = []

      // Get recent patients
      const { data: recentPatients } = await supabase
        .from("patients")
        .select("full_name, created_at")
        .order("created_at", { ascending: false })
        .limit(5)

      recentPatients?.forEach((patient) => {
        activities.push({
          id: `patient-${patient.full_name}`,
          type: "patient_registered",
          description: `New patient registered`,
          patient_name: patient.full_name,
          created_at: patient.created_at,
        })
      })

      // Get recent appointments
      const { data: recentAppointments } = await supabase
        .from("appointments")
        .select(`
          created_at,
          appointment_date,
          patients (full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(5)

      recentAppointments?.forEach((appointment) => {
        activities.push({
          id: `appointment-${appointment.created_at}`,
          type: "appointment_scheduled",
          description: `Appointment scheduled`,
          patient_name: appointment.patients.full_name,
          created_at: appointment.created_at,
        })
      })

      // Get recent medical records
      const { data: recentRecords } = await supabase
        .from("medical_records")
        .select(`
          created_at,
          patients (full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(5)

      recentRecords?.forEach((record) => {
        activities.push({
          id: `record-${record.created_at}`,
          type: "record_created",
          description: `Medical record created`,
          patient_name: record.patients.full_name,
          created_at: record.created_at,
        })
      })

      // Sort all activities by date
      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setActivities(activities.slice(0, 10))
    } catch (error) {
      console.error("Error loading recent activity:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`

    return date.toLocaleDateString()
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "patient_registered":
        return <User className="h-4 w-4" />
      case "appointment_scheduled":
        return <Calendar className="h-4 w-4" />
      case "record_created":
        return <FileText className="h-4 w-4" />
      case "prescription_added":
        return <Activity className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "patient_registered":
        return "bg-green-100 text-green-800"
      case "appointment_scheduled":
        return "bg-blue-100 text-blue-800"
      case "record_created":
        return "bg-purple-100 text-purple-800"
      case "prescription_added":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions and updates in the system</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading activity...</div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No recent activity to display.</div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg border">
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {activity.description}
                    {activity.patient_name && <span className="font-normal"> for {activity.patient_name}</span>}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{formatTimeAgo(activity.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
