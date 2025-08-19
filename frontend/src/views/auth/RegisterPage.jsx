import React, { useState } from 'react'
import { Button, Card, CardContent, Stack, TextField, Typography, Alert } from '@mui/material'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function RegisterPage() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', username: '', email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    function update(field, value) {
        setForm((f) => ({ ...f, [field]: value }))
    }

    async function onSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await register(form)
            navigate('/login')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '60vh' }}>
            <Card sx={{ maxWidth: 480, width: '100%' }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>Register</Typography>
                    <form onSubmit={onSubmit}>
                        <Stack spacing={2}>
                            {error && <Alert severity="error">{error}</Alert>}
                            <TextField label="Name" value={form.name} onChange={(e) => update('name', e.target.value)} required />
                            <TextField label="Username" value={form.username} onChange={(e) => update('username', e.target.value)} required />
                            <TextField label="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
                            <TextField label="Password" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required />
                            <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Registering...' : 'Register'}</Button>
                            <Typography variant="body2">Already have an account? <Link to="/login">Login</Link></Typography>
                        </Stack>
                    </form>
                </CardContent>
            </Card>
        </Stack>
    )
} 