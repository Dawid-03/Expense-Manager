"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { AddTransactionDialog } from "@/components/add-transaction-dialog"
import { TransactionList } from "@/components/transaction-list"

export default function IncomesPage() {
  const { token } = useAuth()
  const [incomes, setIncomes] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [filters, setFilters] = useState({
    search: "",
    categoryId: "all", // Updated default value to 'all'
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    fetchIncomes()
    fetchCategories()
  }, [token])

  const fetchIncomes = async () => {
    if (!token) return

    try {
      const queryParams = new URLSearchParams()
      if (filters.categoryId !== "all") queryParams.append("categoryId", filters.categoryId)
      if (filters.startDate) queryParams.append("startDate", filters.startDate)
      if (filters.endDate) queryParams.append("endDate", filters.endDate)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/incomes?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setIncomes(data)
    } catch (error) {
      console.error("Error fetching incomes:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    if (!token) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories?type=INCOME`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    fetchIncomes()
  }

  const filteredIncomes = incomes.filter((income: any) =>
    income.description.toLowerCase().includes(filters.search.toLowerCase()),
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Income</h1>
            <p className="text-gray-600">Track and manage your income sources</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Income
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search income..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filters.categoryId} onValueChange={(value) => handleFilterChange("categoryId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem> {/* Updated value to 'all' */}
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                placeholder="Start date"
              />
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                placeholder="End date"
              />
            </div>
            <div className="mt-4">
              <Button onClick={applyFilters} variant="outline">
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Income List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Income</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <TransactionList transactions={filteredIncomes} type="income" onUpdate={fetchIncomes} />
            )}
          </CardContent>
        </Card>

        <AddTransactionDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onSuccess={fetchIncomes}
          defaultType="income"
        />
      </div>
    </DashboardLayout>
  )
}
