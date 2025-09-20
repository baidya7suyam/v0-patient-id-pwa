import { createClient } from "@/lib/supabase/server"
import { EmergencyCard } from "@/components/patient/emergency-card"
import { notFound } from "next/navigation"

interface EmergencyPageProps {
  params: Promise<{ id: string }>
}

export default async function EmergencyAccessPage({ params }: EmergencyPageProps) {
  const { id } = await params
  const supabase = createClient()

  // Public access - no authentication required for emergency
  const { data: patient } = await supabase
    .from("patients")
    .select(`
      *,
      profile:profiles!patients_id_fkey(*)
    `)
    .or(`patient_id.eq.${id},nfc_id.eq.${id},qr_code.eq.${id}`)
    .single()

  if (!patient) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-destructive/5 via-background to-destructive/10">
      <header className="bg-destructive text-destructive-foreground">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold">EMERGENCY MEDICAL ACCESS</h1>
            <p className="text-destructive-foreground/80">Critical Patient Information</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <EmergencyCard patient={patient} profile={patient.profile} />

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              This information is accessible without authentication for emergency situations only. Unauthorized access
              is prohibited and may be subject to legal action.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
