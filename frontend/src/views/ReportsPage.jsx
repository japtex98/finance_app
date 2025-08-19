import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Card, CardContent, Grid, Typography } from '@mui/material'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'

export default function ReportsPage() {
    const { data: categories } = useQuery({ queryKey: ['report-categories'], queryFn: () => api.get('/reports/categories') })
    const { data: insights } = useQuery({ queryKey: ['report-insights'], queryFn: () => api.get('/reports/spending-insights') })

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Category Analysis</Typography>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={categories || []}>
                                <XAxis dataKey="category" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="total" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Spending Insights</Typography>
                        <pre style={{ margin: 0 }}>{JSON.stringify(insights, null, 2)}</pre>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    )
} 