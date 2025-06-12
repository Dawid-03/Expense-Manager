"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format } from "date-fns"

interface BalanceChartProps {
  data: any[]
}

export function BalanceChart({ data }: BalanceChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-gray-500">No balance data available</div>
  }

  const chartData = data.map((item) => ({
    ...item,
    formattedDate: format(new Date(item.date), "MMM dd"),
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="formattedDate" />
        <YAxis />
        <Tooltip
          formatter={(value) => [`$${Number(value).toFixed(2)}`, "Balance"]}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
