import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import dayjs from 'dayjs'

function GoalForm({ open, onClose, initial }) {
    const queryClient = useQueryClient()
    const isEdit = !!initial?.id
    const [form, setForm] = useState(() => initial || { name: '', targetAmount: '', currentAmount: 0, deadline: dayjs().add(3, 'month').format('YYYY-MM-DD'), type: 'savings', description: '' })

    function update(field, value) {
        setForm((f) => ({ ...f, [field]: value }))
    }

    const mutation = useMutation({
        mutationFn: (data) => isEdit ? api.put(`/goals/${initial.id}`, data) : api.post('/goals', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['goals'] })
            onClose()
        }
    })

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{isEdit ? 'Edit Goal' : 'New Goal'}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField label="Name" value={form.name} onChange={(e) => update('name', e.target.value)} required />
                    <TextField label="Target Amount" value={form.targetAmount} onChange={(e) => update('targetAmount', Number(e.target.value))} type="number" required />
                    <TextField label="Current Amount" value={form.currentAmount} onChange={(e) => update('currentAmount', Number(e.target.value))} type="number" />
                    <TextField label="Deadline" type="date" value={dayjs(form.deadline).format('YYYY-MM-DD')} onChange={(e) => update('deadline', e.target.value)} required InputLabelProps={{ shrink: true }} />
                    <TextField label="Type" select value={form.type} onChange={(e) => update('type', e.target.value)} required>
                        <MenuItem value="savings">Savings</MenuItem>
                        <MenuItem value="debt">Debt</MenuItem>
                        <MenuItem value="investment">Investment</MenuItem>
                    </TextField>
                    <TextField label="Description" value={form.description} onChange={(e) => update('description', e.target.value)} multiline rows={2} />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save'}</Button>
            </DialogActions>
        </Dialog>
    )
}

function ContributeForm({ open, onClose, goal }) {
    const queryClient = useQueryClient()
    const [amount, setAmount] = useState('')
    const [note, setNote] = useState('')
    const mutation = useMutation({
        mutationFn: () => api.post(`/goals/${goal.id}/contribute`, { amount: Number(amount), note }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['goals'] })
            onClose()
        }
    })

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Contribute to {goal?.name}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField label="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                    <TextField label="Note" value={note} onChange={(e) => setNote(e.target.value)} />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={() => mutation.mutate()} disabled={mutation.isPending || !amount}>Contribute</Button>
            </DialogActions>
        </Dialog>
    )
}

export default function GoalsPage() {
    const [openForm, setOpenForm] = useState(false)
    const [editRow, setEditRow] = useState(null)
    const [openContrib, setOpenContrib] = useState(false)
    const [selectedGoal, setSelectedGoal] = useState(null)
    const queryClient = useQueryClient()

    const { data } = useQuery({ queryKey: ['goals'], queryFn: () => api.get('/goals') })

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h5">Goals</Typography>
                <Button variant="contained" onClick={() => { setEditRow(null); setOpenForm(true) }}>New</Button>
            </Stack>
            <Card>
                <CardContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Target</TableCell>
                                <TableCell>Current</TableCell>
                                <TableCell>Deadline</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(data?.items || data || []).map((g) => (
                                <TableRow key={g.id} hover>
                                    <TableCell>{g.id}</TableCell>
                                    <TableCell>{g.name}</TableCell>
                                    <TableCell sx={{ textTransform: 'capitalize' }}>{g.type}</TableCell>
                                    <TableCell>${Number(g.targetAmount).toFixed(2)}</TableCell>
                                    <TableCell>${Number(g.currentAmount).toFixed(2)}</TableCell>
                                    <TableCell>{dayjs(g.deadline).format('YYYY-MM-DD')}</TableCell>
                                    <TableCell>{g.status}</TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={() => { setEditRow(g); setOpenForm(true) }}><EditIcon /></IconButton>
                                        <IconButton color="primary" onClick={() => { setSelectedGoal(g); setOpenContrib(true) }}><AddIcon /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <GoalForm open={openForm} onClose={() => setOpenForm(false)} initial={editRow} />
            <ContributeForm open={openContrib} onClose={() => setOpenContrib(false)} goal={selectedGoal} />
        </Box>
    )
} 