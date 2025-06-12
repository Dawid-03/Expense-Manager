"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { AddTransactionDialog } from "@/components/add-transaction-dialog"
import { RecentTransactions } from "@/components/recent-transactions"
import { ExpenseChart } from "@/components/expense-chart"

interface DashboardData {
  totalExpenses: number
  totalIncomes: number
  balance: number
  recentTransactions: any[]
  monthlyData: any
}

export default function DashboardPage() {
  const { token } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [token])

  const fetchDashboardData = async () => {
    if (!token) return

    try {
      const currentDate = new Date()
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1

      // Fetch monthly report
      const reportResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reports/monthly-totals?year=${year}&month=${month}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      const reportData = await reportResponse.json()

      // Fetch recent expenses and incomes
      const [expensesResponse, incomesResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/expenses`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/incomes`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const expenses = await expensesResponse.json()
      const incomes = await incomesResponse.json()

      // Combine and sort recent transactions
      const allTransactions = [
        ...expenses.map((e: any) => ({ ...e, type: "expense" })),
        ...incomes.map((i: any) => ({ ...i, type: "income" })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setData({
        totalExpenses: reportData.totalExpenses || 0,
        totalIncomes: reportData.totalIncomes || 0,
        balance: (reportData.totalIncomes || 0) - (reportData.totalExpenses || 0),
        recentTransactions: allTransactions.slice(0, 5),
        monthlyData: reportData,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Overview of your financial activity</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${data?.totalIncomes.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${data?.totalExpenses.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${data?.balance && data.balance >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                ${data?.balance.toFixed(2) || "0.00"}
              </div>
              <p className="text-xs text-muted-foreground">Current month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Overview</CardTitle>
              <CardDescription>Your expenses by category this month</CardDescription>
            </CardHeader>
            <CardContent>
              <ExpenseChart data={data?.monthlyData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest financial activity</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentTransactions transactions={data?.recentTransactions || []} />
            </CardContent>
          </Card>
        </div>

        <AddTransactionDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSuccess={fetchDashboardData} />
      </div>
    </DashboardLayout>
  )
}
