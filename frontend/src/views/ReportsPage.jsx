import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Card, CardContent, Grid, Typography, FormControl, InputLabel, Select, MenuItem, Box, Chip, OutlinedInput } from '@mui/material'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'

export default function ReportsPage() {
    const [selectedCategories, setSelectedCategories] = useState([])

    const { data: categories } = useQuery({ queryKey: ['report-categories'], queryFn: () => api.get('/reports/categories') })
    const { data: insights } = useQuery({ queryKey: ['report-insights'], queryFn: () => api.get('/reports/spending-insights') })
    const { data: allCategories } = useQuery({ queryKey: ['categories-all'], queryFn: () => api.get('/categories', { limit: 1000 }) })

    const categoryChartData = useMemo(() => {
        if (!categories) return []

        const allCategoryData = Array.isArray(categories)
            ? categories
            : ([...(categories?.incomeCategories || []), ...(categories?.expenseCategories || [])]
                .map((c) => ({ category: `${c.category_name} (${c.type})`, total: Number(c.total), categoryId: c.category_id })))

        if (selectedCategories.length === 0) {
            return allCategoryData
        }

        return allCategoryData.filter(item => {
            // Extract category name from "Category Name (type)" format
            const categoryName = item.category.split(' (')[0]
            return selectedCategories.includes(categoryName)
        })
    }, [categories, selectedCategories])

    const earned = Number(insights?.spendingPatterns?.totalEarned || 0)
    const spent = Number(insights?.spendingPatterns?.totalSpent || 0)
    const savingsRate = Number(insights?.spendingPatterns?.savingsRate || 0)

    const handleCategoryChange = (event) => {
        const value = event.target.value
        setSelectedCategories(typeof value === 'string' ? value.split(',') : value)
    }

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Category Analysis</Typography>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Filter Categories</InputLabel>
                            <Select
                                multiple
                                value={selectedCategories}
                                onChange={handleCategoryChange}
                                input={<OutlinedInput label="Filter Categories" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} size="small" />
                                        ))}
                                    </Box>
                                )}
                            >
                                {allCategories?.map((category) => (
                                    <MenuItem key={category.id} value={category.name}>
                                        {category.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={categoryChartData || []}>
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
                        <Typography>Earned: ${earned.toFixed(2)}</Typography>
                        <Typography>Spent: ${spent.toFixed(2)}</Typography>
                        <Typography>Savings rate: {savingsRate}%</Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    )
} 