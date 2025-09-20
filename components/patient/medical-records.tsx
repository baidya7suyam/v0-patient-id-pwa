"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PatientHeader } from "./patient-header"
import { format } from "date-fns"

interface MedicalRecordsProps {
  profile: any
  medicalRecords: any[]
  prescriptions: any[]
  appointments: any[]
}

export function MedicalRecords({ profile, medicalRecords, prescriptions, appointments }: MedicalRecordsProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      <PatientHeader profile={profile} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Medical Records</h1>
            <p className="text-muted-foreground">Your complete medical history and healthcare information</p>
          </div>

          <Tabs defaultValue="records" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="records">Medical Records</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
            </TabsList>

            <TabsContent value="records" className="space-y-4">
              {medicalRecords.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Medical Records</h3>
                    <p className="text-muted-foreground">
                      Your medical records will appear here after your first visit.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                medicalRecords.map((record) => (
                  <Card key={record.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {format(new Date(record.visit_date), "MMMM d, yyyy")}
                          </CardTitle>
                          <CardDescription>Dr. {record.doctor?.full_name || "Unknown Doctor"}</CardDescription>
                        </div>
                        <Badge variant="secondary">{format(new Date(record.visit_date), "h:mm a")}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {record.diagnosis && (
                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground mb-1">DIAGNOSIS</h4>
                          <p>{record.diagnosis}</p>
                        </div>
                      )}
                      {record.symptoms && (
                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground mb-1">SYMPTOMS</h4>
                          <p>{record.symptoms}</p>
                        </div>
                      )}
                      {record.treatment && (
                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground mb-1">TREATMENT</h4>
                          <p>{record.treatment}</p>
                        </div>
                      )}
                      {record.notes && (
                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground mb-1">NOTES</h4>
                          <p className="text-sm text-muted-foreground">{record.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="prescriptions" className="space-y-4">
              {prescriptions.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Prescriptions</h3>
                    <p className="text-muted-foreground">
                      Your prescriptions will appear here when prescribed by your doctor.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                prescriptions.map((prescription) => (
                  <Card key={prescription.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{prescription.medication_name}</CardTitle>
                          <CardDescription>
                            Prescribed by Dr. {prescription.doctor?.full_name || "Unknown Doctor"}
                          </CardDescription>
                        </div>
                        <Badge variant={prescription.is_active ? "default" : "secondary"}>
                          {prescription.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground mb-1">DOSAGE</h4>
                          <p>{prescription.dosage}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground mb-1">FREQUENCY</h4>
                          <p>{prescription.frequency}</p>
                        </div>
                      </div>
                      {prescription.duration && (
                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground mb-1">DURATION</h4>
                          <p>{prescription.duration}</p>
                        </div>
                      )}
                      {prescription.instructions && (
                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground mb-1">INSTRUCTIONS</h4>
                          <p className="text-sm">{prescription.instructions}</p>
                        </div>
                      )}
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        {prescription.start_date && (
                          <span>Started: {format(new Date(prescription.start_date), "MMM d, yyyy")}</span>
                        )}
                        {prescription.end_date && (
                          <span>Ends: {format(new Date(prescription.end_date), "MMM d, yyyy")}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="appointments" className="space-y-4">
              {appointments.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 112 0v1m-6 0h12l-1 12a2 2 0 01-2 2H7a2 2 0 01-2-2L4 7z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Appointments</h3>
                    <p className="text-muted-foreground">Your appointment history will appear here.</p>
                  </CardContent>
                </Card>
              ) : (
                appointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {format(new Date(appointment.appointment_date), "MMMM d, yyyy 'at' h:mm a")}
                          </CardTitle>
                          <CardDescription>Dr. {appointment.doctor?.full_name || "Unknown Doctor"}</CardDescription>
                        </div>
                        <Badge
                          variant={
                            appointment.status === "completed"
                              ? "default"
                              : appointment.status === "cancelled"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">DURATION</h4>
                        <p>{appointment.duration_minutes} minutes</p>
                      </div>
                      {appointment.reason && (
                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground mb-1">REASON</h4>
                          <p>{appointment.reason}</p>
                        </div>
                      )}
                      {appointment.notes && (
                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground mb-1">NOTES</h4>
                          <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
