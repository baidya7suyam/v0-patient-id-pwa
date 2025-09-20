"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pill, Calendar, Clock, User, AlertTriangle } from "lucide-react"

interface Prescription {
  id: string
  medication_name: string
  dosage: string
  frequency: string
  instructions: string
  start_date: string
  end_date: string | null
  status: string
  prescribed_by: string
  side_effects: string | null
  created_at: string
}

export function MedicationList() {
  const [medications, setMedications] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadMedications()
  }, [])

  const loadMedications = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Get patient ID
      const { data: patient } = await supabase.from("patients").select("id").eq("user_id", user.id).single()
      if (!patient) return

      const { data, error } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("patient_id", patient.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setMedications(data || [])
    } catch (error) {
      console.error("Error loading medications:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "discontinued":
        return "bg-red-100 text-red-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isExpiringSoon = (endDate: string | null) => {
    if (!endDate) return false
    const end = new Date(endDate)
    const now = new Date()
    const daysUntilEnd = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilEnd <= 7 && daysUntilEnd > 0
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Medications</CardTitle>
        <CardDescription>All your current and past prescriptions</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading medications...</div>
        ) : medications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No medications prescribed yet.</div>
        ) : (
          <div className="space-y-4">
            {medications.map((medication) => (
              <Card key={medication.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{medication.medication_name}</h3>
                        <Badge className={getStatusColor(medication.status)} variant="secondary">
                          {medication.status.charAt(0).toUpperCase() + medication.status.slice(1)}
                        </Badge>
                        {medication.end_date && isExpiringSoon(medication.end_date) && (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Expiring Soon
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center space-x-2">
                          <Pill className="h-4 w-4" />
                          <span>
                            <span className="font-medium">Dosage:</span> {medication.dosage}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            <span className="font-medium">Frequency:</span> {medication.frequency}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            <span className="font-medium">Started:</span> {formatDate(medication.start_date)}
                          </span>
                        </div>
                        {medication.end_date && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              <span className="font-medium">Ends:</span> {formatDate(medication.end_date)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>
                            <span className="font-medium">Prescribed by:</span> {medication.prescribed_by}
                          </span>
                        </div>
                      </div>

                      {medication.instructions && (
                        <div className="mb-3">
                          <p className="text-sm">
                            <span className="font-medium text-foreground">Instructions: </span>
                            <span className="text-muted-foreground">{medication.instructions}</span>
                          </p>
                        </div>
                      )}

                      {medication.side_effects && (
                        <div className="mb-3">
                          <p className="text-sm">
                            <span className="font-medium text-orange-600">Possible Side Effects: </span>
                            <span className="text-orange-600">{medication.side_effects}</span>
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {medication.status === "active" && (
                        <Button variant="outline" size="sm">
                          Set Reminder
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
