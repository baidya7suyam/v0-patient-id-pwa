"use client"

import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DigitalIDCard } from "./digital-id-card"
import { PatientHeader } from "./patient-header"
import { QuickActions } from "./quick-actions"
import { RewardsOverview } from "./rewards-overview"

interface PatientDashboardProps {
  user: User
  profile: any
  patient: any
  rewards: any
}

export function PatientDashboard({ user, profile, patient, rewards }: PatientDashboardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      <PatientHeader profile={profile} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Digital ID Card */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Your Digital ID Card</h2>
              <DigitalIDCard patient={patient} profile={profile} />
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
              <QuickActions />
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest medical interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Medicine Reminder</p>
                      <p className="text-sm text-muted-foreground">Aspirin 100mg - Taken on time</p>
                    </div>
                    <Badge variant="secondary">Today</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Appointment Scheduled</p>
                      <p className="text-sm text-muted-foreground">Dr. Smith - Cardiology</p>
                    </div>
                    <Badge variant="outline">Tomorrow</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Lab Results Available</p>
                      <p className="text-sm text-muted-foreground">Blood work - Normal ranges</p>
                    </div>
                    <Badge variant="secondary">2 days ago</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Rewards Overview */}
            <RewardsOverview rewards={rewards} />

            {/* Health Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Health Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Blood Type</span>
                  <span className="font-medium">{patient?.blood_type || "Not specified"}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Allergies</span>
                  <span className="font-medium">
                    {patient?.allergies?.length > 0 ? patient.allergies.join(", ") : "None"}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Emergency Contact</span>
                  <span className="font-medium text-sm">{patient?.emergency_contact_name || "Not specified"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Access */}
            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive">Emergency Access</CardTitle>
                <CardDescription>For medical emergencies only</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" className="w-full">
                  Emergency Medical Info
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
