import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MedicationManager } from "@/components/patient/medication-manager"

export const dynamic = "force-dynamic"

export default async function MedicationsPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <MedicationManager />
}
