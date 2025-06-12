"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider"
import { ExpenseChart } from "@/components/expense-chart"
import { BalanceChart } from "@/components/balance-chart"
import { CategoryBreakdown } from "@/components/category-breakdown"

export default function ReportsPage() {
  const { token } = useAuth()
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })

  useEffect(() => {
    fetchReportData()
  }, [token, selectedMonth])

  const fetchReportData = async () => {
    if (!token) return

    try {
      const [year, month] = selectedMonth.split("-")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reports/monthly-totals?year=${year}&month=${month}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      const data = await response.json()
      setReportData(data)
    } catch (error) {
      console.error("Error fetching report data:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateMonthOptions = () => {
    const options = []
    const currentDate = new Date()

    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const label = date.toLocaleDateString("en-US", { year: "numeric", month: "long" })
      options.push({ value, label })
    }

    return options
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
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600">Analyze your financial patterns</p>
          </div>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {generateMonthOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Total Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${reportData?.totalIncomes?.toFixed(2) || "0.00"}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${reportData?.totalExpenses?.toFixed(2) || "0.00"}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">Net Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-3xl font-bold ${
                  (reportData?.totalIncomes || 0) - (reportData?.totalExpenses || 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                ${((reportData?.totalIncomes || 0) - (reportData?.totalExpenses || 0)).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>Expenses by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ExpenseChart data={reportData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Balance</CardTitle>
              <CardDescription>Your balance throughout the month</CardDescription>
            </CardHeader>
            <CardContent>
              <BalanceChart data={reportData?.dailyBalances || []} />
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryBreakdown
            title="Expense Categories"
            data={reportData?.categoryTotals?.expenses || []}
            type="expense"
          />
          <CategoryBreakdown title="Income Categories" data={reportData?.categoryTotals?.incomes || []} type="income" />
        </div>
      </div>
    </DashboardLayout>
  )
}
