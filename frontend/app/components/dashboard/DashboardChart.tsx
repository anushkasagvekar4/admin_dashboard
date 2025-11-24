"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

interface DashboardChartProps {
  data: RevenueData[];
  type?: 'revenue' | 'orders';
  period?: string;
}

export function RevenueChart({ data, type = 'revenue', period = 'week' }: DashboardChartProps) {
  const formatXAxis = (tickItem: string) => {
    if (period === 'week') {
      const date = new Date(tickItem);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else if (period === 'month') {
      const date = new Date(tickItem);
      return date.toLocaleDateString('en-US', { day: 'numeric' });
    }
    return tickItem;
  };

  const formatYAxis = (value: number) => {
    if (type === 'revenue') {
      return `₹${(value / 1000).toFixed(0)}k`;
    }
    return value.toString();
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      {type === 'revenue' ? (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatXAxis}
            tick={{ fontSize: 12 }}
            stroke="#888"
          />
          <YAxis 
            tickFormatter={formatYAxis}
            tick={{ fontSize: 12 }}
            stroke="#888"
          />
          <Tooltip 
            formatter={(value: number) => [
              type === 'revenue' ? `₹${value.toLocaleString()}` : value,
              type === 'revenue' ? 'Revenue' : 'Orders'
            ]}
            labelFormatter={(label) => {
              const date = new Date(label);
              return date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              });
            }}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '12px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      ) : (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatXAxis}
            tick={{ fontSize: 12 }}
            stroke="#888"
          />
          <YAxis 
            tickFormatter={formatYAxis}
            tick={{ fontSize: 12 }}
            stroke="#888"
          />
          <Tooltip 
            formatter={(value: number) => [
              value.toString(),
              'Orders'
            ]}
            labelFormatter={(label) => {
              const date = new Date(label);
              return date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              });
            }}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '12px'
            }}
          />
          <Bar 
            dataKey="orders" 
            fill="#10b981" 
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
}
