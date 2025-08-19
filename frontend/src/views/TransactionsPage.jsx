import React, { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import dayjs from 'dayjs'

function TransactionForm({ open, onClose, initial }) {
    const queryClient = useQueryClient()
    const isEdit = !!initial?.id
    const [form, setForm] = useState(() => initial || { categoryId: '', amount: '', type: 'expense', date: dayjs().format('YYYY-MM-DD'), note: '' })

    function update(field, value) {
        setForm((f) => ({ ...f, [field]: value }))
    }

    const { data: categories } = useQuery({
        queryKey: ['categories-all'],
        queryFn: () => api.get('/categories', { limit: 1000 })
    })

    const mutation = useMutation({
        mutationFn: (data) => isEdit ? api.put(`/transactions/${initial.id}`, data) : api.post('/transactions', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] })
            onClose()
        }
    })

    const categoryItems = (categories?.items || categories || []).map((c) => ({ id: c.id, name: c.name }))

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{isEdit ? 'Edit Transaction' : 'New Transaction'}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField label="Category" select value={form.categoryId} onChange={(e) => update('categoryId', Number(e.target.value))} required>
                        {categoryItems.map((c) => (
                            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                        ))}
                    </TextField>
                    <TextField label="Amount" value={form.amount} onChange={(e) => update('amount', Number(e.target.value))} type="number" required />
                    <TextField label="Type" select value={form.type} onChange={(e) => update('type', e.target.value)} required>
                        <MenuItem value="income">Income</MenuItem>
                        <MenuItem value="expense">Expense</MenuItem>
                    </TextField>
                    <TextField label="Date" type="date" value={dayjs(form.date).format('YYYY-MM-DD')} onChange={(e) => update('date', e.target.value)} required InputLabelProps={{ shrink: true }} />
                    <TextField label="Note" value={form.note} onChange={(e) => update('note', e.target.value)} multiline rows={3} />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save'}</Button>
            </DialogActions>
        </Dialog>
    )
}

export default function TransactionsPage() {
    const [openForm, setOpenForm] = useState(false)
    const [editRow, setEditRow] = useState(null)
    const queryClient = useQueryClient()

    const [filters, setFilters] = useState({ search: '', type: '', categoryId: '', startDate: '', endDate: '' })

    const { data } = useQuery({
        queryKey: ['transactions', filters],
        queryFn: () => api.get('/transactions', {
            // backend supports categoryIds, startDate, endDate; no search so keep client-side for note
            categoryIds: filters.categoryId || undefined,
            startDate: filters.startDate || undefined,
            endDate: filters.endDate || undefined
        })
    })

    const { data: categories } = useQuery({ queryKey: ['categories-all'], queryFn: () => api.get('/categories', { limit: 1000 }) })
    const categoryMap = useMemo(() => Object.fromEntries(((categories?.items || categories || [])).map((c) => [c.id, c.name])), [categories])

    const del = useMutation({
        mutationFn: (id) => api.delete(`/transactions/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] })
    })

    const rows = (data?.items || data || []).filter((t) => {
        if (filters.type && t.type !== filters.type) return false
        if (filters.search && !String(t.note || '').toLowerCase().includes(filters.search.toLowerCase())) return false
        return true
    })

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h5">Transactions</Typography>
                <Button variant="contained" onClick={() => { setEditRow(null); setOpenForm(true) }}>New</Button>
            </Stack>

            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                            <TextField fullWidth label="Search note" value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <TextField select fullWidth label="Type" value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}>
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="income">Income</MenuItem>
                                <MenuItem value="expense">Expense</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField select fullWidth label="Category" value={filters.categoryId} onChange={(e) => setFilters((f) => ({ ...f, categoryId: e.target.value }))}>
                                <MenuItem value="">All</MenuItem>
                                {((categories?.items || categories || [])).map((c) => (
                                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <TextField fullWidth type="date" label="Start date" value={filters.startDate} onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <TextField fullWidth type="date" label="End date" value={filters.endDate} onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))} InputLabelProps={{ shrink: true }} />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Note</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((t) => (
                                <TableRow key={t.id} hover>
                                    <TableCell>{t.id}</TableCell>
                                    <TableCell>{dayjs(t.date).format('YYYY-MM-DD')}</TableCell>
                                    <TableCell sx={{ textTransform: 'capitalize' }}>{t.type}</TableCell>
                                    <TableCell>${Number(t.amount).toFixed(2)}</TableCell>
                                    <TableCell>{categoryMap[t.categoryId] || t.categoryId}</TableCell>
                                    <TableCell>{t.note}</TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={() => { setEditRow(t); setOpenForm(true) }}><EditIcon /></IconButton>
                                        <IconButton color="error" onClick={() => del.mutate(t.id)} disabled={del.isPending}><DeleteIcon /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <TransactionForm open={openForm} onClose={() => setOpenForm(false)} initial={editRow} />
        </Box>
    )
} 