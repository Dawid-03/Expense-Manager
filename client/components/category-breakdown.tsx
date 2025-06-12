"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface CategoryBreakdownProps {
  title: string
  data: any[]
  type: "expense" | "income"
}

export function CategoryBreakdown({ title, data, type }: CategoryBreakdownProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className={type === "expense" ? "text-red-600" : "text-green-600"}>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">No data available</p>
        </CardContent>
      </Card>
    )
  }

  const total = data.reduce((sum, item) => sum + item.total, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className={type === "expense" ? "text-red-600" : "text-green-600"}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = total > 0 ? (item.total / total) * 100 : 0
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm text-gray-600">
                    ${item.total.toFixed(2)} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            )
          })}
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center font-bold">
              <span>Total</span>
              <span className={type === "expense" ? "text-red-600" : "text-green-600"}>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
