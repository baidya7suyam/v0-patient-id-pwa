"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { QRCodeSVG } from "qrcode.react"
import { useState } from "react"

interface DigitalIDCardProps {
  patient: any
  profile: any
}

export function DigitalIDCard({ patient, profile }: DigitalIDCardProps) {
  const [showQR, setShowQR] = useState(false)

  const cardData = {
    patientId: patient?.patient_id,
    name: profile?.full_name,
    dob: patient?.date_of_birth,
    bloodType: patient?.blood_type,
    emergencyContact: patient?.emergency_contact_phone,
    allergies: patient?.allergies,
    nfcId: patient?.nfc_id,
  }

  return (
    <div className="space-y-4">
      {/* Main ID Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground">
        <CardContent className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold mb-1">MediCard</h3>
              <p className="text-primary-foreground/80">Digital Patient ID</p>
            </div>
            <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
              Active
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-primary-foreground/80 text-sm">Patient Name</p>
              <p className="text-xl font-semibold">{profile?.full_name || "Not specified"}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-primary-foreground/80 text-sm">Patient ID</p>
                <p className="font-mono font-medium">{patient?.patient_id || "Not assigned"}</p>
              </div>
              <div>
                <p className="text-primary-foreground/80 text-sm">Blood Type</p>
                <p className="font-medium">{patient?.blood_type || "Unknown"}</p>
              </div>
            </div>

            <div>
              <p className="text-primary-foreground/80 text-sm">Date of Birth</p>
              <p className="font-medium">
                {patient?.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : "Not specified"}
              </p>
            </div>
          </div>

          {/* NFC Indicator */}
          <div className="absolute top-4 right-4">
            <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 15c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6zm0-10c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4zm12 4c0 3.31-2.69 6-6 6v2c4.42 0 8-3.58 8-8s-3.58-8-8-8v2c3.31 0 6 2.69 6 6z" />
              </svg>
            </div>
          </div>

          {/* Decorative Pattern */}
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary-foreground/10 rounded-full" />
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary-foreground/5 rounded-full" />
        </CardContent>
      </Card>

      {/* QR Code Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold">QR Code Access</h4>
              <p className="text-sm text-muted-foreground">For quick medical information access</p>
            </div>
            <Button variant="outline" onClick={() => setShowQR(!showQR)}>
              {showQR ? "Hide QR" : "Show QR"}
            </Button>
          </div>

          {showQR && (
            <div className="flex justify-center p-4 bg-muted/50 rounded-lg">
              <QRCodeSVG
                value={JSON.stringify(cardData)}
                size={200}
                bgColor="transparent"
                fgColor="currentColor"
                className="text-foreground"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Information */}
      {patient?.allergies?.length > 0 && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <h4 className="font-semibold text-destructive">Allergies</h4>
            </div>
            <p className="text-sm">{patient.allergies.join(", ")}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
