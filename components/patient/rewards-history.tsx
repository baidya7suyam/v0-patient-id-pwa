"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Minus, Star, Trophy } from "lucide-react"

interface PointsTransaction {
  id: string
  points: number
  reason: string
  transaction_type: "earned" | "redeemed"
  created_at: string
  achievement_title?: string
}

export function RewardsHistory() {
  const [transactions, setTransactions] = useState<PointsTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadPointsHistory()
  }, [])

  const loadPointsHistory = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Get patient ID
      const { data: patient } = await supabase.from("patients").select("id").eq("user_id", user.id).single()
      if (!patient) return

      // Get points transactions
      const { data, error } = await supabase
        .from("points_transactions")
        .select("*")
        .eq("patient_id", patient.id)
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error("Error loading points history:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getTransactionIcon = (type: string, reason: string) => {
    if (reason.includes("achievement") || reason.includes("badge")) {
      return <Trophy className="h-4 w-4 text-yellow-600" />
    }
    if (type === "earned") {
      return <Plus className="h-4 w-4 text-green-600" />
    }
    return <Minus className="h-4 w-4 text-red-600" />
  }

  const getTransactionColor = (type: string) => {
    return type === "earned" ? "text-green-600" : "text-red-600"
  }

  const groupTransactionsByDate = (transactions: PointsTransaction[]) => {
    const groups: { [key: string]: PointsTransaction[] } = {}
    transactions.forEach((transaction) => {
      const date = transaction.created_at.split("T")[0]
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(transaction)
    })
    return groups
  }

  const groupedTransactions = groupTransactionsByDate(transactions)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Points History</CardTitle>
        <CardDescription>Track all your points earned and redeemed</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading points history...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No points transactions yet. Start taking your medications to earn points!
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
              <div key={date}>
                <div className="flex items-center space-x-2 mb-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">
                    {new Date(date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </h3>
                  <Badge variant="outline">
                    {dayTransactions.reduce(
                      (sum, t) => sum + (t.transaction_type === "earned" ? t.points : -t.points),
                      0,
                    )}{" "}
                    points
                  </Badge>
                </div>

                <div className="space-y-2 ml-6">
                  {dayTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        {getTransactionIcon(transaction.transaction_type, transaction.reason)}
                        <div>
                          <p className="font-medium">{transaction.reason}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(transaction.created_at)}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`font-semibold ${getTransactionColor(transaction.transaction_type)}`}>
                          {transaction.transaction_type === "earned" ? "+" : "-"}
                          {transaction.points}
                        </span>
                        <Star className="h-4 w-4 text-yellow-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
