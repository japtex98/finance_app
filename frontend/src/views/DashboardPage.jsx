import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Card, CardContent, Grid, Typography } from '@mui/material'
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts'

export default function DashboardPage() {
    const { data: incomeExpense } = useQuery({
        queryKey: ['income-expense'],
        queryFn: () => api.get('/reports/income-expense')
    })

    const { data: monthlyTrends } = useQuery({
        queryKey: ['monthly-trends'],
        queryFn: () => api.get('/reports/monthly-trends')
    })

    const income = incomeExpense?.income || 0
    const expense = incomeExpense?.expense || 0
    const balance = income - expense

    const pieData = [
        { name: 'Income', value: income },
        { name: 'Expense', value: expense }
    ]
    const colors = ['#4caf50', '#f44336']

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Income</Typography>
                        <Typography variant="h4">${income.toFixed(2)}</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Expense</Typography>
                        <Typography variant="h4">${expense.toFixed(2)}</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Balance</Typography>
                        <Typography variant="h4">${balance.toFixed(2)}</Typography>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Income vs Expense</Typography>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie dataKey="value" data={pieData} outerRadius={90} label>
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                    ))}
                                </Pie>
                                <Legend />
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Monthly Trends</Typography>
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={monthlyTrends || []} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="income" stroke="#4caf50" />
                                <Line type="monotone" dataKey="expense" stroke="#f44336" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    )
} 