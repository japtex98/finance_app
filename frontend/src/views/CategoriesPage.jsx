import React, { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, Grid } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

function CategoryForm({ open, onClose, initial }) {
    const queryClient = useQueryClient()
    const isEdit = !!initial?.id
    const [form, setForm] = useState(() => initial || { name: '' })

    useEffect(() => {
        if (open) {
            setForm(initial || { name: '' })
        }
    }, [initial, open])

    function update(field, value) {
        setForm((f) => ({ ...f, [field]: value }))
    }

    const mutation = useMutation({
        mutationFn: (data) => isEdit ? api.put(`/categories/${initial.id}`, data) : api.post('/categories', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            onClose()
        }
    })

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{isEdit ? 'Edit Category' : 'New Category'}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField label="Name" value={form.name} onChange={(e) => update('name', e.target.value)} required />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save'}</Button>
            </DialogActions>
        </Dialog>
    )
}

export default function CategoriesPage() {
    const [openForm, setOpenForm] = useState(false)
    const [editRow, setEditRow] = useState(null)
    const queryClient = useQueryClient()

    const [filters, setFilters] = useState({ search: '' })

    const { data } = useQuery({ queryKey: ['categories'], queryFn: () => api.get('/categories', { limit: 1000 }) })

    const del = useMutation({
        mutationFn: (id) => api.delete(`/categories/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] })
    })

    const rows = (data?.items || data || []).filter((c) => {
        if (filters.search && !String(c.name || '').toLowerCase().includes(filters.search.toLowerCase())) return false
        return true
    })

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h5">Categories</Typography>
                <Button variant="contained" onClick={() => { setEditRow(null); setOpenForm(true) }}>New</Button>
            </Stack>

            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Search name" value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
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
                                <TableCell>Name</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((c) => (
                                <TableRow key={c.id} hover>
                                    <TableCell>{c.id}</TableCell>
                                    <TableCell>{c.name}</TableCell>
                                    <TableCell align="right">
                                        <IconButton color="primary" onClick={() => { setEditRow(c); setOpenForm(true) }}><EditIcon /></IconButton>
                                        <IconButton color="error" onClick={() => del.mutate(c.id)} disabled={del.isPending}><DeleteIcon /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <CategoryForm open={openForm} onClose={() => setOpenForm(false)} initial={editRow} />
        </Box>
    )
} 