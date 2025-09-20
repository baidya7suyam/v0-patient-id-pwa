"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Plus, Phone, Mail, Calendar } from "lucide-react"
import Link from "next/link"

interface Patient {
  id: string
  patient_id: string
  full_name: string
  date_of_birth: string
  phone: string
  email: string
  emergency_contact_name: string
  emergency_contact_phone: string
  blood_type: string
  allergies: string[]
  created_at: string
}

export function PatientSearch() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadPatients()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      searchPatients()
    } else {
      loadPatients()
    }
  }, [searchTerm])

  const loadPatients = async () => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) throw error
      setPatients(data || [])
    } catch (error) {
      console.error("Error loading patients:", error)
    } finally {
      setLoading(false)
    }
  }

  const searchPatients = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .or(`full_name.ilike.%${searchTerm}%,patient_id.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) throw error
      setPatients(data || [])
    } catch (error) {
      console.error("Error searching patients:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Patient Management</CardTitle>
              <CardDescription>Search and manage patient records</CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, patient ID, or phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading patients...</div>
          ) : patients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No patients found matching your search." : "No patients registered yet."}
            </div>
          ) : (
            <div className="space-y-4">
              {patients.map((patient) => (
                <Card key={patient.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg">{patient.full_name}</h3>
                          <Badge variant="outline">ID: {patient.patient_id}</Badge>
                          {patient.blood_type && <Badge variant="secondary">{patient.blood_type}</Badge>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Age: {calculateAge(patient.date_of_birth)} ({formatDate(patient.date_of_birth)})
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4" />
                            <span>{patient.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>{patient.email}</span>
                          </div>
                        </div>

                        {patient.allergies && patient.allergies.length > 0 && (
                          <div className="mt-2">
                            <span className="text-sm font-medium text-red-600">Allergies: </span>
                            <span className="text-sm text-red-600">{patient.allergies.join(", ")}</span>
                          </div>
                        )}

                        {patient.emergency_contact_name && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            <span className="font-medium">Emergency Contact: </span>
                            {patient.emergency_contact_name} ({patient.emergency_contact_phone})
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/patients/${patient.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
