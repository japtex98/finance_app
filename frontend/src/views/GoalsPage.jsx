import React, { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, DialogContentText } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import HistoryIcon from '@mui/icons-material/History'
import DeleteIcon from '@mui/icons-material/Delete'
import dayjs from 'dayjs'

function GoalForm({ open, onClose, initial }) {
    const queryClient = useQueryClient()
    const isEdit = !!initial?.id
    const [form, setForm] = useState(() => initial || { name: '', targetAmount: '', currentAmount: 0, deadline: dayjs().add(3, 'month').format('YYYY-MM-DD'), type: 'savings', description: '' })

    useEffect(() => {
        if (open) {
            const normalized = initial ? {
                ...initial,
                deadline: initial.deadline ? dayjs(initial.deadline).format('YYYY-MM-DD') : dayjs().add(3, 'month').format('YYYY-MM-DD')
            } : { name: '', targetAmount: '', currentAmount: 0, deadline: dayjs().add(3, 'month').format('YYYY-MM-DD'), type: 'savings', description: '' }
            setForm(normalized)
        }
    }, [initial, open])

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

    function onSubmit() {
        const payload = {
            ...form,
            deadline: form.deadline ? dayjs(form.deadline).format('YYYY-MM-DD') : undefined
        }
        mutation.mutate(payload)
    }

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
                <Button variant="contained" onClick={onSubmit} disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save'}</Button>
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

function EditContributionDialog({ open, onClose, contribution, goalId }) {
    const queryClient = useQueryClient()
    const [form, setForm] = useState({ amount: '', date: '' })

    useEffect(() => {
        if (open && contribution) {
            setForm({
                amount: contribution.amount,
                date: dayjs(contribution.date).format('YYYY-MM-DD')
            })
        }
    }, [open, contribution])

    const mutation = useMutation({
        mutationFn: (data) => api.put(`/goals/${goalId}/contributions/${contribution.id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['goal-contributions', goalId] })
            queryClient.invalidateQueries({ queryKey: ['goals'] })
            onClose()
        }
    })

    function onSubmit() {
        const payload = {
            amount: Number(form.amount),
            date: form.date ? dayjs(form.date).format('YYYY-MM-DD') : undefined
        }
        mutation.mutate(payload)
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Edit Contribution</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        label="Amount"
                        type="number"
                        value={form.amount}
                        onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
                        required
                    />
                    <TextField
                        label="Date"
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                        required
                        InputLabelProps={{ shrink: true }}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={onSubmit} disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save'}</Button>
            </DialogActions>
        </Dialog>
    )
}

function DeleteContributionDialog({ open, onClose, contribution, goalId }) {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: () => api.delete(`/goals/${goalId}/contributions/${contribution.id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['goal-contributions', goalId] })
            queryClient.invalidateQueries({ queryKey: ['goals'] })
            onClose()
        }
    })

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Delete Contribution</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to delete this contribution of ${contribution?.amount} from {dayjs(contribution?.date).format('YYYY-MM-DD')}?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" color="error" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
                    {mutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

function HistoryDialog({ open, onClose, goal }) {
    const { data, isLoading, error } = useQuery({
        queryKey: ['goal-contributions', goal?.id],
        queryFn: () => api.get(`/goals/${goal.id}/contributions`),
        enabled: open && !!goal?.id
    })

    const [editingContribution, setEditingContribution] = useState(null)
    const [deletingContribution, setDeletingContribution] = useState(null)

    const rows = Array.isArray(data) ? data : []

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
                <DialogTitle>Contribution History — {goal?.name}</DialogTitle>
                <DialogContent>
                    {isLoading ? (
                        <Typography sx={{ mt: 2 }}>Loading...</Typography>
                    ) : error ? (
                        <Typography color="error" sx={{ mt: 2 }}>{String(error.message || error)}</Typography>
                    ) : rows.length === 0 ? (
                        <Typography sx={{ mt: 2 }}>No contributions yet.</Typography>
                    ) : (
                        <Table size="small" sx={{ mt: 1 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((t) => (
                                    <TableRow key={t.id}>
                                        <TableCell>{dayjs(t.date).format('YYYY-MM-DD')}</TableCell>
                                        <TableCell align="right">${Number(t.amount).toFixed(2)}</TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                onClick={() => setEditingContribution(t)}
                                                color="primary"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => setDeletingContribution(t)}
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>

            <EditContributionDialog
                open={!!editingContribution}
                onClose={() => setEditingContribution(null)}
                contribution={editingContribution}
                goalId={goal?.id}
            />

            <DeleteContributionDialog
                open={!!deletingContribution}
                onClose={() => setDeletingContribution(null)}
                contribution={deletingContribution}
                goalId={goal?.id}
            />
        </>
    )
}

export default function GoalsPage() {
    const [openForm, setOpenForm] = useState(false)
    const [editRow, setEditRow] = useState(null)
    const [openContrib, setOpenContrib] = useState(false)
    const [selectedGoal, setSelectedGoal] = useState(null)
    const [openHistory, setOpenHistory] = useState(false)
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
                                        <IconButton color="primary" onClick={() => { setEditRow(g); setOpenForm(true) }}><EditIcon /></IconButton>
                                        <IconButton color="primary" onClick={() => { setSelectedGoal(g); setOpenContrib(true) }}><AccountBalanceWalletIcon /></IconButton>
                                        <IconButton color="primary" onClick={() => { setSelectedGoal(g); setOpenHistory(true) }}><HistoryIcon /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <GoalForm open={openForm} onClose={() => setOpenForm(false)} initial={editRow} />
            <ContributeForm open={openContrib} onClose={() => setOpenContrib(false)} goal={selectedGoal} />
            <HistoryDialog open={openHistory} onClose={() => setOpenHistory(false)} goal={selectedGoal} />
        </Box>
    )
} 