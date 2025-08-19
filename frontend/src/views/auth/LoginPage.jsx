import React, { useState } from 'react'
import { Button, Card, CardContent, Stack, TextField, Typography, Alert } from '@mui/material'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function onSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await login(username, password)
            navigate('/dashboard')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '60vh' }}>
            <Card sx={{ maxWidth: 420, width: '100%' }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>Login</Typography>
                    <form onSubmit={onSubmit}>
                        <Stack spacing={2}>
                            {error && <Alert severity="error">{error}</Alert>}
                            <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                            <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>
                            <Typography variant="body2">Don't have an account? <Link to="/register">Register</Link></Typography>
                        </Stack>
                    </form>
                </CardContent>
            </Card>
        </Stack>
    )
} 