import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EmergencyCard } from "@/components/patient/emergency-card"
import { PatientHeader } from "@/components/patient/patient-header"

export const dynamic = "force-dynamic"

export default async function EmergencyPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  const { data: patient } = await supabase.from("patients").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      <PatientHeader profile={profile} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-destructive mb-2">Emergency Medical Information</h1>
            <p className="text-muted-foreground">Critical medical data for emergency responders</p>
          </div>

          <EmergencyCard patient={patient} profile={profile} />

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              This information is accessible without authentication for emergency situations only
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
