import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { RewardsCenter } from "@/components/patient/rewards-center"

export const dynamic = "force-dynamic"

export default async function RewardsPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <RewardsCenter />
}
