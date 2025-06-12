"use client"

import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface RecentTransactionsProps {
  transactions: any[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return <div className="text-center py-8 text-gray-500">No recent transactions</div>
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <Badge
              variant={transaction.type === "expense" ? "destructive" : "default"}
              className={transaction.type === "income" ? "bg-green-100 text-green-800" : ""}
            >
              {transaction.category?.name || "Uncategorized"}
            </Badge>
            <div>
              <p className="font-medium text-sm">{transaction.description}</p>
              <p className="text-xs text-gray-500">{format(new Date(transaction.date), "MMM dd, yyyy")}</p>
            </div>
          </div>
          <span className={`font-bold ${transaction.type === "expense" ? "text-red-600" : "text-green-600"}`}>
            {transaction.type === "expense" ? "-" : "+"}${transaction.amount.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  )
}
