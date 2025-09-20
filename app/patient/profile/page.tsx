import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PatientProfile } from "@/components/patient/patient-profile"

export const dynamic = "force-dynamic"

export default async function PatientProfilePage() {
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

  return <PatientProfile user={user} profile={profile} patient={patient} />
}
