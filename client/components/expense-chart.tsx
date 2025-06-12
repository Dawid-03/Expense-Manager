"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"]

interface ExpenseChartProps {
  data: any
}

export function ExpenseChart({ data }: ExpenseChartProps) {
  if (!data?.categoryTotals?.expenses || data.categoryTotals.expenses.length === 0) {
    return <div className="flex items-center justify-center h-64 text-gray-500">No expense data available</div>
  }

  const chartData = data.categoryTotals.expenses.map((item: any, index: number) => ({
    name: item.name,
    value: item.total,
    color: COLORS[index % COLORS.length],
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, "Amount"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
