import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PatientDashboard } from "@/components/patient/patient-dashboard"

export const dynamic = "force-dynamic"

export default async function PatientDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get patient profile and data
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "patient") {
    redirect("/auth/login")
  }

  const { data: patient } = await supabase.from("patients").select("*").eq("id", user.id).single()

  const { data: rewards } = await supabase.from("rewards").select("*").eq("patient_id", user.id).single()

  return <PatientDashboard user={user} profile={profile} patient={patient} rewards={rewards} />
}
