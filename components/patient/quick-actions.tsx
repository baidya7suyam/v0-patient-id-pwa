"use client"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export function QuickActions() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Link href="/patient/medicine-tracker">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Medicine Tracker</h3>
            <p className="text-sm text-muted-foreground">Track your daily medications</p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/patient/appointments">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 112 0v1m-6 0h12l-1 12a2 2 0 01-2 2H7a2 2 0 01-2-2L4 7z"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Book Appointment</h3>
            <p className="text-sm text-muted-foreground">Schedule with your doctor</p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/patient/medical-records">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-chart-3/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-chart-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Medical Records</h3>
            <p className="text-sm text-muted-foreground">View your health history</p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/patient/rewards">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-chart-4/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-chart-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Health Rewards</h3>
            <p className="text-sm text-muted-foreground">Earn points for healthy habits</p>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
