"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface TransactionListProps {
  transactions: any[]
  type: "expense" | "income"
  onUpdate: () => void
}

export function TransactionList({ transactions, type, onUpdate }: TransactionListProps) {
  const { token } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)

  const handleDelete = async (transactionId: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return

    setLoading(transactionId)
    try {
      const endpoint = type === "expense" ? "expenses" : "incomes"
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${endpoint}/${transactionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `${type === "expense" ? "Expense" : "Income"} deleted successfully`,
        })
        onUpdate()
      } else {
        throw new Error("Failed to delete transaction")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${type}`,
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No {type}s found. Add your first {type} to get started!
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge
                variant={type === "expense" ? "destructive" : "default"}
                className={type === "income" ? "bg-green-100 text-green-800" : ""}
              >
                {transaction.category?.name || "Uncategorized"}
              </Badge>
              <span className="text-sm text-gray-500">{format(new Date(transaction.date), "MMM dd, yyyy")}</span>
            </div>
            <h3 className="font-medium text-gray-900">{transaction.description}</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-lg font-bold ${type === "expense" ? "text-red-600" : "text-green-600"}`}>
              ${transaction.amount.toFixed(2)}
            </span>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(transaction.id)}
                disabled={loading === transaction.id}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
