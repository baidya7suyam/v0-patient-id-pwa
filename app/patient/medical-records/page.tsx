import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MedicalRecords } from "@/components/patient/medical-records"

export const dynamic = "force-dynamic"

export default async function MedicalRecordsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "patient") {
    redirect("/auth/login")
  }

  // Get medical records with doctor information
  const { data: medicalRecords } = await supabase
    .from("medical_records")
    .select(`
      *,
      doctor:profiles!medical_records_doctor_id_fkey(full_name)
    `)
    .eq("patient_id", user.id)
    .order("visit_date", { ascending: false })

  // Get prescriptions with doctor information
  const { data: prescriptions } = await supabase
    .from("prescriptions")
    .select(`
      *,
      doctor:profiles!prescriptions_doctor_id_fkey(full_name)
    `)
    .eq("patient_id", user.id)
    .order("created_at", { ascending: false })

  // Get appointments with doctor information
  const { data: appointments } = await supabase
    .from("appointments")
    .select(`
      *,
      doctor:profiles!appointments_doctor_id_fkey(full_name)
    `)
    .eq("patient_id", user.id)
    .order("appointment_date", { ascending: false })

  return (
    <MedicalRecords
      profile={profile}
      medicalRecords={medicalRecords || []}
      prescriptions={prescriptions || []}
      appointments={appointments || []}
    />
  )
}
