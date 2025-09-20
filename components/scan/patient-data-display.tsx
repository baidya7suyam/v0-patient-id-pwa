"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

interface PatientDataDisplayProps {
  patient: any
}

export function PatientDataDisplay({ patient }: PatientDataDisplayProps) {
  const profile = patient.profile

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{profile?.full_name}</CardTitle>
              <CardDescription>Patient ID: {patient.patient_id}</CardDescription>
            </div>
            <Badge variant="default">Active Patient</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="font-medium">
                {patient.date_of_birth ? format(new Date(patient.date_of_birth), "MMMM d, yyyy") : "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gender</p>
              <p className="font-medium">{patient.gender || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Blood Type</p>
              <p className="font-medium">
                {patient.blood_type ? <Badge variant="destructive">{patient.blood_type}</Badge> : "Not specified"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Information */}
      {(patient.allergies?.length > 0 || patient.medical_conditions?.length > 0) && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              Emergency Medical Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {patient.allergies?.length > 0 && (
              <div>
                <p className="font-semibold text-destructive mb-2">⚠️ ALLERGIES</p>
                <div className="flex flex-wrap gap-2">
                  {patient.allergies.map((allergy: string, index: number) => (
                    <Badge key={index} variant="destructive">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {patient.medical_conditions?.length > 0 && (
              <div>
                <p className="font-semibold mb-2">Medical Conditions</p>
                <div className="flex flex-wrap gap-2">
                  {patient.medical_conditions.map((condition: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="font-medium">{profile?.phone || "Not specified"}</p>
          </div>
          <Separator />
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{profile?.email || "Not specified"}</p>
          </div>
          {patient.emergency_contact_name && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Emergency Contact</p>
                <p className="font-medium">
                  {patient.emergency_contact_name}
                  {patient.emergency_contact_phone && ` - ${patient.emergency_contact_phone}`}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button className="flex-1">View Medical Records</Button>
        <Button variant="outline" className="flex-1 bg-transparent">
          View Prescriptions
        </Button>
        <Button variant="destructive">Emergency Protocol</Button>
      </div>
    </div>
  )
}
