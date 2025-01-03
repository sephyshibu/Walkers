import React from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export function SalesChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis 
          dataKey="date" 
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₹${value}`}
        />
        <Tooltip />
        <Line type="monotone" dataKey="totalSalesAmount" stroke="#8884d8" name="Total Sales" />
        <Line type="monotone" dataKey="totalDiscount" stroke="#82ca9d" name="Total Discount" />
        <Line type="monotone" dataKey="netAmount" stroke="#ffc658" name="Net Amount" />
      </LineChart>
    </ResponsiveContainer>
  );
}

