"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
  newShops: number;
  newCustomers: number;
}

interface SuperAdminChartProps {
  data: RevenueData[];
  type?: 'revenue' | 'orders' | 'shops' | 'customers' | 'combined';
  period?: string;
}

export function SuperAdminRevenueChart({ data, type = 'revenue', period = 'week' }: SuperAdminChartProps) {
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

  const getChartColor = () => {
    switch (type) {
      case 'revenue': return '#3b82f6';
      case 'orders': return '#10b981';
      case 'shops': return '#8b5cf6';
      case 'customers': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  const getTooltipLabel = (label: string) => {
    const date = new Date(label);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      {type === 'revenue' ? (
        <AreaChart data={data}>
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
              type === 'revenue' ? 'Revenue' : 'Count'
            ]}
            labelFormatter={getTooltipLabel}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '12px'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke={getChartColor()} 
            fill={getChartColor()}
            fillOpacity={0.1}
            strokeWidth={2}
          />
        </AreaChart>
      ) : type === 'orders' ? (
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
            labelFormatter={getTooltipLabel}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '12px'
            }}
          />
          <Bar 
            dataKey="orders" 
            fill={getChartColor()} 
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      ) : type === 'combined' ? (
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
            labelFormatter={getTooltipLabel}
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
            name="Revenue"
          />
          <Line 
            type="monotone" 
            dataKey="orders" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 4 }}
            name="Orders"
          />
          <Line 
            type="monotone" 
            dataKey="newShops" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            dot={{ fill: '#8b5cf6', r: 4 }}
            name="New Shops"
          />
          <Line 
            type="monotone" 
            dataKey="newCustomers" 
            stroke="#f59e0b" 
            strokeWidth={2}
            dot={{ fill: '#f59e0b', r: 4 }}
            name="New Customers"
          />
        </LineChart>
      ) : (
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
              value.toString(),
              type === 'shops' ? 'New Shops' : 'New Customers'
            ]}
            labelFormatter={getTooltipLabel}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '12px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey={type === 'shops' ? 'newShops' : 'newCustomers'} 
            stroke={getChartColor()} 
            strokeWidth={2}
            dot={{ fill: getChartColor(), r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      )}
    </ResponsiveContainer>
  );
}
