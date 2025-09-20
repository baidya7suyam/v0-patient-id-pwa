"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QRCodeSVG } from "qrcode.react"

interface EmergencyCardProps {
  patient: any
  profile: any
}

export function EmergencyCard({ patient, profile }: EmergencyCardProps) {
  const emergencyData = {
    name: profile?.full_name,
    patientId: patient?.patient_id,
    bloodType: patient?.blood_type,
    allergies: patient?.allergies || [],
    medicalConditions: patient?.medical_conditions || [],
    emergencyContact: {
      name: patient?.emergency_contact_name,
      phone: patient?.emergency_contact_phone,
    },
    dob: patient?.date_of_birth,
  }

  return (
    <Card className="border-destructive bg-destructive/5">
      <CardHeader className="text-center">
        <CardTitle className="text-destructive flex items-center justify-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          EMERGENCY MEDICAL INFORMATION
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <QRCodeSVG
            value={JSON.stringify(emergencyData)}
            size={150}
            bgColor="transparent"
            fgColor="currentColor"
            className="mx-auto mb-4"
          />
          <p className="text-sm text-muted-foreground">Scan for emergency medical data</p>
        </div>

        <div className="space-y-3">
          <div>
            <p className="font-semibold text-destructive">Patient: {profile?.full_name}</p>
            <p className="text-sm">ID: {patient?.patient_id}</p>
          </div>

          {patient?.blood_type && (
            <div>
              <p className="font-medium">Blood Type</p>
              <Badge variant="destructive">{patient.blood_type}</Badge>
            </div>
          )}

          {patient?.allergies?.length > 0 && (
            <div>
              <p className="font-medium text-destructive">⚠️ ALLERGIES</p>
              <div className="flex flex-wrap gap-1">
                {patient.allergies.map((allergy: string, index: number) => (
                  <Badge key={index} variant="destructive">
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {patient?.medical_conditions?.length > 0 && (
            <div>
              <p className="font-medium">Medical Conditions</p>
              <div className="flex flex-wrap gap-1">
                {patient.medical_conditions.map((condition: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {patient?.emergency_contact_name && (
            <div>
              <p className="font-medium">Emergency Contact</p>
              <p className="text-sm">
                {patient.emergency_contact_name}
                {patient.emergency_contact_phone && ` - ${patient.emergency_contact_phone}`}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
