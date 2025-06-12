"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

interface AddTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  defaultType?: "expense" | "income"
}

export function AddTransactionDialog({
  open,
  onOpenChange,
  onSuccess,
  defaultType = "expense",
}: AddTransactionDialogProps) {
  const { token } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState({ expense: [], income: [] })
  const [activeTab, setActiveTab] = useState(defaultType)

  useEffect(() => {
    if (open) {
      fetchCategories()
    }
  }, [open, token])

  const fetchCategories = async () => {
    if (!token) return

    try {
      const [expenseResponse, incomeResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories?type=EXPENSE`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories?type=INCOME`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const expenseCategories = await expenseResponse.json()
      const incomeCategories = await incomeResponse.json()

      setCategories({
        expense: expenseCategories,
        income: incomeCategories,
      })
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, type: "expense" | "income") => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      description: formData.get("description") as string,
      amount: Number.parseFloat(formData.get("amount") as string),
      date: formData.get("date") as string,
      categoryId: formData.get("categoryId") as string,
    }

    try {
      const endpoint = type === "expense" ? "expenses" : "incomes"
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `${type === "expense" ? "Expense" : "Income"} added successfully`,
        })
        onSuccess()
        onOpenChange(false)
        e.currentTarget.reset()
      } else {
        throw new Error("Failed to add transaction")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to add ${type}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>Add a new expense or income to track your finances.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "expense" | "income")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expense" className="text-red-600">
              Expense
            </TabsTrigger>
            <TabsTrigger value="income" className="text-green-600">
              Income
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expense">
            <form onSubmit={(e) => handleSubmit(e, "expense")} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expense-description">Description</Label>
                <Textarea id="expense-description" name="description" placeholder="What did you spend on?" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-amount">Amount</Label>
                <Input id="expense-amount" name="amount" type="number" step="0.01" placeholder="0.00" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-date">Date</Label>
                <Input
                  id="expense-date"
                  name="date"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-category">Category</Label>
                <Select name="categoryId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.expense.map((category: any) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                {loading ? "Adding..." : "Add Expense"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="income">
            <form onSubmit={(e) => handleSubmit(e, "income")} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="income-description">Description</Label>
                <Textarea
                  id="income-description"
                  name="description"
                  placeholder="What income did you receive?"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="income-amount">Amount</Label>
                <Input id="income-amount" name="amount" type="number" step="0.01" placeholder="0.00" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="income-date">Date</Label>
                <Input
                  id="income-date"
                  name="date"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="income-category">Category</Label>
                <Select name="categoryId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.income.map((category: any) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? "Adding..." : "Add Income"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
